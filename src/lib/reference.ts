import { db, ensureDbReady } from '@/lib/db';

export function allocateReferenceNumber(prefix: string, pad = 3): string {
  ensureDbReady();
  const year = new Date().getFullYear();

  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare(
      'INSERT OR IGNORE INTO reference_counters (prefix, year, last_value) VALUES (?, ?, 0)',
    ).run(prefix, year);

    db.prepare(
      'UPDATE reference_counters SET last_value = last_value + 1 WHERE prefix = ? AND year = ?',
    ).run(prefix, year);

    const row = db
      .prepare('SELECT last_value as v FROM reference_counters WHERE prefix = ? AND year = ?')
      .get(prefix, year) as { v: number };

    db.exec('COMMIT');

    const seq = String(row.v).padStart(pad, '0');
    return `${prefix}/${seq}/V/${year}`;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function allocateReportNumber(): string {
  return allocateReferenceNumber('LP');
}

export function allocateLetterNumber(letterTypeId: string): string {
  const prefix =
    letterTypeId === 'skck' ? 'SKCK' : letterTypeId === 'kehilangan' ? 'SKH' : 'IZIN';
  return allocateReferenceNumber(prefix);
}

export function allocateComplaintNumber(): string {
  return allocateReferenceNumber('ADU');
}
