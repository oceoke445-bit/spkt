import { db, ensureDbReady } from '@/lib/db';
import type { TimelineEvent } from '@/lib/types/spkt';

export type TrackServiceType = 'report' | 'letter' | 'complaint';

export interface TrackResult {
  found: boolean;
  serviceType: TrackServiceType;
  referenceNumber: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  timeline: TimelineEvent[];
  summary?: string;
}

const REPORT_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Dikirim',
  verified: 'Diverifikasi',
  assigned: 'Ditugaskan',
  processing: 'Diproses',
  completed: 'Selesai',
  rejected: 'Ditolak',
};

const LETTER_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Dikirim',
  verified: 'Diverifikasi',
  ready: 'Siap Diambil',
  completed: 'Selesai',
  rejected: 'Ditolak',
};

const COMPLAINT_STATUS_LABELS: Record<string, string> = {
  submitted: 'Terkirim',
  reviewing: 'Ditinjau',
  processing: 'Diproses',
  resolved: 'Selesai',
  closed: 'Ditutup',
};

function loadReportTimeline(reportId: string): TimelineEvent[] {
  const rows = db
    .prepare(
      'SELECT status, timestamp, note, officer FROM report_timeline WHERE report_id = ? ORDER BY timestamp ASC',
    )
    .all(reportId) as Array<{ status: string; timestamp: string; note: string | null; officer: string | null }>;
  return rows.map((t) => ({
    status: t.status,
    timestamp: t.timestamp,
    note: t.note ?? undefined,
    officer: t.officer ?? undefined,
  }));
}

function loadLetterTimeline(letterId: string): TimelineEvent[] {
  const rows = db
    .prepare(
      'SELECT status, timestamp, note, officer FROM letter_timeline WHERE letter_id = ? ORDER BY timestamp ASC',
    )
    .all(letterId) as Array<{ status: string; timestamp: string; note: string | null; officer: string | null }>;
  return rows.map((t) => ({
    status: t.status,
    timestamp: t.timestamp,
    note: t.note ?? undefined,
    officer: t.officer ?? undefined,
  }));
}

export function trackService(
  serviceType: TrackServiceType,
  referenceNumber: string,
  nik: string,
): TrackResult {
  ensureDbReady();

  if (!/^\d{16}$/.test(nik)) {
    throw new Error('NIK harus 16 digit');
  }

  switch (serviceType) {
    case 'report': {
      const row = db
        .prepare('SELECT id, status, case_type, created_at FROM reports WHERE report_number = ? AND reporter_nik = ?')
        .get(referenceNumber, nik) as
        | { id: string; status: string; case_type: string; created_at: string }
        | undefined;
      if (!row) return { found: false, serviceType, referenceNumber, status: '', statusLabel: '', createdAt: '', timeline: [] };
      return {
        found: true,
        serviceType,
        referenceNumber,
        status: row.status,
        statusLabel: REPORT_STATUS_LABELS[row.status] ?? row.status,
        createdAt: row.created_at,
        summary: row.case_type,
        timeline: loadReportTimeline(row.id),
      };
    }
    case 'letter': {
      const row = db
        .prepare('SELECT id, status, letter_type, created_at FROM letter_requests WHERE request_number = ? AND requester_nik = ?')
        .get(referenceNumber, nik) as
        | { id: string; status: string; letter_type: string; created_at: string }
        | undefined;
      if (!row) return { found: false, serviceType, referenceNumber, status: '', statusLabel: '', createdAt: '', timeline: [] };
      return {
        found: true,
        serviceType,
        referenceNumber,
        status: row.status,
        statusLabel: LETTER_STATUS_LABELS[row.status] ?? row.status,
        createdAt: row.created_at,
        summary: row.letter_type,
        timeline: loadLetterTimeline(row.id),
      };
    }
    case 'complaint': {
      const row = db
        .prepare('SELECT status, subject, created_at FROM complaints WHERE complaint_number = ? AND submitter_nik = ?')
        .get(referenceNumber, nik) as
        | { status: string; subject: string; created_at: string }
        | undefined;
      if (!row) return { found: false, serviceType, referenceNumber, status: '', statusLabel: '', createdAt: '', timeline: [] };
      return {
        found: true,
        serviceType,
        referenceNumber,
        status: row.status,
        statusLabel: COMPLAINT_STATUS_LABELS[row.status] ?? row.status,
        createdAt: row.created_at,
        summary: row.subject,
        timeline: [
          { status: 'Pengaduan diterima', timestamp: row.created_at },
          ...(row.status !== 'submitted'
            ? [{ status: COMPLAINT_STATUS_LABELS[row.status] ?? row.status, timestamp: row.created_at }]
            : []),
        ],
      };
    }
    default: {
      const _exhaustive: never = serviceType;
      return _exhaustive;
    }
  }
}
