import { db, ensureDbReady } from '@/lib/db';
import { getUserPreferences } from '@/lib/services/users';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

function shouldDeliverInApp(userId: string, type: string): boolean {
  const prefs = getUserPreferences(userId);
  if (!prefs.push) return false;

  if (type === 'report_status' || type === 'complaint_update') {
    return prefs.reportUpdate;
  }
  if (type.startsWith('letter_')) {
    return prefs.letterReady;
  }
  if (type === 'system_news' || type === 'system') {
    return prefs.systemNews;
  }
  return true;
}

export function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}): Notification | null {
  ensureDbReady();
  if (!shouldDeliverInApp(input.userId, input.type)) {
    return null;
  }

  const id = `N${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
  const createdAt = nowIso();

  db.prepare(
    `INSERT INTO notifications (id, user_id, type, title, message, link, read, created_at)
     VALUES (@id, @userId, @type, @title, @message, @link, 0, @createdAt)`,
  ).run({
    id,
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link ?? null,
    createdAt,
  });

  return {
    id,
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link,
    read: false,
    createdAt,
  };
}

export function listNotifications(userId: string, limit = 50): Notification[] {
  ensureDbReady();
  const rows = db
    .prepare(
      `SELECT id, user_id, type, title, message, link, read, created_at
       FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    )
    .all(userId, limit) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as string,
    title: row.title as string,
    message: row.message as string,
    link: row.link as string | undefined,
    read: Boolean(row.read),
    createdAt: row.created_at as string,
  }));
}

export function countUnreadNotifications(userId: string): number {
  ensureDbReady();
  const row = db
    .prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND read = 0')
    .get(userId) as { c: number };
  return row.c;
}

export function markNotificationRead(id: string, userId: string): boolean {
  ensureDbReady();
  const result = db
    .prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?')
    .run(id, userId);
  return result.changes > 0;
}

export function markAllNotificationsRead(userId: string): void {
  ensureDbReady();
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(userId);
}

export function notifyUserByNik(
  nik: string,
  input: Omit<Parameters<typeof createNotification>[0], 'userId'>,
): void {
  ensureDbReady();
  const row = db.prepare('SELECT id FROM users WHERE nik = ?').get(nik) as { id: string } | undefined;
  if (!row) return;
  createNotification({ ...input, userId: row.id });
}
