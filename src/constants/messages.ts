export type Locale = 'vi' | 'en';

export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: {
      vi: 'Đăng nhập thành công',
      en: 'Logged in successfully',
    },
    LOGIN_FAILED: {
      vi: 'Email hoặc mật khẩu không đúng.',
      en: 'Invalid email or password.',
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
      vi: 'Đăng nhập',
      en: 'Sign in',
    },
    LOGIN_SUBTITLE: {
      vi: 'Nhập email và mật khẩu để truy cập hệ thống',
      en: 'Enter your email and password to access the system',
    },
    IDENTIFIER_LABEL: {
      vi: 'Email',
      en: 'Email',
    },
    IDENTIFIER_PLACEHOLDER: {
      vi: 'name@example.com',
      en: 'name@example.com',
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
    NO_ACCOUNT_PROMPT: {
      vi: 'Chưa có tài khoản?',
      en: "Don't have an account?",
    },
    REGISTER_LINK: {
      vi: 'Đăng ký',
      en: 'Register',
    },
    FOOTER_COPYRIGHT: {
      vi: '© 2026 Hệ thống Quản lý Dịch vụ Giao hàng TMĐT.',
      en: '© 2026 E-Commerce Delivery Management System.',
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
  REGISTER_PAGE: {
    HERO_TITLE: {
      vi: 'Trải nghiệm dịch vụ giao hàng thông minh và tận tâm',
      en: 'Experience smart and dedicated delivery services',
    },
    HERO_DESCRIPTION: {
      vi: 'Đăng ký tài khoản Customer để tạo đơn hàng nhanh chóng, theo dõi lộ trình vận chuyển tức thời và quản lý yêu cầu hoàn hàng tiện lợi.',
      en: 'Register a Customer account to create orders quickly, track live delivery progression, and manage returns seamlessly.',
    },
    TITLE: {
      vi: 'Đăng ký',
      en: 'Register',
    },
    SUBTITLE: {
      vi: 'Điền thông tin để tạo tài khoản Customer',
      en: 'Fill in your details to create a Customer account',
    },
    FULLNAME_LABEL: {
      vi: 'Họ và Tên',
      en: 'Full Name',
    },
    FULLNAME_PLACEHOLDER: {
      vi: 'Ví dụ: Nguyễn Văn An',
      en: 'E.g., John Doe',
    },
    PHONE_LABEL: {
      vi: 'Số điện thoại',
      en: 'Phone Number',
    },
    PHONE_PLACEHOLDER: {
      vi: 'Ví dụ: 0912345678',
      en: 'E.g., 0912345678',
    },
    EMAIL_LABEL: {
      vi: 'Địa chỉ Email',
      en: 'Email Address',
    },
    EMAIL_PLACEHOLDER: {
      vi: 'name@example.com',
      en: 'name@example.com',
    },
    PASSWORD_LABEL: {
      vi: 'Mật khẩu',
      en: 'Password',
    },
    PASSWORD_PLACEHOLDER: {
      vi: 'Từ 8 đến 64 ký tự...',
      en: '8 to 64 characters...',
    },
    SUBMIT_BUTTON: {
      vi: 'Đăng ký',
      en: 'Register',
    },
    SUBMITTING: {
      vi: 'Đang khởi tạo tài khoản...',
      en: 'Creating account...',
    },
    HAS_ACCOUNT_PROMPT: {
      vi: 'Đã có tài khoản?',
      en: 'Already have an account?',
    },
    LOGIN_LINK: {
      vi: 'Đăng nhập',
      en: 'Sign in',
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
    ADMIN_CONFIRMED_LOST_NOTE: {
      vi: 'Admin xác nhận hàng hóa bị thất lạc.',
      en: 'Admin confirmed the goods were lost.',
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

// Resolves a localized message entry for the active locale.
export function getMessage(
  entry: { vi: string; en: string },
  locale: Locale = DEFAULT_LOCALE
): string {
  return entry[locale];
}
