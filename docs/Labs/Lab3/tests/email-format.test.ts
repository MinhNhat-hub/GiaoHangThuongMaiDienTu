import { describe, expect, it } from 'vitest';
import { validateRegisterInput, type RegisterFormInput } from '@/utils/validation';

const VALID_INPUT: RegisterFormInput = {
  fullName: 'Nguyen Van An',
  email: 'an@gmail.com',
  password: 'Abcd1234',
  phoneNumber: '0912345678',
};

// Returns the email error for a registration form whose other fields are valid.
function emailError(email: string): string | undefined {
  return validateRegisterInput({ ...VALID_INPUT, email }).email;
}

describe('Function6 EmailFormat', () => {
  it('UTCID01: "an@gmail.com" is valid', () => {
    expect(emailError('an@gmail.com')).toBeUndefined();
  });

  it('UTCID02: "an@localhost" is valid', () => {
    expect(emailError('an@localhost')).toBeUndefined();
  });

  it('UTCID03: "angmail.com" is invalid', () => {
    expect(emailError('angmail.com')).toBeDefined();
  });

  it('UTCID04: "an@" is invalid', () => {
    expect(emailError('an@')).toBeDefined();
  });

  it('UTCID05: "an @gmail.com" is invalid', () => {
    expect(emailError('an @gmail.com')).toBeDefined();
  });
});
