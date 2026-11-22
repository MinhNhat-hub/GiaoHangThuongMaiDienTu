import type { IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { APP_CONFIG } from '@/constants/config';
import type { UserProfile } from '@/types/api';
import { sseManager } from './events';
import {
  resolveFailurePointFromHeader,
  StorageError,
} from './failureInjection';
import { defaultStorage } from './storage';

// In-memory token-to-user session mapping
const activeSessions = new Map<string, UserProfile>();

// Populates initial session tokens for pre-seeded users for testing convenience
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

// Invalidate session on sign-out
export function removeSession(token: string): void {
  activeSessions.delete(token);
}

// Resolves user from Authorization header or cookie
function authenticateRequest(req: IncomingMessage): UserProfile | undefined {
  const authHeader = req.headers['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (activeSessions.has(token)) {
      return activeSessions.get(token);
    }
    // Fallback: check static token pattern
    for (const [sToken, user] of activeSessions.entries()) {
      if (token === sToken || token.startsWith(`token_${user.id}`)) {
        return user;
      }
    }
  }

  // Check cookie for EventSource connections
  const cookieHeader = req.headers['cookie'];
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, v.join('=')];
      })
    );
    const eventToken = cookies['events_token'];
    if (eventToken && activeSessions.has(eventToken)) {
      return activeSessions.get(eventToken);
    }
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
      } catch (err) {
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
  const origin = req.headers['origin'] || '*';
  const traceId = (req.headers['x-trace-id'] as string) || `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Default CORS Headers
  res.setHeader('Access-Control-Allow-Origin', origin === '*' ? '*' : origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Trace-Id, X-Simulate-Failure, Accept'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method?.toUpperCase() || 'GET';

  // Normalize API base path
  const apiPath = pathname.startsWith('/api/v1')
    ? pathname.substring('/api/v1'.length)
    : pathname;

  try {
    // --- 1. REAL-TIME EVENTS SSE ---
    if (apiPath === '/events' && method === 'GET') {
      const user = authenticateRequest(req);
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Trace-Id': traceId,
      });
      sseManager.addClient(res, user);
      return;
    }

    // --- 2. AUTHENTICATION ---
    if (apiPath === '/auth/register' && method === 'POST') {
      const body = await parseJsonBody<{
        email?: string;
        password?: string;
        fullName?: string;
        phoneNumber?: string;
      }>(req);

      if (!body.email || !body.password || !body.fullName) {
        sendError(res, 'VALIDATION_FAILED', 'Vui lòng cung cấp đầy đủ thông tin đăng ký.', 400, traceId);
        return;
      }

      const existing = defaultStorage.findUserByEmail(body.email);
      if (existing) {
        sendError(res, 'EMAIL_ALREADY_EXISTS', 'Email này đã được sử dụng.', 409, traceId);
        return;
      }

      const user = defaultStorage.createUser({
        email: body.email,
        passwordHash: body.password,
        fullName: body.fullName,
        phoneNumber: body.phoneNumber,
        role: 'Customer',
      });

      const token = createSession(user);
      sendSuccess(res, { token, user }, 201, traceId);
      return;
    }

    if (apiPath === '/auth/login' && method === 'POST') {
      const body = await parseJsonBody<{ email?: string; password?: string }>(req);
      if (!body.email || !body.password) {
        sendError(res, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.', 401, traceId);
        return;
      }

      const userAccount = defaultStorage.findUserByEmail(body.email);
      if (!userAccount || userAccount.passwordHash !== body.password) {
        sendError(res, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.', 401, traceId);
        return;
      }

      const { passwordHash: _, ...profile } = userAccount;
      const token = createSession(profile);

      // Set events cookie per Section 8.1
      const cookieHeader = `events_token=${token}; HttpOnly; SameSite=Strict; Path=/api/v1/events`;
      sendSuccess(res, { token, user: profile }, 200, traceId, { 'Set-Cookie': cookieHeader });
      return;
    }

    if (apiPath === '/auth/logout' && method === 'POST') {
      const authHeader = req.headers['authorization'];
      if (authHeader?.startsWith('Bearer ')) {
        removeSession(authHeader.substring(7).trim());
      }
      const clearCookie = `events_token=; HttpOnly; SameSite=Strict; Path=/api/v1/events; Max-Age=0`;
      sendSuccess(res, null, 200, traceId, { 'Set-Cookie': clearCookie });
      return;
    }

    if (apiPath === '/auth/me' && method === 'GET') {
      const user = authenticateRequest(req);
      if (!user) {
        sendError(res, 'UNAUTHORIZED', 'Vui lòng đăng nhập để tiếp tục.', 401, traceId);
        return;
      }
      sendSuccess(res, user, 200, traceId);
      return;
    }

    // --- 3. USERS & SHIPPERS ---
    if ((apiPath === '/users' || apiPath === '/shippers') && method === 'GET') {
      const roleParam = parsedUrl.searchParams.get('role');
      const shippers = defaultStorage.listUsersByRole(roleParam || 'Shipper');
      sendSuccess(res, shippers, 200, traceId);
      return;
    }

    // --- 4. PRODUCTS ---
    if (apiPath === '/products' && method === 'GET') {
      const products = defaultStorage.listProducts();
      sendSuccess(res, products, 200, traceId);
      return;
    }

    // --- 5. ORDERS ---
    if (apiPath === '/orders' && method === 'POST') {
      const user = authenticateRequest(req);
      if (!user) {
        sendError(res, 'UNAUTHORIZED', 'Vui lòng đăng nhập để tạo đơn hàng.', 401, traceId);
        return;
      }
      if (user.role !== 'Customer') {
        sendError(res, 'FORBIDDEN', 'Chỉ khách hàng mới có thể tạo đơn hàng.', 403, traceId);
        return;
      }

      const body = await parseJsonBody<any>(req);
      if (!body.recipientName || !body.recipientPhone || !body.deliveryAddress || !body.items?.length) {
        sendError(res, 'VALIDATION_FAILED', 'Vui lòng điền đầy đủ thông tin đơn hàng.', 400, traceId);
        return;
      }

      // Check failure injection simulation header
      const failureHeader = req.headers['x-simulate-failure'] as string | undefined;
      const failurePoint = resolveFailurePointFromHeader(failureHeader);

      try {
        const order = defaultStorage.createOrder(body, user, failurePoint);
        // Broadcast real-time event to Admin dashboard
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
        throw err;
      }
      return;
    }

    if (apiPath === '/orders' && method === 'GET') {
      const user = authenticateRequest(req);
      if (!user) {
        sendError(res, 'UNAUTHORIZED', 'Vui lòng đăng nhập.', 401, traceId);
        return;
      }
      if (user.role === 'Shipper') {
        sendError(res, 'FORBIDDEN', 'Shipper truy cập đơn qua endpoint shipments.', 403, traceId);
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

    // Match /orders/:id
    const orderDetailMatch = apiPath.match(/^\/orders\/([^/]+)$/);
    if (orderDetailMatch && method === 'GET') {
      const user = authenticateRequest(req);
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

      // Check viewing permission per SEC-2
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

    // --- 6. SHIPMENTS & DELIVERY ---
    if (apiPath === '/shipments' && method === 'POST') {
      const user = authenticateRequest(req);
      if (!user || user.role !== 'Admin') {
        sendError(res, 'FORBIDDEN', 'Chỉ Admin mới có quyền tạo vận đơn và phân công.', 403, traceId);
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
        });
        sseManager.broadcast('order.status_changed', {
          orderId: order.id,
          orderCode: order.code,
          oldStatus: 'PENDING_CONFIRMATION',
          newStatus: order.status,
          changedAt: order.updatedAt,
          changedBy: user.id,
          shipment: order.shipment,
        });
        sendSuccess(res, order.shipment, 201, traceId);
      } catch (err: any) {
        sendError(res, 'SHIPMENT_CREATION_FAILED', err.message || 'Không thể tạo vận đơn.', 400, traceId);
      }
      return;
    }

    if (apiPath === '/shipments/assigned' && method === 'GET') {
      const user = authenticateRequest(req);
      if (!user || user.role !== 'Shipper') {
        sendError(res, 'FORBIDDEN', 'Chỉ nhân viên giao hàng mới có thể xem danh sách phân công.', 403, traceId);
        return;
      }

      const assignedOrders = defaultStorage.listAssignedShipments(user.id);
      sendSuccess(res, assignedOrders, 200, traceId);
      return;
    }

    // Match /shipments/:id/status
    const updateShipmentStatusMatch = apiPath.match(/^\/shipments\/([^/]+)\/status$/);
    if (updateShipmentStatusMatch && method === 'PATCH') {
      const user = authenticateRequest(req);
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
        });
        sendSuccess(res, updatedOrder, 200, traceId);
      } catch (err: any) {
        sendError(res, 'INVALID_TRANSITION', err.message || 'Chuyển trạng thái không hợp lệ.', 409, traceId);
      }
      return;
    }

    // Match /shipments/track/:identifier or /shipments/:id/tracking
    const trackMatch = apiPath.match(/^\/shipments\/(?:track\/([^/]+)|([^/]+)\/tracking)$/);
    if (trackMatch && method === 'GET') {
      const identifier = trackMatch[1] || trackMatch[2];
      const order = defaultStorage.trackShipment(identifier);
      if (!order) {
        sendError(res, 'SHIPMENT_NOT_FOUND', 'Không tìm thấy thông tin vận chuyển.', 404, traceId);
        return;
      }
      sendSuccess(res, order, 200, traceId);
      return;
    }

    // Match /shipments/:id/return (Admin processes return after 3 failed attempts)
    const returnShipmentMatch = apiPath.match(/^\/shipments\/([^/]+)\/return$/);
    if (returnShipmentMatch && method === 'POST') {
      const user = authenticateRequest(req);
      if (!user || user.role !== 'Admin') {
        sendError(res, 'FORBIDDEN', 'Chỉ Admin mới có quyền chuyển trạng thái hoàn hàng.', 403, traceId);
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
      });

      sendSuccess(res, order, 200, traceId);
      return;
    }

    // Match /shipments/:id/confirm-returned
    const confirmReturnedMatch = apiPath.match(/^\/shipments\/([^/]+)\/confirm-returned$/);
    if (confirmReturnedMatch && method === 'POST') {
      const user = authenticateRequest(req);
      if (!user || user.role !== 'Admin') {
        sendError(res, 'FORBIDDEN', 'Chỉ Admin mới có quyền xác nhận hoàn trả về kho.', 403, traceId);
        return;
      }

      const identifier = confirmReturnedMatch[1];
      const order = defaultStorage.findOrderById(identifier) || defaultStorage.trackShipment(identifier);
      if (!order) {
        sendError(res, 'ORDER_NOT_FOUND', 'Đơn hàng không tồn tại.', 404, traceId);
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
      });

      sendSuccess(res, order, 200, traceId);
      return;
    }

    // --- 7. RETURNS ---
    if (apiPath === '/returns' && method === 'POST') {
      const user = authenticateRequest(req);
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
        });
        sendSuccess(res, returnRequest, 201, traceId);
      } catch (err: any) {
        sendError(res, 'RETURN_REQUEST_FAILED', err.message || 'Không thể tạo yêu cầu trả hàng.', 400, traceId);
      }
      return;
    }

    if (apiPath === '/returns' && method === 'GET') {
      const user = authenticateRequest(req);
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

    // Match /returns/:id/review
    const reviewReturnMatch = apiPath.match(/^\/returns\/([^/]+)\/review$/);
    if (reviewReturnMatch && method === 'PATCH') {
      const user = authenticateRequest(req);
      if (!user || user.role !== 'Admin') {
        sendError(res, 'FORBIDDEN', 'Chỉ Admin mới có quyền xét duyệt hoàn hàng.', 403, traceId);
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
        });
        sendSuccess(res, updated, 200, traceId);
      } catch (err: any) {
        sendError(res, 'REVIEW_FAILED', err.message || 'Không thể duyệt yêu cầu trả hàng.', 400, traceId);
      }
      return;
    }

    // Match /returns/:id/complete
    const completeReturnMatch = apiPath.match(/^\/returns\/([^/]+)\/complete$/);
    if (completeReturnMatch && method === 'PATCH') {
      const user = authenticateRequest(req);
      if (!user || user.role !== 'Admin') {
        sendError(res, 'FORBIDDEN', 'Chỉ Admin mới có quyền hoàn tất đổi trả.', 403, traceId);
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
        });
        sendSuccess(res, completed, 200, traceId);
      } catch (err: any) {
        sendError(res, 'COMPLETE_FAILED', err.message || 'Không thể hoàn tất đổi trả.', 400, traceId);
      }
      return;
    }

    // --- 8. DELIVERY ISSUES ---
    if (apiPath === '/issues' && method === 'POST') {
      const user = authenticateRequest(req);
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
      const user = authenticateRequest(req);
      if (!user || user.role !== 'Admin') {
        sendError(res, 'FORBIDDEN', 'Chỉ Admin mới có quyền xem danh sách sự cố.', 403, traceId);
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

    // Match /issues/:id/resolve
    const resolveIssueMatch = apiPath.match(/^\/issues\/([^/]+)\/resolve$/);
    if (resolveIssueMatch && method === 'PATCH') {
      const user = authenticateRequest(req);
      if (!user || user.role !== 'Admin') {
        sendError(res, 'FORBIDDEN', 'Chỉ Admin mới có quyền xử lý sự cố.', 403, traceId);
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
        sendError(res, 'RESOLVE_ISSUE_FAILED', err.message || 'Không thể xử lý sự cố.', 400, traceId);
      }
      return;
    }

    // 404 Route Not Found
    sendError(res, 'ROUTE_NOT_FOUND', `Không tìm thấy endpoint: ${method} ${pathname}`, 404, traceId);
  } catch (err: any) {
    sendError(res, 'INTERNAL_SERVER_ERROR', err.message || 'Lỗi xử lý nội bộ máy chủ.', 500, traceId);
  }
}
