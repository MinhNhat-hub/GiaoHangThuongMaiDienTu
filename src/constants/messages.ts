/**
 * Centralized Bilingual Localization Dictionary (i18n)
 * Single Source of Truth for user-facing feedback, alerts, dialogs and errors.
 * No monetary or payment messages included (system scope compliance).
 */

export type Locale = 'vi' | 'en';

export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: {
      vi: 'Đăng nhập thành công',
      en: 'Logged in successfully',
    },
    LOGIN_FAILED: {
      vi: 'Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.',
      en: 'Invalid credentials. Please try again.',
    },
    LOGOUT_SUCCESS: {
      vi: 'Đã đăng xuất khỏi hệ thống',
      en: 'Logged out successfully',
    },
    REGISTER_SUCCESS: {
      vi: 'Đăng ký tài khoản thành công',
      en: 'Account registered successfully',
    },
  },
  ORDER: {
    CREATE_SUCCESS: {
      vi: 'Tạo đơn hàng thành công',
      en: 'Order created successfully',
    },
    CREATE_FAILED: {
      vi: 'Tạo đơn hàng không thành công. Vui lòng kiểm tra lại thông tin.',
      en: 'Failed to create order. Please check your input.',
    },
    CONFIRM_PROMPT: {
      vi: 'Vui lòng kiểm tra kỹ thông tin đơn hàng trước khi xác nhận.',
      en: 'Please verify order details carefully before confirming.',
    },
    EMPTY_ITEMS: {
      vi: 'Vui lòng chọn ít nhất một sản phẩm để tạo đơn.',
      en: 'Please select at least one item to place an order.',
    },
  },
  SHIPMENT: {
    ASSIGN_SUCCESS: {
      vi: 'Đã phân công Shipper thành công',
      en: 'Shipper assigned successfully',
    },
    START_DELIVERY_SUCCESS: {
      vi: 'Đã nhận hàng và bắt đầu giao',
      en: 'Package picked up. Delivery started.',
    },
    CONFIRM_DELIVERED_SUCCESS: {
      vi: 'Xác nhận giao hàng thành công',
      en: 'Delivery confirmed successfully',
    },
  },
  RETURN: {
    SUBMIT_SUCCESS: {
      vi: 'Yêu cầu hoàn hàng đã được gửi và đang chờ duyệt',
      en: 'Return request submitted and pending review',
    },
    APPROVE_SUCCESS: {
      vi: 'Đã chấp nhận yêu cầu hoàn hàng',
      en: 'Return request approved',
    },
    REJECT_SUCCESS: {
      vi: 'Đã từ chối yêu cầu hoàn hàng',
      en: 'Return request rejected',
    },
    COMPLETE_SUCCESS: {
      vi: 'Đã ghi nhận hoàn tất quy trình hoàn hàng',
      en: 'Return process completed',
    },
  },
  ISSUE: {
    REPORT_SUCCESS: {
      vi: 'Đã ghi nhận báo cáo sự cố giao hàng',
      en: 'Delivery issue report recorded',
    },
    REDELIVER_SUCCESS: {
      vi: 'Đã chuyển đơn sang trạng thái giao lại',
      en: 'Order rescheduled for redelivery',
    },
    INITIATE_RETURN_SUCCESS: {
      vi: 'Đã chuyển đơn sang quy trình hoàn trả về người bán',
      en: 'Order marked for return to seller',
    },
    RESOLVE_SUCCESS: {
      vi: 'Đã ghi kết quả xử lý sự cố',
      en: 'Delivery issue resolved',
    },
  },
  NETWORK: {
    DISCONNECTED: {
      vi: 'Mất kết nối máy chủ. Đang tự động kết nối lại...',
      en: 'Server connection lost. Reconnecting automatically...',
    },
    RECONNECTED: {
      vi: 'Đã khôi phục kết nối. Dữ liệu đã được cập nhật mới nhất.',
      en: 'Connection restored. Data refreshed to latest state.',
    },
  },
} as const;

export const DEFAULT_LOCALE: Locale = 'vi';

export function getMessage(
  entry: { vi: string; en: string },
  locale: Locale = DEFAULT_LOCALE
): string {
  return entry[locale];
}
