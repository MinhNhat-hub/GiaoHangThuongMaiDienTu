import { describe, expect, it } from 'vitest';
import { validateRegisterInput, type RegisterFormInput } from '@/utils/validation';

const VALID_INPUT: RegisterFormInput = {
  fullName: 'Nguyen Van An',
  email: 'an@gmail.com',
  password: 'Abcd1234',
  phoneNumber: '0912345678',
};

const LENGTH_RULE_MESSAGE = /từ 8 đến 64 ký tự/;

// Returns the password error for a registration form whose other fields are valid.
function passwordError(password: string): string | undefined {
  return validateRegisterInput({ ...VALID_INPUT, password }).password;
}

describe('Function8 PasswordLength', () => {
  it('UTCID01: 8 characters is valid', () => {
    expect(passwordError('a'.repeat(8))).toBeUndefined();
  });

  it('UTCID02: 64 characters is valid', () => {
    expect(passwordError('a'.repeat(64))).toBeUndefined();
  });

  it('UTCID03: 7 characters is invalid and names the length rule', () => {
    expect(passwordError('a'.repeat(7))).toMatch(LENGTH_RULE_MESSAGE);
  });

  it('UTCID04: 65 characters is invalid and names the length rule', () => {
    expect(passwordError('a'.repeat(65))).toMatch(LENGTH_RULE_MESSAGE);
  });

  it('UTCID05: "Ab 1#x!y" with a space and special characters is valid', () => {
    expect(passwordError('Ab 1#x!y')).toBeUndefined();
  });
});
