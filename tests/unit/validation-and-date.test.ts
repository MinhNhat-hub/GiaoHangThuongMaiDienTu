import { describe, expect, it } from 'vitest';
import { formatDateTimeVi, isWithinReturnWindow } from '@/utils/date';
import {
  validateFreeText,
  validateLoginInput,
  validateOrderLines,
  validateOrderRecipient,
  validateRegisterInput,
} from '@/utils/validation';

describe('date and return window formatting', () => {
  it('test_formats_timestamp_as_dd_mm_yyyy_hh_mm_in_utc_plus_7', () => {
    expect(formatDateTimeVi('2026-11-18T00:05:30Z')).toBe('18/11/2026 07:05');
    expect(formatDateTimeVi('2026-11-18T17:30:00Z')).toBe('19/11/2026 00:30');
  });

  it('test_handles_empty_or_invalid_timestamp_safely', () => {
    expect(formatDateTimeVi(null)).toBe('—');
    expect(formatDateTimeVi(undefined)).toBe('—');
    expect(formatDateTimeVi('not-a-date')).toBe('not-a-date');
  });

  it('test_accepts_return_window_up_to_exact_15_days_minute_and_rejects_after', () => {
    const deliveredAt = '2026-11-01T10:15:40Z';
    const oneMinuteBefore = new Date('2026-11-16T10:14:59Z');
    const exactDeadlineSameMinute = new Date('2026-11-16T10:15:55Z');
    const oneMinuteAfter = new Date('2026-11-16T10:16:00Z');

    expect(isWithinReturnWindow(deliveredAt, oneMinuteBefore)).toBe(true);
    expect(isWithinReturnWindow(deliveredAt, exactDeadlineSameMinute)).toBe(true);
    expect(isWithinReturnWindow(deliveredAt, oneMinuteAfter)).toBe(false);
    expect(isWithinReturnWindow(null, oneMinuteBefore)).toBe(false);
  });
});

describe('validation rules', () => {
  it('test_rejects_empty_and_whitespace_login_inputs_without_enforcing_min_password_length', () => {
    expect(validateLoginInput({ email: '   ', password: '   ' })).toEqual({
      email: 'Vui lòng nhập email.',
      password: 'Vui lòng nhập mật khẩu.',
    });
    expect(validateLoginInput({ email: 'user@example.com', password: '123' })).toEqual({});
  });

  it('test_validates_register_boundaries_including_whitespace_password_and_max_lengths', () => {
    expect(
      validateRegisterInput({
        fullName: 'A',
        email: 'a@b.vn',
        password: 'abcdefgh',
        phoneNumber: '0123456789',
      })
    ).toEqual({});

    const maxLocal = 'a'.repeat(64);
    const maxDomain = `${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(58)}.vn`;
    const maxEmail = `${maxLocal}@${maxDomain}`;
    expect(maxEmail.length).toBe(254);

    expect(
      validateRegisterInput({
        fullName: 'a'.repeat(100),
        email: `  ${maxEmail}  `,
        password: 'p'.repeat(64),
        phoneNumber: '0912345678',
      })
    ).toEqual({});

    const overflowErrors = validateRegisterInput({
      fullName: 'a'.repeat(101),
      email: `${maxEmail}x`,
      password: ' '.repeat(8),
      phoneNumber: '1912345678',
    });
    expect(overflowErrors.fullName).toBeDefined();
    expect(overflowErrors.email).toBeDefined();
    expect(overflowErrors.password).toBe('Vui lòng nhập mật khẩu.');
    expect(overflowErrors.phoneNumber).toBeDefined();
  });

  it('test_rejects_duplicate_products_and_non_integer_or_non_positive_quantities', () => {
    expect(validateOrderLines([])).toEqual({
      productError: 'Vui lòng chọn ít nhất một sản phẩm.',
    });

    const duplicateAndInvalidQty = validateOrderLines([
      { productId: 'prod_01', quantity: '1' },
      { productId: 'prod_01', quantity: '1.5' },
    ]);
    expect(duplicateAndInvalidQty.productError).toBeDefined();
    expect(duplicateAndInvalidQty.quantityError).toBeDefined();

    expect(
      validateOrderLines([
        { productId: 'prod_01', quantity: '1' },
        { productId: 'prod_02', quantity: '1000' },
      ])
    ).toEqual({});
  });

  it('test_validates_recipient_fields_and_free_text_500_char_limit', () => {
    expect(
      validateOrderRecipient({
        recipientName: 'a'.repeat(101),
        recipientPhone: '09123a5678',
        deliveryAddress: 'b'.repeat(256),
      })
    ).toEqual({
      recipientName: 'Tên người nhận không được vượt quá 100 ký tự.',
      recipientPhone: 'Số điện thoại người nhận phải gồm đúng 10 chữ số và bắt đầu bằng chữ số 0.',
      deliveryAddress: 'Địa chỉ giao không được vượt quá 255 ký tự.',
    });

    expect(
      validateFreeText('   ', {
        required: true,
        requiredMessage: 'Bắt buộc nhập.',
        fieldLabel: 'Kết quả xử lý',
      })
    ).toBe('Bắt buộc nhập.');

    expect(
      validateFreeText('x'.repeat(501), {
        required: true,
        requiredMessage: 'Bắt buộc nhập.',
        fieldLabel: 'Kết quả xử lý',
      })
    ).toBe('Kết quả xử lý không được vượt quá 500 ký tự.');
  });
});
