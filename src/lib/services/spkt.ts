import { db, ensureDbReady } from '@/lib/db';
import {
  allocateReportNumber,
  allocateLetterNumber,
  allocateComplaintNumber,
} from '@/lib/reference';
import type {
  Report,
  ReportStatus,
  TimelineEvent,
  LetterRequest,
  LetterStatus,
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  Officer,
  DbUser,
} from '@/lib/types/spkt';

function nowIso(): string {
  return new Date().toISOString();
}

function rowToReport(
  row: Record<string, unknown>,
  timeline: TimelineEvent[],
  evidenceFiles: string[],
): Report {
  return {
    id: row.id as string,
    reportNumber: row.report_number as string,
    reporterName: row.reporter_name as string,
    reporterNIK: row.reporter_nik as string,
    reporterPhone: row.reporter_phone as string,
    caseType: row.case_type as string,
    incidentDate: row.incident_date as string,
    location: row.location as string,
    description: row.description as string,
    status: row.status as ReportStatus,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    assignedTo: row.assigned_to as string | undefined,
    assignedBy: row.assigned_by as string | undefined,
    assignedAt: row.assigned_at as string | undefined,
    notes: row.notes as string | undefined,
    priority: row.priority as Report['priority'],
    evidenceFiles,
    timeline,
  };
}

function loadReportExtras(reportId: string): { timeline: TimelineEvent[]; evidenceFiles: string[] } {
  const timelineRows = db
    .prepare(
      'SELECT status, timestamp, note, officer FROM report_timeline WHERE report_id = ? ORDER BY timestamp ASC',
    )
    .all(reportId) as Array<{ status: string; timestamp: string; note: string | null; officer: string | null }>;

  const evidenceRows = db
    .prepare('SELECT filename FROM report_evidence WHERE report_id = ?')
    .all(reportId) as Array<{ filename: string }>;

  return {
    timeline: timelineRows.map((t) => ({
      status: t.status,
      timestamp: t.timestamp,
      note: t.note ?? undefined,
      officer: t.officer ?? undefined,
    })),
    evidenceFiles: evidenceRows.map((e) => e.filename),
  };
}

function hydrateReport(row: Record<string, unknown>): Report {
  const extras = loadReportExtras(row.id as string);
  return rowToReport(row, extras.timeline, extras.evidenceFiles);
}

export interface ListReportsFilter {
  nik?: string;
  assignedTo?: string;
}

export function listReports(filter: ListReportsFilter = {}): Report[] {
  ensureDbReady();
  let sql = 'SELECT * FROM reports WHERE 1=1';
  const params: Record<string, string> = {};

  if (filter.nik) {
    sql += ' AND reporter_nik = @nik';
    params.nik = filter.nik;
  }
  if (filter.assignedTo) {
    sql += ' AND assigned_to = @assignedTo';
    params.assignedTo = filter.assignedTo;
  }

  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(params) as Record<string, unknown>[];
  return rows.map(hydrateReport);
}

export function getReportById(id: string): Report | null {
  ensureDbReady();
  const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return hydrateReport(row);
}

function generateReportNumber(): string {
  return allocateReportNumber();
}

export interface CreateReportInput {
  reporterUserId?: string;
  reporterName: string;
  reporterNIK: string;
  reporterPhone: string;
  caseType: string;
  incidentDate: string;
  location: string;
  description: string;
  status?: ReportStatus;
  priority?: Report['priority'];
  evidenceFiles?: string[];
}

export function createReport(input: CreateReportInput): Report {
  ensureDbReady();
  const id = `R${Date.now()}`;
  const reportNumber = generateReportNumber();
  const status = input.status ?? 'submitted';
  const ts = nowIso();

  db.prepare(
    `INSERT INTO reports (
      id, report_number, reporter_user_id, reporter_name, reporter_nik, reporter_phone,
      case_type, incident_date, location, description, status, priority, created_at, updated_at
    ) VALUES (
      @id, @reportNumber, @reporterUserId, @reporterName, @reporterNIK, @reporterPhone,
      @caseType, @incidentDate, @location, @description, @status, @priority, @createdAt, @updatedAt
    )`,
  ).run({
    id,
    reportNumber,
    reporterUserId: input.reporterUserId ?? null,
    reporterName: input.reporterName,
    reporterNIK: input.reporterNIK,
    reporterPhone: input.reporterPhone,
    caseType: input.caseType,
    incidentDate: input.incidentDate,
    location: input.location,
    description: input.description,
    status,
    priority: input.priority ?? 'medium',
    createdAt: ts,
    updatedAt: ts,
  });

  const timelineStatus = status === 'draft' ? 'Draft disimpan' : 'Laporan dikirim';
  addTimelineEvent(id, timelineStatus, ts);

  if (input.evidenceFiles) {
    const insertEvidence = db.prepare('INSERT INTO report_evidence (report_id, filename) VALUES (?, ?)');
    for (const filename of input.evidenceFiles) {
      insertEvidence.run(id, filename);
    }
  }

  return getReportById(id)!;
}

