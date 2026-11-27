import type {
  CreateOrderPayload,
  DeliveryIssue,
  Order,
  OrderItem,
  Product,
  ReportIssuePayload,
  ResolveIssuePayload,
  ReturnRequest,
  ReviewReturnPayload,
  ShipmentStatusAction,
  StatusHistoryEntry,
  SubmitReturnPayload,
  UserProfile,
} from '@/types/api';
import type { OrderStatusCode, ReturnStatusCode } from '@/constants/status-map';
import { APP_CONFIG } from '@/constants/config';
import {
  FailurePoint,
  StorageError,
  shouldFailAt,
} from './failureInjection';
import {
  UserAccount,
  getInitialSeedData,
} from './seedData';

export class AppStorage {
  private users: UserAccount[] = [];
  private products: Product[] = [];
  private orders: Order[] = [];
  private returns: ReturnRequest[] = [];
  private issues: DeliveryIssue[] = [];

  constructor() {
    this.reset();
  }

  // Resets all entities to the pristine initial seed dataset
  reset(): void {
    const seed = getInitialSeedData();
    this.users = seed.users;
    this.products = seed.products;
    this.orders = seed.orders;
    this.returns = seed.returns;
    this.issues = seed.issues;
  }

  // Finds user by email address
  findUserByEmail(email: string): UserAccount | undefined {
    const normalized = email.trim().toLowerCase();
    return this.users.find((u) => u.email.toLowerCase() === normalized);
  }

  // Finds user by account identifier
  findUserById(id: string): UserAccount | undefined {
    return this.users.find((u) => u.id === id);
  }

  // Creates and stores a new user profile
  createUser(payload: {
    email: string;
    passwordHash: string;
    fullName: string;
    phoneNumber?: string;
    role?: 'Customer' | 'Shipper' | 'Admin';
  }): UserProfile {
    const nextIndex = this.users.length + 1;
    const newAccount: UserAccount = {
      id: `usr_${Date.now()}_${nextIndex}`,
      email: payload.email.trim().toLowerCase(),
      fullName: payload.fullName.trim(),
      phoneNumber: payload.phoneNumber?.trim() || undefined,
      role: payload.role || 'Customer',
      passwordHash: payload.passwordHash,
    };
    this.users.push(newAccount);
    const { passwordHash: _, ...profile } = newAccount;
    return profile;
  }

  // Lists user profiles optionally filtered by role
  listUsersByRole(role?: string): UserProfile[] {
    let list = this.users;
    if (role) {
      list = list.filter((u) => u.role.toLowerCase() === role.toLowerCase());
    }
    return list.map(({ passwordHash: _, ...profile }) => profile);
  }

  // Returns all products from the catalog
  listProducts(): Product[] {
    return [...this.products];
  }

  // Finds product by catalog identifier
  findProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  // Lists orders matching filtering criteria
  listOrders(params?: {
    customerId?: string;
    status?: OrderStatusCode;
    page?: number;
    limit?: number;
  }): { items: Order[]; total: number } {
    let result = [...this.orders];

    if (params?.customerId) {
      result = result.filter((o) => o.customerId === params.customerId);
    }
    if (params?.status) {
      result = result.filter((o) => o.status === params.status);
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = result.length;
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, params?.limit || APP_CONFIG.PAGINATION.DEFAULT_LIMIT);
    const startIndex = (page - 1) * limit;
    const items = result.slice(startIndex, startIndex + limit);

    return { items, total };
  }

