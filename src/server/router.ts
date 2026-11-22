import type { IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { APP_CONFIG } from '@/constants/config';
import type { UserProfile } from '@/types/api';
import { hashPassword, verifyPassword } from './auth';
import { sseManager } from './events';
import {
  resolveFailurePointFromHeader,
  StorageError,
} from './failureInjection';
import { defaultStorage } from './storage';

const activeSessions = new Map<string, UserProfile>();

const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

// Populates initial session tokens for pre-seeded users
export function initializeSessionTokens(): void {
  const users = defaultStorage.listUsersByRole();
  for (const user of users) {
    activeSessions.set(`token_${user.id}`, user);
  }
}
initializeSessionTokens();

// Generates an access token and registers the active user session
export function createSession(user: UserProfile): string {
  const token = `token_${user.id}_${Date.now()}`;
  activeSessions.set(token, user);
  return token;
}

// Invalidates session on sign-out
export function removeSession(token: string): void {
  activeSessions.delete(token);
}

// Resolves user strictly from Authorization Bearer token header for REST endpoints
function authenticateBearerRequest(req: IncomingMessage): UserProfile | undefined {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return undefined;
  }
  const token = authHeader.substring(7).trim();
  return activeSessions.get(token);
}

// Resolves user from cookie or Bearer token specifically for real-time event stream
function authenticateEventStreamRequest(req: IncomingMessage): UserProfile | undefined {
  const bearerUser = authenticateBearerRequest(req);
  if (bearerUser) {
    return bearerUser;
  }

  const cookieHeader = req.headers['cookie'];
  if (!cookieHeader) {
    return undefined;
  }

  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );

  const eventToken = cookies['events_token'];
  if (eventToken) {
    return activeSessions.get(eventToken);
  }

  return undefined;
}

// Reads and parses JSON payload from incoming stream
async function parseJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({} as T);
        return;
      }
      try {
        resolve(JSON.parse(body) as T);
      } catch {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

// Formats and sends standard JSON success response
function sendSuccess(
  res: ServerResponse,
  data: unknown,
  status = 200,
  traceId = '',
  extraHeaders: Record<string, string> = {}
): void {
  const payload = {
    success: true,
    data,
    error: null,
    trace_id: traceId,
  };
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Trace-Id': traceId,
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

// Formats and sends standard JSON error response
function sendError(
  res: ServerResponse,
  code: string,
  message: string,
  status = 400,
  traceId = '',
  details?: Array<{ field?: string; message: string }>
): void {
  const payload = {
    success: false,
    data: null,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    trace_id: traceId,
  };
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Trace-Id': traceId,
  });
  res.end(JSON.stringify(payload));
}

