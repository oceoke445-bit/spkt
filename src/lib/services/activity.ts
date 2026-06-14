import { db, ensureDbReady } from '@/lib/db';
import { getUserPreferences } from '@/lib/services/users';

export interface UserActivity {
  id: number;
  userId: string;
  action: string;
  details?: string;
  createdAt: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function logUserActivity(userId: string, action: string, details?: string): void {
  ensureDbReady();
  const prefs = getUserPreferences(userId);
  if (!prefs.activityHistory) return;

  db.prepare(
    `INSERT INTO user_activities (user_id, action, details, created_at)
     VALUES (@userId, @action, @details, @createdAt)`,
  ).run({
    userId,
    action,
    details: details ?? null,
    createdAt: nowIso(),
  });
}

export function listUserActivities(userId: string, limit = 50): UserActivity[] {
  ensureDbReady();
  const rows = db
    .prepare(
      `SELECT id, user_id, action, details, created_at
       FROM user_activities WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    )
    .all(userId, limit) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: row.id as number,
    userId: row.user_id as string,
    action: row.action as string,
    details: row.details as string | undefined,
    createdAt: row.created_at as string,
  }));
}

export function clearUserActivities(userId: string): void {
  ensureDbReady();
  db.prepare('DELETE FROM user_activities WHERE user_id = ?').run(userId);
}
