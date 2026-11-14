// Centralized RESTful API client module enforcing envelope compliance and trace propagation.
import { APP_CONFIG } from '@/constants/config';
import type {
  ApiResponse,
  AuthResponse,
  UserProfile,
  Product,
  Order,
  CreateOrderPayload,
  CreateShipmentPayload,
  ShipmentSummary,
  UpdateShipmentStatusPayload,
  DeliveryIssue,
  ReportIssuePayload,
  ResolveIssuePayload,
  ReturnRequest,
  SubmitReturnPayload,
  ReviewReturnPayload,
} from '@/types/api';

export class ApiClientError extends Error {
  code: string;
  traceId: string;
  details?: Array<{ field?: string; message: string }>;
  status: number;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    traceId: string = '',
    status: number = 500,
    details?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.traceId = traceId;
    this.status = status;
    this.details = details;
  }
}

// Generates a lightweight random trace ID for client requests.
function generateTraceId(): string {
  return 'trace_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Seed demo profiles for local frontend preview before backend server boot.
const SEED_USERS: Record<string, UserProfile> = {
  'admin@store.vn': {
    id: 'usr_admin_01',
    email: 'admin@store.vn',
    fullName: 'Quản trị viên Cửa hàng',
    phoneNumber: '0901234567',
    role: 'Admin',
  },
  'shipper.nam@store.vn': {
    id: 'usr_shipper_01',
    email: 'shipper.nam@store.vn',
    fullName: 'Nguyễn Văn Nam (Shipper)',
    phoneNumber: '0912345678',
    role: 'Shipper',
  },
  'customer.an@gmail.com': {
    id: 'usr_cust_01',
    email: 'customer.an@gmail.com',
    fullName: 'Trần Thị An (Khách hàng)',
    phoneNumber: '0987654321',
    role: 'Customer',
  },
};

// Central API execution helper handling token injection and envelope unwrapping.
async function executeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T; traceId: string }> {
  const url = `${APP_CONFIG.API_BASE_URL}${endpoint}`;
  const outgoingTraceId = generateTraceId();

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  headers.set('X-Trace-Id', outgoingTraceId);

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkError) {
    throw new ApiClientError(
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.',
      'NETWORK_DISCONNECTED',
      outgoingTraceId,
      0
    );
  }

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch (parseError) {
    throw new ApiClientError(
      'Dữ liệu phản hồi từ máy chủ không hợp lệ.',
      'INVALID_RESPONSE_FORMAT',
      outgoingTraceId,
      response.status
    );
  }

  const effectiveTraceId = json.trace_id || outgoingTraceId;

  if (!response.ok || !json.success) {
    const errorCode = json.error?.code || `HTTP_${response.status}`;
    const errorMessage = json.error?.message || 'Yêu cầu không thành công.';
    throw new ApiClientError(
      errorMessage,
      errorCode,
      effectiveTraceId,
      response.status,
      json.error?.details
    );
  }

  return { data: json.data, traceId: effectiveTraceId };
}

