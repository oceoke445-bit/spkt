import { generateSecret, generateURI, verifySync } from 'otplib';
import { db, ensureDbReady } from '@/lib/db';

const APP_NAME = 'SPKT Digital';

export function generateTotpSecret(): string {
  return generateSecret();
}

export function getTotpUri(email: string, secret: string): string {
  return generateURI({ issuer: APP_NAME, label: email, secret });
}

export function verifyTotpCode(secret: string, code: string): boolean {
  try {
    const result = verifySync({ secret, token: code.replace(/\s/g, '') });
    return result.valid;
  } catch {
    return false;
  }
}

export function getUserTotpStatus(userId: string): { enabled: boolean; hasSecret: boolean } {
  ensureDbReady();
  const row = db
    .prepare('SELECT totp_secret, totp_enabled FROM users WHERE id = ?')
    .get(userId) as { totp_secret: string | null; totp_enabled: number } | undefined;

  if (!row) return { enabled: false, hasSecret: false };
  return {
    enabled: row.totp_enabled === 1,
    hasSecret: Boolean(row.totp_secret),
  };
}

export function setupTotpSecret(userId: string, secret: string): void {
  ensureDbReady();
  db.prepare('UPDATE users SET totp_secret = ?, totp_enabled = 0 WHERE id = ?').run(secret, userId);
}

export function enableTotp(userId: string, code: string): void {
  ensureDbReady();
  const row = db
    .prepare('SELECT totp_secret FROM users WHERE id = ?')
    .get(userId) as { totp_secret: string | null } | undefined;

  if (!row?.totp_secret) {
    throw new Error('Setup 2FA belum dilakukan');
  }
  if (!verifyTotpCode(row.totp_secret, code)) {
    throw new Error('Kode verifikasi tidak valid');
  }
  db.prepare('UPDATE users SET totp_enabled = 1 WHERE id = ?').run(userId);
}

export function disableTotp(userId: string, code: string): void {
  ensureDbReady();
  const row = db
    .prepare('SELECT totp_secret, totp_enabled FROM users WHERE id = ?')
    .get(userId) as { totp_secret: string | null; totp_enabled: number } | undefined;

  if (!row?.totp_secret || row.totp_enabled !== 1) {
    throw new Error('2FA tidak aktif');
  }
  if (!verifyTotpCode(row.totp_secret, code)) {
    throw new Error('Kode verifikasi tidak valid');
  }
  db.prepare('UPDATE users SET totp_enabled = 0, totp_secret = NULL WHERE id = ?').run(userId);
}

export function isTotpEnabledForUser(userId: string): boolean {
  ensureDbReady();
  const row = db
    .prepare('SELECT totp_enabled, totp_secret FROM users WHERE id = ?')
    .get(userId) as { totp_enabled: number; totp_secret: string | null } | undefined;
  return row?.totp_enabled === 1 && Boolean(row.totp_secret);
}

export function getTotpSecretForUser(userId: string): string | null {
  ensureDbReady();
  const row = db
    .prepare('SELECT totp_secret FROM users WHERE id = ?')
    .get(userId) as { totp_secret: string | null } | undefined;
  return row?.totp_secret ?? null;
}

export function createPending2fa(userId: string): string {
  ensureDbReady();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  db.prepare(
    'INSERT INTO pending_2fa (token, user_id, expires_at) VALUES (?, ?, ?)',
  ).run(token, userId, expiresAt);
  return token;
}

export function consumePending2fa(token: string): string | null {
  ensureDbReady();
  const row = db
    .prepare('SELECT user_id, expires_at FROM pending_2fa WHERE token = ?')
    .get(token) as { user_id: string; expires_at: string } | undefined;

  db.prepare('DELETE FROM pending_2fa WHERE token = ?').run(token);

  if (!row || new Date(row.expires_at) < new Date()) {
    return null;
  }
  return row.user_id;
}
