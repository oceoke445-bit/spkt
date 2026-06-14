import { db, ensureDbReady } from '@/lib/db';

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export function createAuditLog(input: {
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
}): void {
  ensureDbReady();
  const id = `AUD${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
  const createdAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO audit_logs (id, actor_id, actor_name, action, entity_type, entity_id, details, created_at)
     VALUES (@id, @actorId, @actorName, @action, @entityType, @entityId, @details, @createdAt)`,
  ).run({
    id,
    actorId: input.actorId,
    actorName: input.actorName,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    details: input.details ?? '',
    createdAt,
  });
}

export function listAuditLogs(limit = 50, offset = 0): { items: AuditLogEntry[]; total: number } {
  ensureDbReady();
  const total = (db.prepare('SELECT COUNT(*) as c FROM audit_logs').get() as { c: number }).c;
  const rows = db
    .prepare(
      `SELECT id, actor_id, actor_name, action, entity_type, entity_id, details, created_at
       FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(limit, offset) as Array<Record<string, unknown>>;

  return {
    total,
    items: rows.map((row) => ({
      id: row.id as string,
      actorId: row.actor_id as string,
      actorName: row.actor_name as string,
      action: row.action as string,
      entityType: row.entity_type as string,
      entityId: row.entity_id as string,
      details: row.details as string,
      createdAt: row.created_at as string,
    })),
  };
}
