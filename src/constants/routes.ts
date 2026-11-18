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

export const SCREEN_NAMES = {
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