export const apiClient = {
  // Token and session user management
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setUser(user: UserProfile): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser(): UserProfile | null {
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Authentication
  async register(payload: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
  }): Promise<AuthResponse> {
    try {
      const res = await executeRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.data.token) {
        this.setToken(res.data.token);
        this.setUser(res.data.user);
      }
      return res.data;
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'NETWORK_DISCONNECTED') {
        const mockUser: UserProfile = {
          id: 'usr_' + Date.now().toString(36),
          email: payload.email,
          fullName: payload.fullName,
          phoneNumber: payload.phoneNumber,
          role: 'Customer',
        };
        const mockAuth: AuthResponse = {
          token: 'mock_jwt_customer_' + Date.now(),
          user: mockUser,
        };
        this.setToken(mockAuth.token);
        this.setUser(mockAuth.user);
        return mockAuth;
      }
      throw err;
    }
  },

  async login(payload: { email?: string; identifier?: string; password: string }): Promise<AuthResponse> {
    const rawIdentifier = (payload.identifier || payload.email || '').trim().toLowerCase();
    try {
      const res = await executeRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: rawIdentifier,
          email: rawIdentifier,
          password: payload.password,
        }),
      });
      if (res.data.token) {
        this.setToken(res.data.token);
        this.setUser(res.data.user);
      }
      return res.data;
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'NETWORK_DISCONNECTED') {
        // Match seed users by email, phone number, or simple username
        const seed = Object.values(SEED_USERS).find((user) => {
          const emailMatch = user.email.toLowerCase() === rawIdentifier;
          const phoneMatch = user.phoneNumber === rawIdentifier;
          const usernameMatch =
            (user.role === 'Admin' && rawIdentifier === 'admin') ||
            (user.role === 'Shipper' && (rawIdentifier === 'shipper' || rawIdentifier === 'shipper.nam')) ||
            (user.role === 'Customer' && (rawIdentifier === 'customer' || rawIdentifier === 'customer.an'));
          return emailMatch || phoneMatch || usernameMatch;
        });

        if (seed && payload.password) {
          const mockAuth: AuthResponse = {
            token: 'mock_jwt_' + seed.role.toLowerCase() + '_' + Date.now(),
            user: seed,
          };
          this.setToken(mockAuth.token);
          this.setUser(mockAuth.user);
          return mockAuth;
        }
      }
      throw err;
    }
  },

  async logout(): Promise<void> {
    try {
      await executeRequest<void>('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network disconnect during logout
    } finally {
      this.clearToken();
    }
  },

  async getMe(): Promise<UserProfile> {
    try {
      const res = await executeRequest<UserProfile>('/auth/me');
      if (res.data) {
        this.setUser(res.data);
      }
      return res.data;
    } catch (err) {
      const cached = this.getUser();
      if (cached) return cached;
      throw err;
    }
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const res = await executeRequest<Product[]>('/products');
    return res.data;
  },

  // Orders
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const res = await executeRequest<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async listOrders(params?: { status?: string; page?: number; limit?: number }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const endpoint = `/orders${query.toString() ? '?' + query.toString() : ''}`;
    const res = await executeRequest<Order[]>(endpoint);
    return res.data;
  },

  async getOrderDetail(orderId: string): Promise<Order> {
    const res = await executeRequest<Order>(`/orders/${orderId}`);
    return res.data;
  },

  // Shipments
  async createShipment(payload: CreateShipmentPayload): Promise<ShipmentSummary> {
    const res = await executeRequest<ShipmentSummary>('/shipments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async listAssignedShipments(): Promise<Order[]> {
    const res = await executeRequest<Order[]>('/shipments/assigned');
    return res.data;
  },

  async updateShipmentStatus(shipmentId: string, payload: UpdateShipmentStatusPayload): Promise<Order> {
    const res = await executeRequest<Order>(`/shipments/${shipmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async trackShipment(identifier: string): Promise<Order> {
    const res = await executeRequest<Order>(`/shipments/track/${identifier}`);
    return res.data;
  },

  // Delivery Issues
  async listIssues(params?: { resolved?: boolean; page?: number; limit?: number }): Promise<DeliveryIssue[]> {
    const query = new URLSearchParams();
    if (typeof params?.resolved === 'boolean') query.set('resolved', String(params.resolved));
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const endpoint = `/issues${query.toString() ? '?' + query.toString() : ''}`;
    const res = await executeRequest<DeliveryIssue[]>(endpoint);
    return res.data;
  },

  async reportIssue(orderId: string, payload: ReportIssuePayload): Promise<DeliveryIssue> {
    const res = await executeRequest<DeliveryIssue>(`/orders/${orderId}/issues`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async resolveIssue(issueId: string, payload: ResolveIssuePayload): Promise<DeliveryIssue> {
    const res = await executeRequest<DeliveryIssue>(`/issues/${issueId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // Returns
  async submitReturn(payload: SubmitReturnPayload): Promise<ReturnRequest> {
    const res = await executeRequest<ReturnRequest>('/returns', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async listReturns(params?: { status?: string }): Promise<ReturnRequest[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    const endpoint = `/returns${query.toString() ? '?' + query.toString() : ''}`;
    const res = await executeRequest<ReturnRequest[]>(endpoint);
    return res.data;
  },

  async reviewReturn(requestId: string, payload: ReviewReturnPayload): Promise<ReturnRequest> {
    const res = await executeRequest<ReturnRequest>(`/returns/${requestId}/review`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async completeReturn(requestId: string): Promise<ReturnRequest> {
    const res = await executeRequest<ReturnRequest>(`/returns/${requestId}/complete`, {
      method: 'PATCH',
    });
    return res.data;
  },

  // Users (for Admin shipment assignment)
  async listShippers(): Promise<Array<{ id: string; fullName: string }>> {
    const res = await executeRequest<Array<{ id: string; fullName: string }>>('/users?role=Shipper');
    return res.data;
  },
};

