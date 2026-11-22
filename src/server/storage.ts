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

  // --- USERS & AUTH ---
  findUserByEmail(email: string): UserAccount | undefined {
    const normalized = email.trim().toLowerCase();
    return this.users.find((u) => u.email.toLowerCase() === normalized);
  }

  findUserById(id: string): UserAccount | undefined {
    return this.users.find((u) => u.id === id);
  }

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

  listUsersByRole(role?: string): UserProfile[] {
    let list = this.users;
    if (role) {
      list = list.filter((u) => u.role.toLowerCase() === role.toLowerCase());
    }
    return list.map(({ passwordHash: _, ...profile }) => profile);
  }

  // --- PRODUCTS ---
  listProducts(): Product[] {
    return [...this.products];
  }

  findProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  // --- ORDERS ---
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

  findOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id);
  }

  findOrderByCode(code: string): Order | undefined {
    return this.orders.find((o) => o.code === code);
  }

  // Creates order with simulated failure injection and transaction rollback support
  createOrder(
    payload: CreateOrderPayload,
    customer: UserProfile,
    failurePoint?: FailurePoint
  ): Order {
    const timestamp = new Date().toISOString();
    const orderIndex = this.orders.length + 1;
    const orderId = `ord_${Date.now()}_${orderIndex}`;
    const datePrefix = timestamp.slice(0, 10).replace(/-/g, '');
    const orderCode = `ORD-${datePrefix}-${String(orderIndex).padStart(4, '0')}`;

    // Map items with product names
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
      recipientName: payload.recipientName.trim(),
      recipientPhone: payload.recipientPhone.trim(),
      deliveryAddress: payload.deliveryAddress.trim(),
      status: 'PENDING_CONFIRMATION',
      createdAt: timestamp,
      updatedAt: timestamp,
      items: resolvedItems,
      shipment: null,
      history: statusHistory,
    };

    // Stage 1: Order Record Persistence
    if (shouldFailAt('ORDER_STORE', failurePoint)) {
      throw new StorageError(
        'Không thể lưu đơn hàng vào cơ sở dữ liệu. Giao dịch đã được hoàn tác.',
        'ORDER_STORE'
      );
    }

    // Temporary staging
    const orderBackup = [...this.orders];
    this.orders.push(newOrder);

    // Stage 2: Status History Persistence
    if (shouldFailAt('ORDER_HISTORY', failurePoint)) {
      // Rollback staged order
      this.orders = orderBackup;
      throw new StorageError(
        'Không thể lưu lịch sử trạng thái đơn hàng. Giao dịch đã được hoàn tác.',
        'ORDER_HISTORY'
      );
    }

    return newOrder;
  }

  createShipment(orderId: string, shipperId: string, assignedBy: UserProfile): Order {
    const order = this.findOrderById(orderId);
    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
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

    const timestamp = new Date().toISOString();
    const previousStatus = order.status;
    let nextStatus: OrderStatusCode = previousStatus;

    if (action === 'START_DELIVERY') {
      if (previousStatus !== 'WAITING_PICKUP' && previousStatus !== 'FAILED_DELIVERY') {
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

  listAssignedShipments(shipperId: string): Order[] {
    return this.orders.filter(
      (o) =>
        o.shipment?.shipperId === shipperId &&
        ['WAITING_PICKUP', 'DELIVERING', 'FAILED_DELIVERY'].includes(o.status)
    );
  }

  trackShipment(identifier: string): Order | undefined {
    const normalized = identifier.trim().toLowerCase();
    return this.orders.find(
      (o) =>
        o.id.toLowerCase() === normalized ||
        o.code?.toLowerCase() === normalized ||
        o.shipment?.trackingNumber.toLowerCase() === normalized
    );
  }

  // --- DELIVERY ISSUES ---
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

  findIssueById(id: string): DeliveryIssue | undefined {
    return this.issues.find((i) => i.id === id);
  }

  reportIssue(orderId: string, payload: ReportIssuePayload, actor: UserProfile): DeliveryIssue {
    const order = this.findOrderById(orderId);
    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
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

    // Update order status and shipment attempts
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

  resolveIssue(issueId: string, payload: ResolveIssuePayload, actor: UserProfile): DeliveryIssue {
    const issue = this.findIssueById(issueId);
    if (!issue) {
      throw new Error('Sự cố không tồn tại');
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

  // --- RETURNS ---
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

  findReturnById(id: string): ReturnRequest | undefined {
    return this.returns.find((r) => r.id === id);
  }

  submitReturn(payload: SubmitReturnPayload, customer: UserProfile): ReturnRequest {
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

    // Verify 15-day return window
    const deliveredDate = new Date(order.updatedAt || order.createdAt).getTime();
    const now = Date.now();
    const diffDays = (now - deliveredDate) / (1000 * 60 * 60 * 24);
    if (diffDays > APP_CONFIG.DELIVERY_RULES.RETURN_WINDOW_DAYS) {
      throw new Error('Đơn hàng đã vượt quá thời hạn 15 ngày kể từ ngày giao');
    }

    // Check for existing active return requests
    const activeExisting = this.returns.find(
      (r) => r.orderId === order.id && (r.status === 'PENDING_APPROVAL' || r.status === 'ACCEPTED')
    );
    if (activeExisting) {
      throw new Error('Đơn hàng đã có yêu cầu hoàn trả đang được xử lý');
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
      notes: payload.notes?.trim() || undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.returns.push(newReturn);
    return newReturn;
  }

  reviewReturn(requestId: string, payload: ReviewReturnPayload, reviewer: UserProfile): ReturnRequest {
    const request = this.findReturnById(requestId);
    if (!request) {
      throw new Error('Yêu cầu hoàn trả không tồn tại');
    }
    if (request.status !== 'PENDING_APPROVAL') {
      throw new Error('Chỉ có thể duyệt yêu cầu đang chờ phê duyệt');
    }

    const timestamp = new Date().toISOString();
    if (payload.action === 'APPROVE') {
      request.status = 'ACCEPTED';
      const order = this.findOrderById(request.orderId);
      if (order) {
        const previousStatus = order.status;
        order.status = 'RETURNING';
        order.updatedAt = timestamp;
        order.history = order.history || [];
        order.history.push({
          id: `hist_${order.id}_${order.history.length + 1}`,
          oldStatus: previousStatus,
          newStatus: 'RETURNING',
          changedBy: reviewer.id,
          changedByName: reviewer.fullName,
          changedAt: timestamp,
          notes: 'Duyệt yêu cầu hoàn trả, chuyển sang trạng thái đang hoàn hàng',
        });
      }
    } else {
      request.status = 'REJECTED';
      request.rejectionReason = payload.rejectionReason?.trim() || 'Admin từ chối yêu cầu';
    }

    request.updatedAt = timestamp;
    return request;
  }

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

    const order = this.findOrderById(request.orderId);
    if (order) {
      const previousStatus = order.status;
      order.status = 'RETURNED_TO_SELLER';
      order.updatedAt = timestamp;
      order.history = order.history || [];
      order.history.push({
        id: `hist_${order.id}_${order.history.length + 1}`,
        oldStatus: previousStatus,
        newStatus: 'RETURNED_TO_SELLER',
        changedBy: 'system',
        changedByName: 'Hệ thống',
        changedAt: timestamp,
        notes: 'Xác nhận người bán đã nhận lại kiện hàng',
      });
    }

    return request;
  }
}

// Global default storage instance
export const defaultStorage = new AppStorage();
