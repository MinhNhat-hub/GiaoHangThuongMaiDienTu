/**
 * Authoritative Status Mapping for Order and Return Request Lifecycles
 * Conforms 100% to SRS Appendix A.2 (State Transition Graph, T1-T12 & R1-R4)
 * Theme: Neobank Mint (Pure Neobank Badge System, Zero Pastel Carnival)
 *
 * 13 states strictly categorized into semantic visual badge styles:
 * - Pending (.badge-pending: outline, secondary-dark ink)
 * - Processing (.badge-processing: mint neutral bg, primary ink, no dot)
 * - Completed (.badge-completed: Tertiary accent bg, white ink)
 * - Outlined Warning (.badge-warning: transparent bg, amber border and amber ink)
 * - Outlined Danger (.badge-danger: transparent bg, crimson border and crimson ink)
 * - Outlined Accepted (.badge-accepted: transparent bg, Tertiary border and Tertiary ink)
 *
 * All badgeClasses reference Neobank Mint badge tokens:
 * Single Source of Truth for colors and contrast ratios (WCAG 2.1 AA >= 4.5:1).
 */

export type StatusGroup = 'pending' | 'processing' | 'completed' | 'issue';
export type StatusTone = 'default' | 'info' | 'success' | 'warning' | 'danger';

export type OrderStatusCode =
  | 'PENDING_CONFIRMATION'
  | 'WAITING_PICKUP'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'FAILED_DELIVERY'
  | 'RETURNING'
  | 'RETURNED_TO_SELLER'
  | 'DAMAGED'
  | 'LOST';

export type ReturnStatusCode =
  | 'PENDING_APPROVAL'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED';

export type AnyStatusCode = OrderStatusCode | ReturnStatusCode;

export interface StatusMeta {
  code: AnyStatusCode;
  labelVi: string;
  labelEn: string;
  group: StatusGroup;
  tone: StatusTone;
  badgeClass: string;
  dotClass: string;
  descriptionVi: string;
}

/**
 * 9 Order Statuses defined in SRS Appendix A.2
 */
export const ORDER_STATUS_MAP: Record<OrderStatusCode, StatusMeta> = {
  PENDING_CONFIRMATION: {
    code: 'PENDING_CONFIRMATION',
    labelVi: 'Chờ xác nhận',
    labelEn: 'Pending Confirmation',
    group: 'pending',
    tone: 'default',
    badgeClass: 'badge badge-pending',
    dotClass: 'bg-[#6B8679]',
    descriptionVi: 'Đơn hàng mới được tạo, chờ Admin tạo vận đơn và phân công Shipper',
  },
  WAITING_PICKUP: {
    code: 'WAITING_PICKUP',
    labelVi: 'Chờ lấy hàng',
    labelEn: 'Waiting Pickup',
    group: 'processing',
    tone: 'info',
    badgeClass: 'badge badge-processing',
    dotClass: 'bg-[#28C76F]',
    descriptionVi: 'Đã phân công Shipper, chờ Shipper đến lấy kiện hàng',
  },
  DELIVERING: {
    code: 'DELIVERING',
    labelVi: 'Đang giao',
    labelEn: 'Delivering',
    group: 'processing',
    tone: 'info',
    badgeClass: 'badge badge-processing',
    dotClass: 'bg-[#28C76F]',
    descriptionVi: 'Shipper đã nhận hàng và đang trên đường giao tới người nhận',
  },
  DELIVERED: {
    code: 'DELIVERED',
    labelVi: 'Đã giao',
    labelEn: 'Delivered',
    group: 'completed',
    tone: 'success',
    badgeClass: 'badge badge-completed',
    dotClass: 'bg-[#28C76F]',
    descriptionVi: 'Giao hàng thành công tới người nhận',
  },
  FAILED_DELIVERY: {
    code: 'FAILED_DELIVERY',
    labelVi: 'Giao không thành công',
    labelEn: 'Failed Delivery',
    group: 'issue',
    tone: 'warning',
    badgeClass: 'badge badge-warning',
    dotClass: 'bg-[#D97706]',
    descriptionVi: 'Không thể giao hàng cho người nhận, chờ giao lại hoặc chuyển trả lại',
  },
  RETURNING: {
    code: 'RETURNING',
    labelVi: 'Đang hoàn hàng',
    labelEn: 'Returning',
    group: 'issue',
    tone: 'warning',
    badgeClass: 'badge badge-warning',
    dotClass: 'bg-[#D97706]',
    descriptionVi: 'Đơn hàng gặp sự cố giao thất bại đạt giới hạn, đang trong quá trình chuyển hoàn trả về người bán',
  },
  RETURNED_TO_SELLER: {
    code: 'RETURNED_TO_SELLER',
    labelVi: 'Đã hoàn về người bán',
    labelEn: 'Returned to Seller',
    group: 'completed',
    tone: 'success',
    badgeClass: 'badge badge-completed',
    dotClass: 'bg-[#28C76F]',
    descriptionVi: 'Hàng đã được chuyển hoàn về kho và người bán đã xác nhận nhận lại',
  },
  DAMAGED: {
    code: 'DAMAGED',
    labelVi: 'Hư hỏng',
    labelEn: 'Damaged',
    group: 'issue',
    tone: 'danger',
    badgeClass: 'badge badge-danger',
    dotClass: 'bg-[#E11D48]',
    descriptionVi: 'Hàng hóa bị hư hỏng trong quá trình vận chuyển hoặc theo yêu cầu hoàn hàng',
  },
  LOST: {
    code: 'LOST',
    labelVi: 'Thất lạc',
    labelEn: 'Lost',
    group: 'issue',
    tone: 'danger',
    badgeClass: 'badge badge-danger',
    dotClass: 'bg-[#E11D48]',
    descriptionVi: 'Hàng hóa bị thất lạc trong quá trình vận chuyển hoặc theo yêu cầu hoàn hàng',
  },
};

