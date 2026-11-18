import { APP_CONFIG } from '@/constants/config';

export interface LoginFormInput {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface RegisterFormInput {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
}

export interface OrderLineInput {
  productId: string;
  quantity: string;
}

export interface OrderRecipientInput {
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
}

export interface OrderLineErrors {
  productError?: string;
  quantityError?: string;
}

export interface OrderRecipientErrors {
  recipientName?: string;
  recipientPhone?: string;
  deliveryAddress?: string;
}

// Computes normalized Unicode character length after NFC normalization.
export function getNormalizedLength(value: string): number {
  return value.normalize('NFC').length;
}

// Validates required email and password fields on login without exposing format hints.
export function validateLoginInput(input: LoginFormInput): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!input.email.trim()) {
    errors.email = 'Vui lòng nhập email.';
  }

  if (input.password.length === 0 || input.password.trim().length === 0) {
    errors.password = 'Vui lòng nhập mật khẩu.';
  }

  return errors;
}

// Validates registration fields against required, length, and format rules.
export function validateRegisterInput(input: RegisterFormInput): RegisterFormErrors {
  const errors: RegisterFormErrors = {};
  const trimmedName = input.fullName.trim();
  const trimmedEmail = input.email.trim();
  const trimmedPhone = input.phoneNumber.trim();

  if (!trimmedName) {
    errors.fullName = 'Vui lòng nhập họ tên.';
  } else if (getNormalizedLength(trimmedName) > APP_CONFIG.VALIDATION.FULL_NAME_MAX_LENGTH) {
    errors.fullName = `Họ tên không được vượt quá ${APP_CONFIG.VALIDATION.FULL_NAME_MAX_LENGTH} ký tự.`;
  }

  if (!trimmedEmail) {
    errors.email = 'Vui lòng nhập email.';
  } else if (getNormalizedLength(trimmedEmail) > APP_CONFIG.VALIDATION.EMAIL_MAX_LENGTH) {
    errors.email = `Email không được vượt quá ${APP_CONFIG.VALIDATION.EMAIL_MAX_LENGTH} ký tự.`;
  } else if (!APP_CONFIG.VALIDATION.HTML_EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Email không đúng định dạng.';
  }

  if (input.password.length === 0 || input.password.trim().length === 0) {
    errors.password = 'Vui lòng nhập mật khẩu.';
  } else {
    const passwordLength = getNormalizedLength(input.password);
    if (
      passwordLength < APP_CONFIG.VALIDATION.PASSWORD_MIN_LENGTH ||
      passwordLength > APP_CONFIG.VALIDATION.PASSWORD_MAX_LENGTH
    ) {
      errors.password = `Mật khẩu phải dài từ ${APP_CONFIG.VALIDATION.PASSWORD_MIN_LENGTH} đến ${APP_CONFIG.VALIDATION.PASSWORD_MAX_LENGTH} ký tự.`;
    }
  }

  if (!trimmedPhone) {
    errors.phoneNumber = 'Vui lòng nhập số điện thoại.';
  } else if (!APP_CONFIG.VALIDATION.PHONE_REGEX.test(trimmedPhone)) {
    errors.phoneNumber = 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng chữ số 0.';
  }

  return errors;
}

// Validates selected order product lines for emptiness, duplicates, and positive integer quantities.
export function validateOrderLines(lines: OrderLineInput[]): OrderLineErrors {
  const errors: OrderLineErrors = {};

  if (lines.length === 0) {
    errors.productError = 'Vui lòng chọn ít nhất một sản phẩm.';
    return errors;
  }

  const seenProducts = new Set<string>();
  for (const line of lines) {
    const productId = line.productId.trim();
    if (!productId) {
      errors.productError = 'Vui lòng chọn sản phẩm cho tất cả các dòng.';
    } else if (seenProducts.has(productId)) {
      errors.productError = 'Không được chọn trùng cùng một sản phẩm trên nhiều dòng.';
    } else {
      seenProducts.add(productId);
    }

    const rawQty = line.quantity.trim();
    if (!rawQty) {
      errors.quantityError = 'Vui lòng nhập số lượng cho mỗi sản phẩm.';
    } else if (!/^\d+$/.test(rawQty) || Number(rawQty) < APP_CONFIG.VALIDATION.MIN_ITEM_QUANTITY) {
      errors.quantityError = 'Số lượng phải là số nguyên lớn hơn hoặc bằng 1.';
    }
  }

  return errors;
}

// Validates recipient name, phone number, and delivery address fields.
export function validateOrderRecipient(input: OrderRecipientInput): OrderRecipientErrors {
  const errors: OrderRecipientErrors = {};
  const trimmedName = input.recipientName.trim();
  const trimmedPhone = input.recipientPhone.trim();
  const trimmedAddress = input.deliveryAddress.trim();

  if (!trimmedName) {
    errors.recipientName = 'Vui lòng nhập tên người nhận.';
  } else if (getNormalizedLength(trimmedName) > APP_CONFIG.VALIDATION.RECIPIENT_NAME_MAX_LENGTH) {
    errors.recipientName = `Tên người nhận không được vượt quá ${APP_CONFIG.VALIDATION.RECIPIENT_NAME_MAX_LENGTH} ký tự.`;
  }

  if (!trimmedPhone) {
    errors.recipientPhone = 'Vui lòng nhập số điện thoại người nhận.';
  } else if (!APP_CONFIG.VALIDATION.PHONE_REGEX.test(trimmedPhone)) {
    errors.recipientPhone = 'Số điện thoại người nhận phải gồm đúng 10 chữ số và bắt đầu bằng chữ số 0.';
  }

  if (!trimmedAddress) {
    errors.deliveryAddress = 'Vui lòng nhập địa chỉ giao.';
  } else if (getNormalizedLength(trimmedAddress) > APP_CONFIG.VALIDATION.ADDRESS_MAX_LENGTH) {
    errors.deliveryAddress = `Địa chỉ giao không được vượt quá ${APP_CONFIG.VALIDATION.ADDRESS_MAX_LENGTH} ký tự.`;
  }

  return errors;
}

// Validates optional or required 500-character free-text fields.
export function validateFreeText(
  value: string,
  options: { required: boolean; requiredMessage: string; fieldLabel: string }
): string | undefined {
  const trimmed = value.trim();
  if (options.required && !trimmed) {
    return options.requiredMessage;
  }
  if (getNormalizedLength(trimmed) > APP_CONFIG.VALIDATION.FREE_TEXT_MAX_LENGTH) {
    return `${options.fieldLabel} không được vượt quá ${APP_CONFIG.VALIDATION.FREE_TEXT_MAX_LENGTH} ký tự.`;
  }
  return undefined;
}
