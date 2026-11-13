import { randomBytes } from 'node:crypto';

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const MIXED = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

export type PasswordKind = 'mixed' | 'lowercase';

/**
 * Builds a random password of the exact length so that no secret is stored in the repository.
 */
export function generatePassword(length: number, kind: PasswordKind = 'mixed'): string {
  const alphabet = kind === 'lowercase' ? LOWERCASE : MIXED;
  const bytes = randomBytes(length);
  let result = '';
  for (let index = 0; index < length; index += 1) {
    result += alphabet[bytes[index] % alphabet.length];
  }
  return result;
}

let emailCounter = 0;

/**
 * Returns a token that is unique across runs and across calls within one run.
 */
export function uniqueToken(): string {
  emailCounter += 1;
  return `${Date.now()}${process.pid}${emailCounter}`;
}

/**
 * Builds the default unique email used for newly registered customers.
 */
export function buildEmail(): string {
  return `e2e+${uniqueToken()}@example.com`;
}

/**
 * Builds a valid email of the exact total length, made unique by a token at the start of the local part.
 */
export function buildEmailOfLength(totalLength: number): string {
  const token = uniqueToken();
  const domainSuffix = `@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(Math.max(totalLength - 64 - 1 - 63 - 1 - 63 - 1 - 4, 1))}.com`;
  const localLength = totalLength - domainSuffix.length;
  const padding = 'a'.repeat(Math.max(localLength - token.length, 0));
  return `${token}${padding}${domainSuffix}`;
}

/**
 * Builds a string of the same character repeated the given number of times.
 */
export function repeatChar(char: string, count: number): string {
  return char.repeat(count);
}
