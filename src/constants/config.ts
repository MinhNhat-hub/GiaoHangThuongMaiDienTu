// Centralized business configuration and temporary boundary thresholds.

export const APP_CONFIG = {
  API_BASE_URL: '/api/v1',
  SOCKET_URL: 'http://localhost:3000',
  DEFAULT_LOCALE: 'vi',
  
  VALIDATION: {
    PHONE_REGEX: /^(0[35789])[0-9]{8}$/,
    ADDRESS_MIN_LENGTH: 5,
    ADDRESS_MAX_LENGTH: 255,
    MIN_ITEM_QUANTITY: 1,
    MAX_ITEM_QUANTITY: 99,
    MAX_ITEMS_PER_ORDER: 50,
  },

  DELIVERY_RULES: {
    MAX_FAILED_DELIVERY_ATTEMPTS: 3,
    RETURN_WINDOW_DAYS: 7,
    ACTIVE_RETURN_REQUEST_LIMIT_PER_ORDER: 1,
    STATUS_HISTORY_ORDER: 'DESC' as const, // newest to oldest on presentation
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    ADMIN_ISSUES_LIMIT: 10,
  },
} as const;