export function addTimelineEvent(
  reportId: string,
  status: string,
  timestamp?: string,
  note?: string,
  officer?: string,
): void {
  db.prepare(
    'INSERT INTO report_timeline (report_id, status, timestamp, note, officer) VALUES (?, ?, ?, ?, ?)',
  ).run(reportId, status, timestamp ?? nowIso(), note ?? null, officer ?? null);
}

export interface UpdateReportInput {
  status?: ReportStatus;
  assignedTo?: string;
  assignedBy?: string;
  notes?: string;
  timelineNote?: string;
  timelineOfficer?: string;
}

const STATUS_TIMELINE_LABEL: Partial<Record<ReportStatus, string>> = {
  verified: 'Diverifikasi',
  assigned: 'Ditugaskan',
  processing: 'Diproses',
  completed: 'Selesai',
  rejected: 'Ditolak',
};

export function updateReport(id: string, input: UpdateReportInput): Report {
  ensureDbReady();
  const existing = getReportById(id);
  if (!existing) {
    throw new Error('Laporan tidak ditemukan');
  }

  const ts = nowIso();
  const updates: string[] = ['updated_at = @updatedAt'];
  const params: Record<string, string | null> = { id, updatedAt: ts };

  if (input.status) {
    updates.push('status = @status');
    params.status = input.status;
  }
  if (input.assignedTo !== undefined) {
    updates.push('assigned_to = @assignedTo');
    params.assignedTo = input.assignedTo;
    updates.push('assigned_at = @assignedAt');
    params.assignedAt = ts;
  }
  if (input.assignedBy !== undefined) {
    updates.push('assigned_by = @assignedBy');
    params.assignedBy = input.assignedBy;
  }
  if (input.notes !== undefined) {
    updates.push('notes = @notes');
    params.notes = input.notes;
  }

  db.prepare(`UPDATE reports SET ${updates.join(', ')} WHERE id = @id`).run(params);

  if (input.status && STATUS_TIMELINE_LABEL[input.status]) {
    addTimelineEvent(
      id,
      STATUS_TIMELINE_LABEL[input.status]!,
      ts,
      input.timelineNote,
      input.timelineOfficer,
    );
  } else if (input.assignedTo && input.status === undefined) {
    addTimelineEvent(id, 'Ditugaskan', ts, input.timelineNote, input.timelineOfficer ?? input.assignedTo);
  }

  return getReportById(id)!;
}

export function listLetters(nik?: string): LetterRequest[] {
  ensureDbReady();
  let sql = 'SELECT * FROM letter_requests';
  const params: Record<string, string> = {};

  if (nik) {
    sql += ' WHERE requester_nik = @nik';
    params.nik = nik;
  }
  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(params) as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: row.id as string,
    requestNumber: row.request_number as string,
    requesterName: row.requester_name as string,
    requesterNIK: row.requester_nik as string,
    letterType: row.letter_type as string,
    purpose: row.purpose as string,
    status: row.status as LetterStatus,
    createdAt: row.created_at as string,
    pickupDate: row.pickup_date as string | undefined,
  }));
}

function generateLetterNumber(letterTypeId: string): string {
  return allocateLetterNumber(letterTypeId);
}

export interface CreateLetterInput {
  requesterUserId?: string;
  requesterName: string;
  requesterNIK: string;
  requesterPhone?: string;
  letterTypeId: string;
  letterTypeName: string;
  purpose: string;
  pickupDate?: string;
}