/**
 * 4 Return Request Statuses defined in SRS Appendix A.2
 */
export const RETURN_STATUS_MAP: Record<ReturnStatusCode, StatusMeta> = {
  PENDING_APPROVAL: {
    code: 'PENDING_APPROVAL',
    labelVi: 'Chờ duyệt',
    labelEn: 'Pending Approval',
    group: 'pending',
    tone: 'default',
    badgeClass: 'badge badge-pending',
    dotClass: 'bg-[#6B8679]',
    descriptionVi: 'Khách hàng đã gửi yêu cầu hoàn hàng, chờ Admin xem xét',
  },
  ACCEPTED: {
    code: 'ACCEPTED',
    labelVi: 'Đã chấp nhận',
    labelEn: 'Accepted',
    group: 'processing',
    tone: 'info',
    badgeClass: 'badge badge-accepted',
    dotClass: 'bg-[#28C76F]',
    descriptionVi: 'Admin đã duyệt yêu cầu hoàn hàng',
  },
  REJECTED: {
    code: 'REJECTED',
    labelVi: 'Bị từ chối',
    labelEn: 'Rejected',
    group: 'issue',
    tone: 'danger',
    badgeClass: 'badge badge-danger',
    dotClass: 'bg-[#E11D48]',
    descriptionVi: 'Admin từ chối yêu cầu hoàn hàng',
  },
  COMPLETED: {
    code: 'COMPLETED',
    labelVi: 'Hoàn tất',
    labelEn: 'Completed',
    group: 'completed',
    tone: 'success',
    badgeClass: 'badge badge-completed',
    dotClass: 'bg-[#28C76F]',
    descriptionVi: 'Quá trình hoàn hàng đã hoàn tất',
  },
};

/**
 * Combined dictionary for generic status lookups
 */
export const ALL_STATUS_MAP: Record<AnyStatusCode, StatusMeta> = {
  ...ORDER_STATUS_MAP,
  ...RETURN_STATUS_MAP,
};

export function getOrderStatusMeta(code: OrderStatusCode): StatusMeta {
  return ORDER_STATUS_MAP[code];
}

export function getReturnStatusMeta(code: ReturnStatusCode): StatusMeta {
  return RETURN_STATUS_MAP[code];
}

export function getStatusMeta(code: AnyStatusCode): StatusMeta {
  return ALL_STATUS_MAP[code];
}

export function getAllStatusMetas(): StatusMeta[] {
  return Object.values(ALL_STATUS_MAP);
}

/**
 * Canonical Vietnamese diacritics benchmark string for font verification
 */
export const VIETNAMESE_STATUS_BENCHMARK_STRING =
  'Giao không thành công, Đã hoàn về người bán, Hư hỏng, Thất lạc';
