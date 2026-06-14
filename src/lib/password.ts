import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SALT_LEN = 16;
const KEY_LEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LEN).toString('hex');
  const hash = scryptSync(password, salt, KEY_LEN).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith('scrypt:')) {
    const parts = stored.split(':');
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const hashHex = parts[2];
    const hashBuf = Buffer.from(hashHex, 'hex');
    const derived = scryptSync(password, salt, KEY_LEN);
    if (hashBuf.length !== derived.length) return false;
    return timingSafeEqual(hashBuf, derived);
  }
  return password === stored;
}

export function isPasswordHashed(stored: string): boolean {
  return stored.startsWith('scrypt:');
}
