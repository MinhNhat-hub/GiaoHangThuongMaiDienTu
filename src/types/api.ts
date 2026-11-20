import type { OrderStatusCode, ReturnStatusCode } from '@/constants/status-map';

export type UserRole = 'Customer' | 'Shipper' | 'Admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: ApiErrorResponse | null;
  trace_id: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
}

export interface StatusHistoryEntry {
  id?: string;
  oldStatus: OrderStatusCode | null;
  newStatus: OrderStatusCode;
  changedBy: string;
  changedByName?: string;
  changedByEmail?: string;
  changedAt: string;
  notes?: string;
}

export interface ShipmentSummary {
  id: string;
  trackingNumber: string;
  shipperId: string;
  shipperName?: string;
  shipperEmail?: string;
  shipperPhone?: string;
  failedAttempts: number;
  assignedAt: string;
}

export interface Order {
  id: string;
  code?: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  status: OrderStatusCode;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  shipment?: ShipmentSummary | null;
  history?: StatusHistoryEntry[];
}

export type DeliveryIssueType = 'DAMAGED' | 'FAILED_DELIVERY' | 'LOST';

export interface DeliveryIssue {
  id: string;
  code?: string;
  orderId: string;
  orderCode?: string;
  trackingNumber?: string;
  issueType: DeliveryIssueType;
  reportedBy: string;
  reportedByName?: string;
  reportedByEmail?: string;
  reportedAt: string;
  notes?: string;
  resolved: boolean;
  resolutionResult?: string;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export type ReturnReason = 'DAMAGED_OR_DEFECTIVE' | 'ITEM_NOT_RECEIVED' | 'OTHER';

export interface ReturnRequest {
  id: string;
  code?: string;
  orderId: string;
  orderCode?: string;
  customerId: string;
  reason: ReturnReason;
  status: ReturnStatusCode;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderPayload {
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface CreateShipmentPayload {
  orderId: string;
  shipperId: string;
}

export type ShipmentStatusAction = 'START_DELIVERY' | 'CONFIRM_DELIVERED';

export interface UpdateShipmentStatusPayload {
  action: ShipmentStatusAction;
  notes?: string;
}

export interface ReportIssuePayload {
  orderId?: string;
  issueType: DeliveryIssueType;
  notes?: string;
}

export interface ResolveIssuePayload {
  resolutionNotes?: string;
  resolutionResult?: string;
}

export interface SubmitReturnPayload {
  orderId: string;
  reason: ReturnReason;
  notes?: string;
}

export interface ReviewReturnPayload {
  action: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
}
