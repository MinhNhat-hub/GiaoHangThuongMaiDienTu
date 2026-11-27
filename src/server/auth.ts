import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Hashes a plain password using scrypt with a random 16-byte salt
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

// Verifies a plain password against a stored salt:hash string using constant-time comparison
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) {
      return false;
    }
    const derivedKey = scryptSync(password, salt, 64);
    const storedBuffer = Buffer.from(key, 'hex');
    if (derivedKey.length !== storedBuffer.length) {
      return false;
    }
    return timingSafeEqual(derivedKey, storedBuffer);
  } catch {
    return false;
  }
}