// Main request dispatcher handling all API routes
export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const reqOrigin = req.headers['origin'];
  const isAllowedOrigin = reqOrigin && ALLOWED_ORIGINS.has(reqOrigin);
  const effectiveOrigin = isAllowedOrigin ? reqOrigin : (reqOrigin ? 'null' : '*');

  res.setHeader('Access-Control-Allow-Origin', effectiveOrigin);
  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Trace-Id, X-Simulate-Failure, Accept'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const traceId = (req.headers['x-trace-id'] as string) || `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method?.toUpperCase() || 'GET';

  const apiPath = pathname.startsWith('/api/v1')
    ? pathname.substring('/api/v1'.length)
    : pathname;

  try {
    if (apiPath === '/events' && method === 'GET') {
      const user = authenticateEventStreamRequest(req);
      if (!user) {
        sendError(res, 'UNAUTHORIZED', 'Vui lòng đăng nhập để mở kênh sự kiện thời gian thực.', 401, traceId);
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Trace-Id': traceId,
      });
      sseManager.addClient(res, user);
      return;
    }

    if (apiPath === '/auth/register' && method === 'POST') {
      const body = await parseJsonBody<{
        email?: string;
        password?: string;
        fullName?: string;
        phoneNumber?: string;
      }>(req);

      const email = body.email?.trim().toLowerCase() || '';
      const password = body.password || '';
      const fullName = body.fullName?.trim() || '';
      const phoneNumber = body.phoneNumber?.trim() || '';
      const validationErrors: Array<{ field: string; message: string }> = [];

      if (!fullName || fullName.length > APP_CONFIG.VALIDATION.FULL_NAME_MAX_LENGTH) {
        validationErrors.push({ field: 'fullName', message: 'Họ tên không được rỗng và tối đa 100 ký tự' });
      }
      if (!email || !APP_CONFIG.VALIDATION.HTML_EMAIL_REGEX.test(email) || email.length > APP_CONFIG.VALIDATION.EMAIL_MAX_LENGTH) {
        validationErrors.push({ field: 'email', message: 'Địa chỉ email không đúng định dạng hoặc vượt quá độ dài' });
      }
      if (password.length < APP_CONFIG.VALIDATION.PASSWORD_MIN_LENGTH || password.length > APP_CONFIG.VALIDATION.PASSWORD_MAX_LENGTH || !password.trim()) {
        validationErrors.push({ field: 'password', message: 'Mật khẩu phải từ 8 đến 64 ký tự và không chỉ chứa khoảng trắng' });
      }
      if (!APP_CONFIG.VALIDATION.PHONE_REGEX.test(phoneNumber)) {
        validationErrors.push({ field: 'phoneNumber', message: 'Số điện thoại phải gồm 10 chữ số bắt đầu bằng 0' });
      }

      if (validationErrors.length > 0) {
        sendError(res, 'VALIDATION_FAILED', 'Dữ liệu đăng ký không hợp lệ.', 400, traceId, validationErrors);
        return;
      }

      const existing = defaultStorage.findUserByEmail(email);
      if (existing) {
        sendError(res, 'EMAIL_ALREADY_EXISTS', 'Email này đã được sử dụng.', 409, traceId);
        return;
      }

      const passwordHash = hashPassword(password);
      const user = defaultStorage.createUser({
        email,
        passwordHash,
        fullName,
        phoneNumber,
        role: 'Customer',
      });

      const token = createSession(user);
      sendSuccess(res, { token, user }, 201, traceId);
      return;
    }

    if (apiPath === '/auth/login' && method === 'POST') {
      const body = await parseJsonBody<{ email?: string; password?: string }>(req);
      const email = body.email?.trim().toLowerCase() || '';
      const password = body.password || '';

      if (!email || !password) {
        sendError(res, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.', 401, traceId);
        return;
      }

      const userAccount = defaultStorage.findUserByEmail(email);
      if (!userAccount || !verifyPassword(password, userAccount.passwordHash)) {
        sendError(res, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.', 401, traceId);
        return;
      }

      const { passwordHash: _, ...profile } = userAccount;
      const token = createSession(profile);

      const cookieHeader = `events_token=${token}; HttpOnly; SameSite=Strict; Path=/api/v1/events`;
      sendSuccess(res, { token, user: profile }, 200, traceId, { 'Set-Cookie': cookieHeader });
      return;
    }

    if (apiPath === '/auth/logout' && method === 'POST') {
      const authHeader = req.headers['authorization'];
      if (authHeader?.startsWith('Bearer ')) {
        removeSession(authHeader.substring(7).trim());
      }
      const clearCookie = 'events_token=; HttpOnly; SameSite=Strict; Path=/api/v1/events; Max-Age=0';
      sendSuccess(res, null, 200, traceId, { 'Set-Cookie': clearCookie });
      return;
    }

    if (apiPath === '/auth/me' && method === 'GET') {
      const user = authenticateBearerRequest(req);
      if (!user) {
        sendError(res, 'UNAUTHORIZED', 'Vui lòng đăng nhập để tiếp tục.', 401, traceId);
        return;
      }
      sendSuccess(res, user, 200, traceId);
      return;
    }

    if ((apiPath === '/users' || apiPath === '/shippers') && method === 'GET') {
      const user = authenticateBearerRequest(req);
      if (!user) {
        sendError(res, 'UNAUTHORIZED', 'Vui lòng đăng nhập.', 401, traceId);
        return;
      }
      if (user.role !== 'Admin') {
        sendError(res, 'FORBIDDEN', 'Chỉ Quản trị viên mới có quyền xem danh sách nhân sự.', 403, traceId);
        return;
      }
      const roleParam = parsedUrl.searchParams.get('role');
      const shippers = defaultStorage.listUsersByRole(roleParam || 'Shipper');
      sendSuccess(res, shippers, 200, traceId);
      return;
    }

    if (apiPath === '/products' && method === 'GET') {
      const user = authenticateBearerRequest(req);
      if (!user) {
        sendError(res, 'UNAUTHORIZED', 'Vui lòng đăng nhập để xem danh mục sản phẩm.', 401, traceId);
        return;
      }
      const products = defaultStorage.listProducts();
      sendSuccess(res, products, 200, traceId);
      return;
    }

    if (apiPath === '/orders' && method === 'POST') {
      const user = authenticateBearerRequest(req);
      if (!user) {
        sendError(res, 'UNAUTHORIZED', 'Vui lòng đăng nhập để tạo đơn hàng.', 401, traceId);
        return;
      }
      if (user.role !== 'Customer') {
        sendError(res, 'FORBIDDEN', 'Chỉ khách hàng mới có thể tạo đơn hàng.', 403, traceId);
        return;
      }

      const body = await parseJsonBody<any>(req);
      const recipientName = (body.recipientName || '').trim();
      const recipientPhone = (body.recipientPhone || '').trim();
      const deliveryAddress = (body.deliveryAddress || '').trim();
      const items = body.items;

      const orderErrors: Array<{ field: string; message: string }> = [];
      if (!recipientName || recipientName.length > APP_CONFIG.VALIDATION.RECIPIENT_NAME_MAX_LENGTH) {
        orderErrors.push({ field: 'recipientName', message: 'Tên người nhận không hợp lệ hoặc quá dài' });
      }
      if (!APP_CONFIG.VALIDATION.PHONE_REGEX.test(recipientPhone)) {
        orderErrors.push({ field: 'recipientPhone', message: 'Số điện thoại người nhận không đúng định dạng' });
      }
      if (!deliveryAddress || deliveryAddress.length > APP_CONFIG.VALIDATION.ADDRESS_MAX_LENGTH) {
        orderErrors.push({ field: 'deliveryAddress', message: 'Địa chỉ giao hàng không hợp lệ hoặc quá dài' });
      }
      if (!Array.isArray(items) || items.length === 0) {
        orderErrors.push({ field: 'items', message: 'Đơn hàng phải chứa ít nhất một sản phẩm' });
      }

      if (orderErrors.length > 0) {
        sendError(res, 'VALIDATION_FAILED', 'Thông tin đơn hàng không hợp lệ.', 400, traceId, orderErrors);
        return;
      }

      const failureHeader = req.headers['x-simulate-failure'] as string | undefined;
      const failurePoint = resolveFailurePointFromHeader(failureHeader);

      try {
        const order = defaultStorage.createOrder(body, user, failurePoint);
        sseManager.broadcast('order.created', {
          orderId: order.id,
          orderCode: order.code,
          customerName: user.fullName,
          totalItems: order.items.reduce((acc, it) => acc + it.quantity, 0),
          createdAt: order.createdAt,
        });
        sendSuccess(res, order, 201, traceId);
      } catch (err) {
        if (err instanceof StorageError) {
          sendError(res, 'ORDER_STORAGE_FAILED', err.message, 500, traceId);
          return;
        }
        sendError(res, 'ORDER_CREATION_FAILED', (err as Error).message, 400, traceId);
      }
      return;
    }

    if (apiPath === '/orders' && method === 'GET') {
      const user = authenticateBearerRequest(req);
      if (!user) {
        sendError(res, 'UNAUTHORIZED', 'Vui lòng đăng nhập.', 401, traceId);
        return;
      }
      if (user.role === 'Shipper') {
        sendError(res, 'FORBIDDEN', 'Nhân viên giao hàng truy cập đơn qua endpoint shipments.', 403, traceId);
        return;
      }

      const status = parsedUrl.searchParams.get('status') as any;
      const page = parseInt(parsedUrl.searchParams.get('page') || '1', 10);
      const limit = parseInt(parsedUrl.searchParams.get('limit') || '20', 10);

      const customerId = user.role === 'Customer' ? user.id : undefined;
      const { items } = defaultStorage.listOrders({ customerId, status, page, limit });
      sendSuccess(res, items, 200, traceId);
      return;
    }

    const orderDetailMatch = apiPath.match(/^\/orders\/([^/]+)$/);
    if (orderDetailMatch && method === 'GET') {
      const user = authenticateBearerRequest(req);
      if (!user) {
        sendError(res, 'UNAUTHORIZED', 'Vui lòng đăng nhập.', 401, traceId);
        return;
      }

      const orderId = orderDetailMatch[1];
      const order = defaultStorage.findOrderById(orderId) || defaultStorage.findOrderByCode(orderId);
      if (!order) {
        sendError(res, 'ORDER_NOT_FOUND', 'Đơn hàng không tồn tại.', 404, traceId);
        return;
      }

      if (user.role === 'Customer' && order.customerId !== user.id) {
        sendError(res, 'FORBIDDEN', 'Bạn không có quyền xem đơn hàng này.', 403, traceId);
        return;
      }
      if (user.role === 'Shipper' && order.shipment?.shipperId !== user.id) {
        sendError(res, 'FORBIDDEN', 'Bạn không được phân công đơn hàng này.', 403, traceId);
        return;
      }

      sendSuccess(res, order, 200, traceId);
      return;
    }

    if (apiPath === '/shipments' && method === 'POST') {
      const user = authenticateBearerRequest(req);
      if (!user || user.role !== 'Admin') {
        sendError(res, 'FORBIDDEN', 'Chỉ Quản trị viên mới có quyền tạo vận đơn và phân công.', 403, traceId);
        return;
      }

      const body = await parseJsonBody<{ orderId?: string; shipperId?: string }>(req);
      if (!body.orderId || !body.shipperId) {
        sendError(res, 'VALIDATION_FAILED', 'Vui lòng cung cấp orderId và shipperId.', 400, traceId);
        return;
      }

      try {
        const order = defaultStorage.createShipment(body.orderId, body.shipperId, user);
        sseManager.broadcast('shipment.assigned', {
          shipmentId: order.shipment?.id,
          orderId: order.id,
          orderCode: order.code,
          trackingNumber: order.shipment?.trackingNumber,
          shipperId: body.shipperId,
          address: order.deliveryAddress,
        }, body.shipperId);
        sseManager.broadcast('order.status_changed', {
          orderId: order.id,
          orderCode: order.code,
          oldStatus: 'PENDING_CONFIRMATION',
          newStatus: order.status,
          changedAt: order.updatedAt,
          changedBy: user.id,
          shipment: order.shipment,
        }, order.customerId);
        sendSuccess(res, order.shipment, 201, traceId);
      } catch (err: any) {
        sendError(res, 'SHIPMENT_CREATION_FAILED', err.message || 'Không thể tạo vận đơn.', 400, traceId);
      }
      return;
    }

    if (apiPath === '/shipments/assigned' && method === 'GET') {
      const user = authenticateBearerRequest(req);
      if (!user || user.role !== 'Shipper') {
        sendError(res, 'FORBIDDEN', 'Chỉ nhân viên giao hàng mới có thể xem danh sách phân công.', 403, traceId);
        return;
      }

      const assignedOrders = defaultStorage.listAssignedShipments(user.id);
      sendSuccess(res, assignedOrders, 200, traceId);
      return;
    }

    const updateShipmentStatusMatch = apiPath.match(/^\/shipments\/([^/]+)\/status$/);
    if (updateShipmentStatusMatch && method === 'PATCH') {
      const user = authenticateBearerRequest(req);
      if (!user || user.role !== 'Shipper') {
        sendError(res, 'FORBIDDEN', 'Chỉ nhân viên giao hàng mới có quyền cập nhật trạng thái.', 403, traceId);
        return;
      }

      const shipmentId = updateShipmentStatusMatch[1];
      const body = await parseJsonBody<{ action?: any; notes?: string }>(req);

      try {
        const updatedOrder = defaultStorage.updateShipmentStatus(shipmentId, body.action, user, body.notes);
        sseManager.broadcast('order.status_changed', {
          orderId: updatedOrder.id,
          orderCode: updatedOrder.code,
          oldStatus: updatedOrder.history?.[updatedOrder.history.length - 2]?.newStatus || null,
          newStatus: updatedOrder.status,
          changedAt: updatedOrder.updatedAt || new Date().toISOString(),
          changedBy: user.id,
          shipment: updatedOrder.shipment,
          notes: body.notes,
        }, updatedOrder.customerId);
        sendSuccess(res, updatedOrder, 200, traceId);
      } catch (err: any) {
        sendError(res, 'INVALID_TRANSITION', err.message || 'Chuyển trạng thái không hợp lệ.', 409, traceId);
      }
      return;
    }

    const trackMatch = apiPath.match(/^\/shipments\/(?:track\/([^/]+)|([^/]+)\/tracking)$/);
    if (trackMatch && method === 'GET') {
      const user = authenticateBearerRequest(req);
      if (!user) {
        sendError(res, 'UNAUTHORIZED', 'Vui lòng đăng nhập để tra cứu vận đơn.', 401, traceId);
        return;
      }

      const identifier = trackMatch[1] || trackMatch[2];
      const order = defaultStorage.trackShipment(identifier);
      if (!order) {
        sendError(res, 'SHIPMENT_NOT_FOUND', 'Không tìm thấy thông tin vận chuyển.', 404, traceId);
        return;
      }

      if (user.role === 'Customer' && order.customerId !== user.id) {
        sendError(res, 'FORBIDDEN', 'Bạn không có quyền theo dõi đơn hàng này.', 403, traceId);
        return;
      }
      if (user.role === 'Shipper' && order.shipment?.shipperId !== user.id) {
        sendError(res, 'FORBIDDEN', 'Bạn không được phân công đơn hàng này.', 403, traceId);
        return;
      }

      sendSuccess(res, order, 200, traceId);
      return;
    }

    const returnShipmentMatch = apiPath.match(/^\/shipments\/([^/]+)\/return$/);
    if (returnShipmentMatch && method === 'POST') {
      const user = authenticateBearerRequest(req);
      if (!user || user.role !== 'Admin') {
        sendError(res, 'FORBIDDEN', 'Chỉ Quản trị viên mới có quyền chuyển trạng thái hoàn hàng.', 403, traceId);
        return;
      }

      const identifier = returnShipmentMatch[1];
      const order = defaultStorage.findOrderById(identifier) || defaultStorage.trackShipment(identifier);
      if (!order) {
        sendError(res, 'ORDER_NOT_FOUND', 'Đơn hàng không tồn tại.', 404, traceId);
        return;
      }

      if (order.status !== 'FAILED_DELIVERY' || (order.shipment?.failedAttempts || 0) < APP_CONFIG.DELIVERY_RULES.MAX_FAILED_DELIVERY_ATTEMPTS) {
        sendError(
          res,
          'RETURN_THRESHOLD_NOT_REACHED',
          'Đơn hàng chưa đạt ngưỡng 3 lần giao thất bại để hoàn trả.',
          409,
          traceId
        );
        return;
      }

      const oldStatus = order.status;
      order.status = 'RETURNING';
      order.updatedAt = new Date().toISOString();
      order.history = order.history || [];
      order.history.push({
        id: `hist_${order.id}_${order.history.length + 1}`,
        oldStatus,
        newStatus: 'RETURNING',
        changedBy: user.id,
        changedByName: user.fullName,
        changedAt: order.updatedAt,
        notes: 'Chuyển trạng thái hoàn trả về người bán sau 3 lần giao thất bại',
      });

      sseManager.broadcast('order.status_changed', {
        orderId: order.id,
        orderCode: order.code,
        oldStatus,
        newStatus: 'RETURNING',
        changedAt: order.updatedAt,
        changedBy: user.id,
      }, order.customerId);

      sendSuccess(res, order, 200, traceId);
      return;
    }

    const confirmReturnedMatch = apiPath.match(/^\/shipments\/([^/]+)\/confirm-returned$/);
    if (confirmReturnedMatch && method === 'POST') {
      const user = authenticateBearerRequest(req);
      if (!user || user.role !== 'Admin') {
        sendError(res, 'FORBIDDEN', 'Chỉ Quản trị viên mới có quyền xác nhận hoàn trả về kho.', 403, traceId);
        return;
      }

      const identifier = confirmReturnedMatch[1];
      const order = defaultStorage.findOrderById(identifier) || defaultStorage.trackShipment(identifier);
      if (!order) {
        sendError(res, 'ORDER_NOT_FOUND', 'Đơn hàng không tồn tại.', 404, traceId);
        return;
      }
      if (order.status !== 'RETURNING') {
        sendError(res, 'INVALID_TRANSITION', 'Chỉ có thể xác nhận khi đơn đang chuyển hoàn về kho.', 409, traceId);
        return;
      }

      const oldStatus = order.status;
      order.status = 'RETURNED_TO_SELLER';
      order.updatedAt = new Date().toISOString();
      order.history = order.history || [];
      order.history.push({
        id: `hist_${order.id}_${order.history.length + 1}`,
        oldStatus,
        newStatus: 'RETURNED_TO_SELLER',
        changedBy: user.id,
        changedByName: user.fullName,
        changedAt: order.updatedAt,
        notes: 'Kho người bán đã nhận lại hàng hoàn.',
      });

      sseManager.broadcast('order.status_changed', {
        orderId: order.id,
        orderCode: order.code,
        oldStatus,
        newStatus: 'RETURNED_TO_SELLER',
        changedAt: order.updatedAt,
        changedBy: user.id,
      }, order.customerId);

      sendSuccess(res, order, 200, traceId);
      return;
    }

    if (apiPath === '/returns' && method === 'POST') {
      const user = authenticateBearerRequest(req);
      if (!user || user.role !== 'Customer') {
        sendError(res, 'FORBIDDEN', 'Chỉ khách hàng mới có thể yêu cầu đổi trả.', 403, traceId);
        return;
      }

      const body = await parseJsonBody<{ orderId?: string; reason?: any; notes?: string }>(req);
      if (!body.orderId || !body.reason) {
        sendError(res, 'VALIDATION_FAILED', 'Vui lòng cung cấp mã đơn và lý do đổi trả.', 400, traceId);
        return;
      }

      try {
        const returnRequest = defaultStorage.submitReturn(
          { orderId: body.orderId, reason: body.reason, notes: body.notes },
          user
        );
        sseManager.broadcast('return.status_changed', {
          requestId: returnRequest.id,
          orderId: returnRequest.orderId,
          orderCode: returnRequest.orderCode,
          newStatus: returnRequest.status,
        }, user.id);
        sendSuccess(res, returnRequest, 201, traceId);
      } catch (err: any) {
        sendError(res, 'RETURN_REQUEST_FAILED', err.message || 'Không thể tạo yêu cầu trả hàng.', 400, traceId);
      }
      return;
    }

    if (apiPath === '/returns' && method === 'GET') {
      const user = authenticateBearerRequest(req);
      if (!user) {
        sendError(res, 'UNAUTHORIZED', 'Vui lòng đăng nhập.', 401, traceId);
        return;
      }

      const status = parsedUrl.searchParams.get('status') as any;
      const customerId = user.role === 'Customer' ? user.id : undefined;
      const list = defaultStorage.listReturns({ status, customerId });
      sendSuccess(res, list, 200, traceId);
      return;
    }

    const reviewReturnMatch = apiPath.match(/^\/returns\/([^/]+)\/review$/);
    if (reviewReturnMatch && method === 'PATCH') {
      const user = authenticateBearerRequest(req);
      if (!user || user.role !== 'Admin') {
        sendError(res, 'FORBIDDEN', 'Chỉ Quản trị viên mới có quyền xét duyệt hoàn hàng.', 403, traceId);
        return;
      }

      const requestId = reviewReturnMatch[1];
      const body = await parseJsonBody<{ action?: 'APPROVE' | 'REJECT'; rejectionReason?: string }>(req);
      const action = body.action;
      if (!action || (action !== 'APPROVE' && action !== 'REJECT')) {
        sendError(res, 'VALIDATION_FAILED', 'Hành động xét duyệt không hợp lệ.', 400, traceId);
        return;
      }

      try {
        const updated = defaultStorage.reviewReturn(
          requestId,
          { action, rejectionReason: body.rejectionReason },
          user
        );
        sseManager.broadcast('return.status_changed', {
          requestId: updated.id,
          orderId: updated.orderId,
          orderCode: updated.orderCode,
          newStatus: updated.status,
          rejectionReason: updated.rejectionReason,
        }, updated.customerId);
        sendSuccess(res, updated, 200, traceId);
      } catch (err: any) {
        sendError(res, 'REVIEW_FAILED', err.message || 'Không thể duyệt yêu cầu trả hàng.', 400, traceId);
      }
      return;
    }

    const completeReturnMatch = apiPath.match(/^\/returns\/([^/]+)\/complete$/);
    if (completeReturnMatch && method === 'PATCH') {
      const user = authenticateBearerRequest(req);
      if (!user || user.role !== 'Admin') {
        sendError(res, 'FORBIDDEN', 'Chỉ Quản trị viên mới có quyền hoàn tất đổi trả.', 403, traceId);
        return;
      }

      const requestId = completeReturnMatch[1];
      try {
        const completed = defaultStorage.completeReturn(requestId);
        sseManager.broadcast('return.status_changed', {
          requestId: completed.id,
          orderId: completed.orderId,
          orderCode: completed.orderCode,
          newStatus: completed.status,
        }, completed.customerId);
        sendSuccess(res, completed, 200, traceId);
      } catch (err: any) {
        sendError(res, 'COMPLETE_FAILED', err.message || 'Không thể hoàn tất đổi trả.', 400, traceId);
      }
      return;
    }

    if (apiPath === '/issues' && method === 'POST') {
      const user = authenticateBearerRequest(req);
      if (!user || (user.role !== 'Shipper' && user.role !== 'Admin')) {
        sendError(res, 'FORBIDDEN', 'Chỉ Shipper hoặc Admin mới có quyền báo cáo sự cố.', 403, traceId);
        return;
      }

      const body = await parseJsonBody<{ orderId?: string; issueType?: any; notes?: string }>(req);
      const issueType = body.issueType;
      if (!body.orderId || !issueType) {
        sendError(res, 'VALIDATION_FAILED', 'Vui lòng cung cấp orderId và loại sự cố.', 400, traceId);
        return;
      }

      try {
        const issue = defaultStorage.reportIssue(
          body.orderId,
          { issueType, notes: body.notes },
          user
        );
        sseManager.broadcast('issue.reported', {
          issueId: issue.id,
          orderId: issue.orderId,
          orderCode: issue.orderCode,
          issueType: issue.issueType,
          reportedBy: user.id,
          notes: issue.notes,
        });
        sendSuccess(res, issue, 201, traceId);
      } catch (err: any) {
        sendError(res, 'REPORT_ISSUE_FAILED', err.message || 'Không thể báo cáo sự cố.', 400, traceId);
      }
      return;
    }

    if (apiPath === '/issues' && method === 'GET') {
      const user = authenticateBearerRequest(req);
      if (!user || user.role !== 'Admin') {
        sendError(res, 'FORBIDDEN', 'Chỉ Quản trị viên mới có quyền xem danh sách sự cố.', 403, traceId);
        return;
      }

      const resolvedParam = parsedUrl.searchParams.get('resolved');
      const resolved = resolvedParam !== null ? resolvedParam === 'true' : undefined;
      const page = parseInt(parsedUrl.searchParams.get('page') || '1', 10);
      const limit = parseInt(parsedUrl.searchParams.get('limit') || '10', 10);

      const { items } = defaultStorage.listIssues({ resolved, page, limit });
      sendSuccess(res, items, 200, traceId);
      return;
    }

    const resolveIssueMatch = apiPath.match(/^\/issues\/([^/]+)\/resolve$/);
    if (resolveIssueMatch && method === 'PATCH') {
      const user = authenticateBearerRequest(req);
      if (!user || user.role !== 'Admin') {
        sendError(res, 'FORBIDDEN', 'Chỉ Quản trị viên mới có quyền xử lý sự cố.', 403, traceId);
        return;
      }

      const issueId = resolveIssueMatch[1];
      const body = await parseJsonBody<{ resolutionNotes?: string; resolutionResult?: string }>(req);
      const notes = (body.resolutionNotes || body.resolutionResult || '').trim();

      if (!notes) {
        sendError(res, 'VALIDATION_FAILED', 'Nội dung xử lý sự cố không được để trống.', 400, traceId);
        return;
      }

      try {
        const resolved = defaultStorage.resolveIssue(issueId, { resolutionNotes: notes }, user);
        sendSuccess(res, resolved, 200, traceId);
      } catch (err: any) {
        sendError(res, 'RESOLVE_ISSUE_FAILED', err.message || 'Không thể xử lý sự cố.', 409, traceId);
      }
      return;
    }

    sendError(res, 'ROUTE_NOT_FOUND', `Không tìm thấy endpoint: ${method} ${pathname}`, 404, traceId);
  } catch (err: any) {
    sendError(res, 'INTERNAL_SERVER_ERROR', err.message || 'Lỗi xử lý nội bộ máy chủ.', 500, traceId);
  }
}