export function createLetter(input: CreateLetterInput): LetterRequest {
  ensureDbReady();
  const id = `L${Date.now()}`;
  const requestNumber = generateLetterNumber(input.letterTypeId);
  const ts = nowIso();

  db.prepare(
    `INSERT INTO letter_requests (
      id, request_number, requester_user_id, requester_name, requester_nik,
      letter_type, purpose, status, pickup_date, created_at
    ) VALUES (
      @id, @requestNumber, @requesterUserId, @requesterName, @requesterNIK,
      @letterType, @purpose, 'submitted', @pickupDate, @createdAt
    )`,
  ).run({
    id,
    requestNumber,
    requesterUserId: input.requesterUserId ?? null,
    requesterName: input.requesterName,
    requesterNIK: input.requesterNIK,
    letterType: input.letterTypeName,
    purpose: input.purpose,
    pickupDate: input.pickupDate ?? null,
    createdAt: ts,
  });

  return listLetters().find((l) => l.id === id)!;
}

export function listComplaints(nik?: string): Complaint[] {
  ensureDbReady();
  let sql = 'SELECT * FROM complaints';
  const params: Record<string, string> = {};

  if (nik) {
    sql += ' WHERE submitter_nik = @nik';
    params.nik = nik;
  }
  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(params) as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: row.id as string,
    complaintNumber: row.complaint_number as string,
    submitterName: row.submitter_name as string,
    submitterNik: row.submitter_nik as string | undefined,
    category: row.category as ComplaintCategory,
    subject: row.subject as string,
    description: row.description as string,
    status: row.status as ComplaintStatus,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    response: row.response as string | undefined,
    responseDate: row.response_date as string | undefined,
  }));
}

function generateComplaintNumber(): string {
  return allocateComplaintNumber();
}

export interface CreateComplaintInput {
  submitterUserId?: string;
  submitterName: string;
  submitterNik?: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
}

export function createComplaint(input: CreateComplaintInput): Complaint {
  ensureDbReady();
  const id = `C${Date.now()}`;
  const complaintNumber = generateComplaintNumber();
  const ts = nowIso();

  db.prepare(
    `INSERT INTO complaints (
      id, complaint_number, submitter_user_id, submitter_name, submitter_nik,
      category, subject, description, status, created_at, updated_at
    ) VALUES (
      @id, @complaintNumber, @submitterUserId, @submitterName, @submitterNik,
      @category, @subject, @description, 'submitted', @createdAt, @updatedAt
    )`,
  ).run({
    id,
    complaintNumber,
    submitterUserId: input.submitterUserId ?? null,
    submitterName: input.submitterName,
    submitterNik: input.submitterNik ?? null,
    category: input.category,
    subject: input.subject,
    description: input.description,
    createdAt: ts,
    updatedAt: ts,
  });

  return listComplaints().find((c) => c.id === id)!;
}

export function listOfficers(): Officer[] {
  ensureDbReady();
  const rows = db.prepare('SELECT * FROM officers ORDER BY name').all() as Array<Record<string, unknown>>;

  return rows.map((row) => {
    const name = row.name as string;
    const assignedCases = (
      db
        .prepare(
          `SELECT COUNT(*) as c FROM reports
           WHERE assigned_to = ? AND status NOT IN ('completed', 'rejected')`,
        )
        .get(name) as { c: number }
    ).c;
    const completedCases = (
      db
        .prepare(`SELECT COUNT(*) as c FROM reports WHERE assigned_to = ? AND status = 'completed'`)
        .get(name) as { c: number }
    ).c;

    return {
      id: row.id as string,
      name,
      rank: row.rank as string,
      email: row.email as string,
      phone: row.phone as string,
      status: row.status as Officer['status'],
      assignedCases,
      completedCases,
    };
  });
}

export function getOfficerById(id: string): Officer | null {
  return listOfficers().find((o) => o.id === id) ?? null;
}

export function listUsers(): Array<{ id: string; name: string; email: string; role: string }> {
  ensureDbReady();
  const rows = db
    .prepare('SELECT id, name, email, role FROM users ORDER BY name')
    .all() as Array<{ id: string; name: string; email: string; role: string }>;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role === 'petugas' ? 'Petugas' : row.role === 'admin' ? 'Admin' : 'User',
  }));
}

export function authenticateUser(email: string, password: string): DbUser | null {
  ensureDbReady();
  const row = db
    .prepare('SELECT id, email, password, name, nik, phone, role FROM users WHERE email = ?')
    .get(email) as
    | {
        id: string;
        email: string;
        password: string;
        name: string;
        nik: string | null;
        phone: string | null;
        role: DbUser['role'];
      }
    | undefined;

  if (!row || row.password !== password) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    nik: row.nik ?? undefined,
    phone: row.phone ?? undefined,
    role: row.role,
  };
}