  // Finds order by internal identifier
  findOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id);
  }

  // Finds order by business tracking code
  findOrderByCode(code: string): Order | undefined {
    return this.orders.find((o) => o.code === code);
  }

  // Creates a customer order with validation and transactional rollback support
  createOrder(
    payload: CreateOrderPayload,
    customer: UserProfile,
    failurePoint?: FailurePoint
  ): Order {
    const recipientName = payload.recipientName.trim();
    const recipientPhone = payload.recipientPhone.trim();
    const deliveryAddress = payload.deliveryAddress.trim();

    if (!recipientName || recipientName.length > APP_CONFIG.VALIDATION.RECIPIENT_NAME_MAX_LENGTH) {
      throw new Error('Tên người nhận không hợp lệ hoặc vượt quá độ dài');
    }
    if (!APP_CONFIG.VALIDATION.PHONE_REGEX.test(recipientPhone)) {
      throw new Error('Số điện thoại người nhận không hợp lệ');
    }
    if (!deliveryAddress || deliveryAddress.length > APP_CONFIG.VALIDATION.ADDRESS_MAX_LENGTH) {
      throw new Error('Địa chỉ giao hàng không hợp lệ hoặc vượt quá độ dài');
    }
    if (!payload.items || payload.items.length === 0) {
      throw new Error('Đơn hàng phải chứa ít nhất một sản phẩm');
    }

    const seenProductIds = new Set<string>();
    for (const it of payload.items) {
      if (seenProductIds.has(it.productId)) {
        throw new Error('Đơn hàng không được chứa hai dòng cùng một sản phẩm');
      }
      seenProductIds.add(it.productId);
      if (!Number.isInteger(it.quantity) || it.quantity < APP_CONFIG.VALIDATION.MIN_ITEM_QUANTITY) {
        throw new Error('Số lượng sản phẩm phải là số nguyên dương');
      }
    }

    const timestamp = new Date().toISOString();
    const orderIndex = this.orders.length + 1;
    const orderId = `ord_${Date.now()}_${orderIndex}`;
    const datePrefix = timestamp.slice(0, 10).replace(/-/g, '');
    const orderCode = `ORD-${datePrefix}-${String(orderIndex).padStart(4, '0')}`;

    const resolvedItems: OrderItem[] = payload.items.map((item, idx) => {
      const product = this.findProductById(item.productId);
      return {
        id: `item_${orderId}_${idx + 1}`,
        productId: item.productId,
        productName: product?.name || 'Sản phẩm',
        quantity: item.quantity,
      };
    });

    const statusHistory: StatusHistoryEntry[] = [
      {
        id: `hist_${orderId}_1`,
        oldStatus: null,
        newStatus: 'PENDING_CONFIRMATION',
        changedBy: customer.id,
        changedByName: customer.fullName,
        changedByEmail: customer.email,
        changedAt: timestamp,
        notes: 'Khách hàng tạo đơn thành công',
      },
    ];

    const newOrder: Order = {
      id: orderId,
      code: orderCode,
      customerId: customer.id,
      customerName: customer.fullName,
      customerEmail: customer.email,
      recipientName,
      recipientPhone,
      deliveryAddress,
      status: 'PENDING_CONFIRMATION',
      createdAt: timestamp,
      updatedAt: timestamp,
      items: resolvedItems,
      shipment: null,
      history: statusHistory,
    };

    if (shouldFailAt('ORDER_STORE', failurePoint)) {
      throw new StorageError(
        'Không thể lưu đơn hàng vào cơ sở dữ liệu. Giao dịch đã được hoàn tác.',
        'ORDER_STORE'
      );
    }

    const orderBackup = [...this.orders];
    this.orders.push(newOrder);

    if (shouldFailAt('ORDER_HISTORY', failurePoint)) {
      this.orders = orderBackup;
      throw new StorageError(
        'Không thể lưu lịch sử trạng thái đơn hàng. Giao dịch đã được hoàn tác.',
        'ORDER_HISTORY'
      );
    }

    return newOrder;
  }

  // Creates shipment for an order currently pending confirmation
  createShipment(orderId: string, shipperId: string, assignedBy: UserProfile): Order {
    const order = this.findOrderById(orderId);
    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
    }
    if (order.status !== 'PENDING_CONFIRMATION') {
      throw new Error('Chỉ có thể tạo vận đơn khi đơn ở trạng thái chờ xác nhận');
    }

    const shipper = this.findUserById(shipperId);
    if (!shipper || shipper.role !== 'Shipper') {
      throw new Error('Nhân viên giao hàng không hợp lệ');
    }

    const timestamp = new Date().toISOString();
    const datePrefix = timestamp.slice(0, 10).replace(/-/g, '');
    const trackingNumber = `TRK-${datePrefix}-${order.id.slice(-4)}`;

    order.shipment = {
      id: `shp_${Date.now()}`,
      trackingNumber,
      shipperId: shipper.id,
      shipperName: shipper.fullName,
      shipperEmail: shipper.email,
      shipperPhone: shipper.phoneNumber,
      failedAttempts: 0,
      assignedAt: timestamp,
    };

    const previousStatus = order.status;
    order.status = 'WAITING_PICKUP';
    order.updatedAt = timestamp;

    order.history = order.history || [];
    order.history.push({
      id: `hist_${order.id}_${order.history.length + 1}`,
      oldStatus: previousStatus,
      newStatus: 'WAITING_PICKUP',
      changedBy: assignedBy.id,
      changedByName: assignedBy.fullName,
      changedByEmail: assignedBy.email,
      changedAt: timestamp,
      notes: `Phân công nhân viên giao hàng: ${shipper.fullName}`,
    });

    return order;
  }

  // Updates shipment status by assigned shipper enforcing valid lifecycle rules
  updateShipmentStatus(
    identifier: string,
    action: ShipmentStatusAction,
    actor: UserProfile,
    notes?: string
  ): Order {
    const order = this.orders.find(
      (o) => o.id === identifier || o.shipment?.id === identifier || o.code === identifier
    );
    if (!order) {
      throw new Error('Vận đơn hoặc đơn hàng không tồn tại');
    }
    if (order.shipment?.shipperId !== actor.id) {
      throw new Error('Chỉ nhân viên giao hàng được phân công mới có quyền cập nhật');
    }

    const timestamp = new Date().toISOString();
    const previousStatus = order.status;
    let nextStatus: OrderStatusCode = previousStatus;

    if (action === 'START_DELIVERY') {
      if (previousStatus === 'FAILED_DELIVERY') {
        const attempts = order.shipment?.failedAttempts || 0;
        if (attempts >= APP_CONFIG.DELIVERY_RULES.MAX_FAILED_DELIVERY_ATTEMPTS) {
          throw new Error('Đơn hàng đã đạt tối đa 3 lần giao thất bại, không thể tiếp tục giao');
        }
      } else if (previousStatus !== 'WAITING_PICKUP') {
        throw new Error('Trạng thái hiện tại không thể bắt đầu giao');
      }
      nextStatus = 'DELIVERING';
    } else if (action === 'CONFIRM_DELIVERED') {
      if (previousStatus !== 'DELIVERING') {
        throw new Error('Chỉ có thể xác nhận giao hàng khi đơn đang trong trạng thái giao');
      }
      nextStatus = 'DELIVERED';
    }

    order.status = nextStatus;
    order.updatedAt = timestamp;
    order.history = order.history || [];
    order.history.push({
      id: `hist_${order.id}_${order.history.length + 1}`,
      oldStatus: previousStatus,
      newStatus: nextStatus,
      changedBy: actor.id,
      changedByName: actor.fullName,
      changedByEmail: actor.email,
      changedAt: timestamp,
      notes: notes || `Cập nhật trạng thái sang ${nextStatus}`,
    });

    return order;
  }

  // Lists assigned shipments for a specific shipper
  listAssignedShipments(shipperId: string): Order[] {
    return this.orders.filter(
      (o) =>
        o.shipment?.shipperId === shipperId &&
        ['WAITING_PICKUP', 'DELIVERING', 'FAILED_DELIVERY'].includes(o.status)
    );
  }

  // Looks up shipment tracking record by identifier
  trackShipment(identifier: string): Order | undefined {
    const normalized = identifier.trim().toLowerCase();
    return this.orders.find(
      (o) =>
        o.id.toLowerCase() === normalized ||
        o.code?.toLowerCase() === normalized ||
        o.shipment?.trackingNumber.toLowerCase() === normalized
    );
  }

  // Lists delivery issues with optional filter
  listIssues(params?: {
    resolved?: boolean;
    page?: number;
    limit?: number;
  }): { items: DeliveryIssue[]; total: number } {
    let result = [...this.issues];
    if (typeof params?.resolved === 'boolean') {
      result = result.filter((i) => i.resolved === params.resolved);
    }

    result.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

    const total = result.length;
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, params?.limit || APP_CONFIG.PAGINATION.DEFAULT_LIMIT);
    const startIndex = (page - 1) * limit;
    const items = result.slice(startIndex, startIndex + limit);

    return { items, total };
  }

  // Finds issue by identifier
  findIssueById(id: string): DeliveryIssue | undefined {
    return this.issues.find((i) => i.id === id);
  }

  // Reports delivery issue by shipper or administrator
  reportIssue(orderId: string, payload: ReportIssuePayload, actor: UserProfile): DeliveryIssue {
    const order = this.findOrderById(orderId);
    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
    }

    if (actor.role === 'Shipper') {
      if (order.status !== 'DELIVERING') {
        throw new Error('Nhân viên chỉ có thể báo sự cố khi đơn đang trên đường giao');
      }
      if (order.shipment?.shipperId !== actor.id) {
        throw new Error('Bạn không được phân công đơn hàng này');
      }
      if (payload.issueType !== 'FAILED_DELIVERY' && payload.issueType !== 'DAMAGED' && payload.issueType !== 'LOST') {
        throw new Error('Loại sự cố không hợp lệ cho nhân viên giao hàng');
      }
    } else if (actor.role === 'Admin') {
      if (order.status !== 'DELIVERING') {
        throw new Error('Chỉ có thể xác nhận sự cố khi đơn đang trên đường giao');
      }
      if (payload.issueType !== 'LOST') {
        throw new Error('Quản trị viên chỉ được xác nhận sự cố thất lạc');
      }
    } else {
      throw new Error('Không có quyền báo cáo sự cố');
    }

    const timestamp = new Date().toISOString();
    const issueIndex = this.issues.length + 1;
    const datePrefix = timestamp.slice(0, 10).replace(/-/g, '');
    const issueCode = `ISS-${datePrefix}-${String(issueIndex).padStart(4, '0')}`;

    const newIssue: DeliveryIssue = {
      id: `iss_${Date.now()}_${issueIndex}`,
      code: issueCode,
      orderId: order.id,
      orderCode: order.code,
      trackingNumber: order.shipment?.trackingNumber,
      issueType: payload.issueType,
      reportedBy: actor.id,
      reportedByName: actor.fullName,
      reportedByEmail: actor.email,
      reportedAt: timestamp,
      notes: payload.notes?.trim() || undefined,
      resolved: false,
    };

    const previousStatus = order.status;
    let nextStatus: OrderStatusCode = previousStatus;

    if (payload.issueType === 'FAILED_DELIVERY') {
      nextStatus = 'FAILED_DELIVERY';
      if (order.shipment) {
        order.shipment.failedAttempts = (order.shipment.failedAttempts || 0) + 1;
      }
    } else if (payload.issueType === 'DAMAGED') {
      nextStatus = 'DAMAGED';
    } else if (payload.issueType === 'LOST') {
      nextStatus = 'LOST';
    }

    order.status = nextStatus;
    order.updatedAt = timestamp;
    order.history = order.history || [];
    order.history.push({
      id: `hist_${order.id}_${order.history.length + 1}`,
      oldStatus: previousStatus,
      newStatus: nextStatus,
      changedBy: actor.id,
      changedByName: actor.fullName,
      changedByEmail: actor.email,
      changedAt: timestamp,
      notes: `Báo cáo sự cố ${payload.issueType}: ${payload.notes || ''}`.trim(),
    });

    this.issues.push(newIssue);
    return newIssue;
  }

  // Resolves delivery issue by administrator enforcing prerequisites
  resolveIssue(issueId: string, payload: ResolveIssuePayload, actor: UserProfile): DeliveryIssue {
    const issue = this.findIssueById(issueId);
    if (!issue) {
      throw new Error('Sự cố không tồn tại');
    }
    if (issue.resolved) {
      throw new Error('Sự cố đã được giải quyết trước đó, không thể xử lý lại');
    }

    const order = this.findOrderById(issue.orderId);
    if (issue.issueType === 'FAILED_DELIVERY') {
      const attempts = order?.shipment?.failedAttempts || 0;
      if (attempts >= APP_CONFIG.DELIVERY_RULES.MAX_FAILED_DELIVERY_ATTEMPTS && order?.status !== 'RETURNING') {
        throw new Error('Đơn hàng đã giao thất bại 3 lần phải được chuyển hoàn trước khi giải quyết sự cố');
      }
    }

    const notes = (payload.resolutionNotes || payload.resolutionResult || '').trim();
    if (!notes) {
      throw new Error('Nội dung xử lý sự cố (resolutionNotes) không được để trống');
    }
    if (notes.length > APP_CONFIG.VALIDATION.FREE_TEXT_MAX_LENGTH) {
      throw new Error('Nội dung xử lý sự cố vượt quá độ dài tối đa cho phép');
    }

    const timestamp = new Date().toISOString();
    issue.resolved = true;
    issue.resolvedBy = actor.id;
    issue.resolvedAt = timestamp;
    issue.resolutionNotes = notes;

    return issue;
  }

  // Lists return requests with optional filtering
  listReturns(params?: { status?: ReturnStatusCode; customerId?: string }): ReturnRequest[] {
    let result = [...this.returns];
    if (params?.status) {
      result = result.filter((r) => r.status === params.status);
    }
    if (params?.customerId) {
      result = result.filter((r) => r.customerId === params.customerId);
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }

  // Finds return request by identifier
  findReturnById(id: string): ReturnRequest | undefined {
    return this.returns.find((r) => r.id === id);
  }

  // Submits a return request enforcing return window and active limit
  submitReturn(payload: SubmitReturnPayload, customer: UserProfile): ReturnRequest {
    const notes = payload.notes?.trim();
    if (payload.reason === 'OTHER' && !notes) {
      throw new Error('Lý do khác yêu cầu phải nhập phần mô tả chi tiết');
    }
    if (notes && notes.length > APP_CONFIG.VALIDATION.FREE_TEXT_MAX_LENGTH) {
      throw new Error(`Ghi chú không được vượt quá ${APP_CONFIG.VALIDATION.FREE_TEXT_MAX_LENGTH} ký tự`);
    }

    const order = this.findOrderById(payload.orderId);
    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
    }
    if (order.customerId !== customer.id) {
      throw new Error('Bạn không có quyền gửi yêu cầu trả hàng cho đơn này');
    }
    if (order.status !== 'DELIVERED') {
      throw new Error('Chỉ có thể yêu cầu trả hàng với đơn đã giao thành công');
    }

    const deliveredDate = new Date(order.updatedAt || order.createdAt).getTime();
    const now = Date.now();
    const diffDays = (now - deliveredDate) / (1000 * 60 * 60 * 24);
    if (diffDays > APP_CONFIG.DELIVERY_RULES.RETURN_WINDOW_DAYS) {
      throw new Error('Đơn hàng đã vượt quá thời hạn 15 ngày kể từ ngày giao');
    }

    const existingReturn = this.returns.find((r) => r.orderId === order.id);
    if (existingReturn) {
      throw new Error('Đơn hàng đã từng tạo yêu cầu hoàn trả, không thể tạo thêm');
    }

    const timestamp = new Date().toISOString();
    const returnIndex = this.returns.length + 1;
    const datePrefix = timestamp.slice(0, 10).replace(/-/g, '');
    const returnCode = `RET-${datePrefix}-${String(returnIndex).padStart(4, '0')}`;

    const newReturn: ReturnRequest = {
      id: `ret_${Date.now()}_${returnIndex}`,
      code: returnCode,
      orderId: order.id,
      orderCode: order.code,
      customerId: customer.id,
      reason: payload.reason,
      status: 'PENDING_APPROVAL',
      notes: notes || undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.returns.push(newReturn);
    return newReturn;
  }

  // Reviews return request approving or rejecting with mandatory reason
  reviewReturn(requestId: string, payload: ReviewReturnPayload, reviewer: UserProfile): ReturnRequest {
    const request = this.findReturnById(requestId);
    if (!request) {
      throw new Error('Yêu cầu hoàn trả không tồn tại');
    }
    if (request.status !== 'PENDING_APPROVAL') {
      throw new Error('Chỉ có thể duyệt yêu cầu đang chờ phê duyệt');
    }

    const timestamp = new Date().toISOString();
    const order = this.findOrderById(request.orderId);

    if (payload.action === 'APPROVE') {
      request.status = 'ACCEPTED';
      if (order) {
        const previousStatus = order.status;
        let nextStatus: OrderStatusCode = previousStatus;
        if (request.reason === 'DAMAGED_OR_DEFECTIVE') {
          nextStatus = 'DAMAGED';
        } else if (request.reason === 'ITEM_NOT_RECEIVED') {
          nextStatus = 'LOST';
        }

        if (nextStatus !== previousStatus) {
          order.status = nextStatus;
          order.updatedAt = timestamp;
          order.history = order.history || [];
          order.history.push({
            id: `hist_${order.id}_${order.history.length + 1}`,
            oldStatus: previousStatus,
            newStatus: nextStatus,
            changedBy: reviewer.id,
            changedByName: reviewer.fullName,
            changedAt: timestamp,
            notes: `Duyệt hoàn hàng lý do ${request.reason}, chuyển trạng thái sang ${nextStatus}`,
          });
        }
      }
    } else {
      const reason = payload.rejectionReason?.trim();
      if (!reason) {
        throw new Error('Lý do từ chối yêu cầu hoàn hàng không được để trống');
      }
      if (reason.length > APP_CONFIG.VALIDATION.FREE_TEXT_MAX_LENGTH) {
        throw new Error(`Lý do từ chối không được vượt quá ${APP_CONFIG.VALIDATION.FREE_TEXT_MAX_LENGTH} ký tự`);
      }
      request.status = 'REJECTED';
      request.rejectionReason = reason;
    }

    request.updatedAt = timestamp;
    return request;
  }

  // Completes return request workflow without altering order state
  completeReturn(requestId: string): ReturnRequest {
    const request = this.findReturnById(requestId);
    if (!request) {
      throw new Error('Yêu cầu hoàn trả không tồn tại');
    }
    if (request.status !== 'ACCEPTED') {
      throw new Error('Chỉ có thể hoàn tất yêu cầu đã được chấp nhận');
    }

    const timestamp = new Date().toISOString();
    request.status = 'COMPLETED';
    request.updatedAt = timestamp;
    return request;
  }
}

export const defaultStorage = new AppStorage();
