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
  AUTH_PAGE: {
    BRAND_TITLE: {
      vi: 'Giao Hàng TMĐT',
      en: 'E-Commerce Delivery',
    },
    BRAND_SUBTITLE: {
      vi: 'Dịch vụ Giao hàng & Vận chuyển Thông minh',
      en: 'Smart Logistics & Delivery Service',
    },
    HERO_TITLE: {
      vi: 'Giao nhận nhanh chóng, tận tâm đến từng chặng đường',
      en: 'Fast, dedicated delivery across every mile',
    },
    HERO_DESCRIPTION: {
      vi: 'Hệ thống quản lý dịch vụ giao hàng thông minh, cập nhật tình trạng lộ trình tức thời và hỗ trợ xử lý sự cố chuẩn xác.',
      en: 'Smart shipping platform providing real-time tracking updates and precise exception handling.',
    },
    LOGIN_TITLE: {
      vi: 'Đăng nhập tài khoản',
      en: 'Sign in to Account',
    },
    LOGIN_SUBTITLE: {
      vi: 'Nhập thông tin xác thực để truy cập bảng điều khiển vận hành',
      en: 'Enter your credentials to access the operational dashboard',
    },
    IDENTIFIER_LABEL: {
      vi: 'Tài khoản (Email, SĐT hoặc Tên đăng nhập)',
      en: 'Account (Email, Phone or Username)',
    },
    IDENTIFIER_PLACEHOLDER: {
      vi: 'name@example.com hoặc số điện thoại...',
      en: 'name@example.com or phone number...',
    },
    PASSWORD_LABEL: {
      vi: 'Mật khẩu',
      en: 'Password',
    },
    PASSWORD_PLACEHOLDER: {
      vi: 'Nhập mật khẩu...',
      en: 'Enter your password...',
    },
    SUBMIT_BUTTON: {
      vi: 'Đăng nhập',
      en: 'Sign in',
    },
    SUBMITTING: {
      vi: 'Đang xác thực...',
      en: 'Authenticating...',
    },
    TEST_ACCOUNTS_LABEL: {
      vi: 'Tài khoản kiểm thử vai trò',
      en: 'Quick Role Presets',
    },
    NO_ACCOUNT_PROMPT: {
      vi: 'Chưa có tài khoản?',
      en: "Don't have an account?",
    },
    REGISTER_LINK: {
      vi: 'Đăng ký tài khoản Khách hàng',
      en: 'Register Customer Account',
    },
    FOOTER_COPYRIGHT: {
      vi: '© 2026 Hệ thống Quản lý Dịch vụ Giao hàng TMĐT. Tiêu chuẩn Neobank Mint.',
      en: '© 2026 E-Commerce Delivery Management System. Neobank Mint Standard.',
    },
    FOOTER_HELP: {
      vi: 'Hỗ trợ kỹ thuật',
      en: 'Technical Support',
    },
    FOOTER_TERMS: {
      vi: 'Điều khoản dịch vụ',
      en: 'Terms of Service',
    },
    FOOTER_PRIVACY: {
      vi: 'Bảo mật thông tin',
      en: 'Privacy Policy',
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
