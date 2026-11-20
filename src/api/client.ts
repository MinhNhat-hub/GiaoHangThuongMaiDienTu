import { APP_CONFIG } from '@/constants/config';
import { MESSAGES } from '@/constants/messages';
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

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
export const AUTH_STORAGE_KEYS: readonly string[] = [TOKEN_KEY, USER_KEY];
export const AUTH_CHANGE_EVENT = 'auth-change';

// Generates a lightweight trace identifier for outgoing requests.
function generateTraceId(): string {
  return 'trace_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// Notifies listeners in the current tab when auth state changes.
function notifyAuthChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

// Executes a JSON request against the backend API with auth token propagation.
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
  } catch {
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
  } catch {
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
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    notifyAuthChange();
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setUser(user: UserProfile): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    notifyAuthChange();
  },

  getUser(): UserProfile | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  },

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    notifyAuthChange();
  },

  async register(payload: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
  }): Promise<AuthResponse> {
    const res = await executeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        phoneNumber: payload.phoneNumber.trim(),
      }),
    });
    return res.data;
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const normalizedEmail = payload.email.trim().toLowerCase();
    try {
      const res = await executeRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: normalizedEmail,
          password: payload.password,
        }),
      });
      if (!res.data.token || !res.data.user) {
        throw new ApiClientError(MESSAGES.AUTH.LOGIN_FAILED.vi, 'INVALID_AUTH_RESPONSE', res.traceId);
      }
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      notifyAuthChange();
      return res.data;
    } catch (err) {
      if (err instanceof ApiClientError && [400, 401, 403, 404].includes(err.status)) {
        throw new ApiClientError(
          MESSAGES.AUTH.LOGIN_FAILED.vi,
          'INVALID_CREDENTIALS',
          err.traceId,
          err.status
        );
      }
      throw err;
    }
  },

  // Signs out on the server, ignores request failures, and always clears the local session.
  async logout(): Promise<void> {
    await executeRequest<void>('/auth/logout', { method: 'POST' }).catch(() => undefined);
    this.clearToken();
  },

  async getMe(): Promise<UserProfile> {
    const res = await executeRequest<UserProfile>('/auth/me');
    if (res.data) {
      this.setUser(res.data);
    }
    return res.data;
  },

  async getProducts(): Promise<Product[]> {
    const res = await executeRequest<Product[]>('/products');
    return res.data;
  },

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

  async processReturnShipment(shipmentOrOrderId: string): Promise<Order> {
    const res = await executeRequest<Order>(`/shipments/${shipmentOrOrderId}/return`, {
      method: 'POST',
    });
    return res.data;
  },

  async confirmReturnReceived(shipmentOrOrderId: string): Promise<Order> {
    const res = await executeRequest<Order>(`/shipments/${shipmentOrOrderId}/confirm-returned`, {
      method: 'POST',
    });
    return res.data;
  },

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
    const res = await executeRequest<DeliveryIssue>('/issues', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        issueType: payload.issueType,
        notes: payload.notes,
      }),
    });
    return res.data;
  },

  async resolveIssue(issueId: string, payload: ResolveIssuePayload): Promise<DeliveryIssue> {
    const resolutionNotes = payload.resolutionNotes ?? payload.resolutionResult ?? '';
    const res = await executeRequest<DeliveryIssue>(`/issues/${issueId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolutionNotes }),
    });
    return res.data;
  },

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

  async listShippers(): Promise<Array<{ id: string; fullName: string; email?: string; phoneNumber?: string }>> {
    const res = await executeRequest<Array<{ id: string; fullName: string; email?: string; phoneNumber?: string }>>(
      '/users?role=Shipper'
    );
    return res.data;
  },
};
