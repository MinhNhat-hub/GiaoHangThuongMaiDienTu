export const ORDER_STATUS = {
  PENDING: 'Chờ xác nhận',
  AWAITING_PICKUP: 'Chờ lấy hàng',
  DELIVERING: 'Đang giao',
  DELIVERED: 'Đã giao',
  FAILED_DELIVERY: 'Giao không thành công',
  RETURNING: 'Đang hoàn hàng',
  RETURNED_TO_SELLER: 'Đã hoàn về người bán',
  DAMAGED: 'Hư hỏng',
  LOST: 'Thất lạc',
} as const;

export type OrderStatusName = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ALL_ORDER_STATUSES: OrderStatusName[] = Object.values(ORDER_STATUS);

export const NON_PENDING_ORDER_STATUSES: OrderStatusName[] = ALL_ORDER_STATUSES.filter(
  (status) => status !== ORDER_STATUS.PENDING,
);

export const RETURN_STATUS = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã chấp nhận',
  REJECTED: 'Bị từ chối',
  COMPLETED: 'Hoàn tất',
} as const;

export const RETURN_REASON = {
  DEFECTIVE: 'Hàng lỗi / hư hỏng',
  NOT_RECEIVED: 'Chưa nhận được hàng',
  OTHER: 'Khác',
} as const;

export const INCIDENT_TYPE = {
  DAMAGED: 'Hàng hỏng',
  FAILED_DELIVERY: 'Giao không thành công',
  LOST: 'Thất lạc',
} as const;

export const ISOLATED_TAG = '@isolated';

export const SHORT_TEXT = 'A';

export const TIMESTAMP_FORMAT = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;

export const MAX_FREE_TEXT_LENGTH = 500;

export const FAILED_DELIVERY_LIMIT = 3;

export const RECONNECT_TIMEOUT_MS = 30_000;

export const LONG_SCENARIO_TIMEOUT_MS = 240_000;

export const MAX_PASSWORD_LENGTH = 64;

export const REALTIME_TIMEOUT_MS = 15_000;

export const OBSERVATION_WINDOW_MS = 120_000;

export const LOAD_MARKER_KEY = 'e2eLoadMarker';

export const SCREEN_NAME = {
  LOGIN: 'Đăng nhập',
  REGISTER: 'Đăng ký',
  CUSTOMER_HOME: 'Trang chủ Customer',
  ORDER_CREATION: 'Tạo đơn hàng',
  ORDER_DETAILS: 'Chi tiết đơn hàng',
  RETURN_REQUEST: 'Yêu cầu hoàn hàng',
  TRACKING: 'Theo dõi vận chuyển',
  ADMIN_DASHBOARD: 'Bảng điều khiển Admin',
  SHIPPER_DELIVERY: 'Màn hình giao hàng của Shipper',
} as const;

export const APP_PATHS = {
  login: '/',
  register: '/register',
  customerHome: '/',
  orderList: '/orders',
  orderCreation: '/orders/new',
  returnList: '/returns',
  adminDashboard: '/admin',
  shipperDeliveries: '/shipper',
  orderDetails: (code: string): string => `/orders/${code}`,
  returnRequest: (code: string): string => `/orders/${code}/return`,
  tracking: (code: string): string => `/orders/${code}/tracking`,
} as const;
