import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { hashPassword, isPasswordHashed } from '@/lib/password';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'spkt.db');
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA busy_timeout = 5000');

const DIMENSIONS = [
  { code: 'ease', name: 'Kemudahan Prosedur', weight: 1 },
  { code: 'speed', name: 'Kecepatan Pelayanan', weight: 1 },
  { code: 'officer', name: 'Keramahan Petugas', weight: 1 },
  { code: 'clarity', name: 'Kejelasan Informasi', weight: 1 },
  { code: 'quality', name: 'Kualitas Hasil Layanan', weight: 1 },
];

export const MAX_SCORE = 4;

let initialized = false;

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS survey_dimensions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      weight REAL NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS satisfaction_surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      user_name TEXT NOT NULL,
      user_email TEXT,
      service_type TEXT NOT NULL,
      service_label TEXT,
      reference_id TEXT,
      comment TEXT,
      csi_score REAL NOT NULL,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS survey_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      survey_id INTEGER NOT NULL,
      dimension_id INTEGER NOT NULL,
      score INTEGER NOT NULL CHECK(score >= 1 AND score <= 4),
      FOREIGN KEY (survey_id) REFERENCES satisfaction_surveys(id) ON DELETE CASCADE,
      FOREIGN KEY (dimension_id) REFERENCES survey_dimensions(id),
      UNIQUE(survey_id, dimension_id)
    );

    CREATE INDEX IF NOT EXISTS idx_surveys_service ON satisfaction_surveys(service_type);
    CREATE INDEX IF NOT EXISTS idx_surveys_submitted ON satisfaction_surveys(submitted_at);
  `);

  const insertDimension = db.prepare(
    'INSERT OR IGNORE INTO survey_dimensions (code, name, weight) VALUES (@code, @name, @weight)',
  );

  for (const dimension of DIMENSIONS) {
    insertDimension.run(dimension);
  }

  initAppTables();
  seedAppData();
}

function initAppTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      nik TEXT,
      phone TEXT,
      role TEXT NOT NULL CHECK(role IN ('user', 'petugas', 'admin'))
    );

    CREATE TABLE IF NOT EXISTS officers (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      rank TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      report_number TEXT NOT NULL UNIQUE,
      reporter_user_id TEXT,
      reporter_name TEXT NOT NULL,
      reporter_nik TEXT NOT NULL,
      reporter_phone TEXT NOT NULL,
      case_type TEXT NOT NULL,
      incident_date TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'submitted',
      priority TEXT DEFAULT 'medium',
      assigned_to TEXT,
      assigned_by TEXT,
      assigned_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (reporter_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS report_timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id TEXT NOT NULL,
      status TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      note TEXT,
      officer TEXT,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS report_evidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS letter_requests (
      id TEXT PRIMARY KEY,
      request_number TEXT NOT NULL UNIQUE,
      requester_user_id TEXT,
      requester_name TEXT NOT NULL,
      requester_nik TEXT NOT NULL,
      letter_type TEXT NOT NULL,
      purpose TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'submitted',
      pickup_date TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (requester_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      complaint_number TEXT NOT NULL UNIQUE,
      submitter_user_id TEXT,
      submitter_name TEXT NOT NULL,
      submitter_nik TEXT,
      category TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'submitted',
      response TEXT,
      response_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (submitter_user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_reports_nik ON reports(reporter_nik);
    CREATE INDEX IF NOT EXISTS idx_reports_assigned ON reports(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_letters_nik ON letter_requests(requester_nik);
    CREATE INDEX IF NOT EXISTS idx_complaints_nik ON complaints(submitter_nik);

    CREATE TABLE IF NOT EXISTS letter_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      letter_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      FOREIGN KEY (letter_id) REFERENCES letter_requests(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS complaint_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS reference_counters (
      prefix TEXT NOT NULL,
      year INTEGER NOT NULL,
      last_value INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (prefix, year)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  `);

  migrateSchema();
}

function columnExists(table: string, column: string): boolean {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return cols.some((c) => c.name === column);
}

function migrateSchema() {
  if (!columnExists('users', 'active')) {
    db.exec('ALTER TABLE users ADD COLUMN active INTEGER NOT NULL DEFAULT 1');
  }
  if (!columnExists('users', 'address')) {
    db.exec('ALTER TABLE users ADD COLUMN address TEXT');
  }
  if (!columnExists('letter_requests', 'rejection_reason')) {
    db.exec('ALTER TABLE letter_requests ADD COLUMN rejection_reason TEXT');
  }

  migratePlainPasswords();
}

function migratePlainPasswords() {
  const rows = db.prepare('SELECT id, password FROM users').all() as Array<{ id: string; password: string }>;
  const update = db.prepare('UPDATE users SET password = ? WHERE id = ?');
  for (const row of rows) {
    if (!isPasswordHashed(row.password)) {
      update.run(hashPassword(row.password), row.id);
    }
  }
}

function seedAppData() {
  const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
  if (userCount > 0) return;

  const insertUser = db.prepare(
    'INSERT INTO users (id, email, password, name, nik, phone, role) VALUES (@id, @email, @password, @name, @nik, @phone, @role)',
  );

  const demoPassword = hashPassword('spkt123');

  insertUser.run({
    id: 'U001',
    email: 'user@spkt.id',
    password: demoPassword,
    name: 'Budi Santoso',
    nik: '3201012345678901',
    phone: '081234567890',
    role: 'user',
  });
  insertUser.run({
    id: 'U002',
    email: 'petugas@spkt.id',
    password: demoPassword,
    name: 'Ipda. Ahmad Wijaya',
    nik: null,
    phone: '081234567890',
    role: 'petugas',
  });
  insertUser.run({
    id: 'U003',
    email: 'admin@spkt.id',
    password: demoPassword,
    name: 'Kompol. Sarah Putri',
    nik: null,
    phone: null,
    role: 'admin',
  });

  const insertOfficer = db.prepare(
    'INSERT INTO officers (id, user_id, name, rank, email, phone, status) VALUES (@id, @userId, @name, @rank, @email, @phone, @status)',
  );

  insertOfficer.run({
    id: 'OFF001',
    userId: 'U002',
    name: 'Ipda. Ahmad Wijaya',
    rank: 'Inspektur Polisi Dua',
    email: 'petugas@spkt.id',
    phone: '081234567890',
    status: 'busy',
  });
  insertOfficer.run({
    id: 'OFF002',
    userId: null,
    name: 'Bripka. Andi Pratama',
    rank: 'Brigadir Polisi Kepala',
    email: 'andi.pratama@spkt.id',
    phone: '081234567891',
    status: 'available',
  });
  insertOfficer.run({
    id: 'OFF003',
    userId: null,
    name: 'Aipda. Rini Kusuma',
    rank: 'Ajun Inspektur Polisi Dua',
    email: 'rini.kusuma@spkt.id',
    phone: '081234567892',
    status: 'available',
  });
  insertOfficer.run({
    id: 'OFF004',
    userId: null,
    name: 'Briptu. Dedi Saputra',
    rank: 'Brigadir Polisi Satu',
    email: 'dedi.saputra@spkt.id',
    phone: '081234567893',
    status: 'offline',
  });

  const insertReport = db.prepare(
    `INSERT INTO reports (
      id, report_number, reporter_user_id, reporter_name, reporter_nik, reporter_phone,
      case_type, incident_date, location, description, status, priority,
      assigned_to, assigned_by, assigned_at, notes, created_at, updated_at
    ) VALUES (
      @id, @reportNumber, @reporterUserId, @reporterName, @reporterNIK, @reporterPhone,
      @caseType, @incidentDate, @location, @description, @status, @priority,
      @assignedTo, @assignedBy, @assignedAt, @notes, @createdAt, @updatedAt
    )`,
  );

  const insertTimeline = db.prepare(
    'INSERT INTO report_timeline (report_id, status, timestamp, note, officer) VALUES (?, ?, ?, ?, ?)',
  );
  const insertEvidence = db.prepare('INSERT INTO report_evidence (report_id, filename) VALUES (?, ?)');

  const seedReports = [
    {
      id: 'R001',
      reportNumber: 'LP/001/V/2026',
      reporterUserId: 'U001',
      reporterName: 'Budi Santoso',
      reporterNIK: '3201012345678901',
      reporterPhone: '081234567890',
      caseType: 'Kehilangan',
      incidentDate: '2026-05-18',
      location: 'Jl. Sudirman No. 123, Jakarta Pusat',
      description: 'Kehilangan dompet berisi KTP, SIM, dan uang tunai Rp 500.000',
      status: 'processing',
      priority: 'medium',
      assignedTo: 'Ipda. Ahmad Wijaya',
      assignedBy: 'Admin System',
      assignedAt: '2026-05-18T15:30:00',
      notes: null,
      createdAt: '2026-05-18T10:30:00',
      updatedAt: '2026-05-19T14:20:00',
      timeline: [
        { status: 'Laporan dikirim', timestamp: '2026-05-18T10:30:00', note: null, officer: null },
        { status: 'Diverifikasi', timestamp: '2026-05-18T15:00:00', note: null, officer: 'Kompol. Sarah Putri' },
        { status: 'Ditugaskan', timestamp: '2026-05-18T15:30:00', note: 'Assigned to officer', officer: 'Ipda. Ahmad Wijaya' },
        { status: 'Diproses', timestamp: '2026-05-19T09:00:00', note: 'Tim sedang menindaklanjuti laporan', officer: 'Ipda. Ahmad Wijaya' },
      ],
      evidence: ['foto_tkp.jpg', 'kronologi.pdf'],
    },
    {
      id: 'R002',
      reportNumber: 'LP/002/V/2026',
      reporterUserId: null,
      reporterName: 'Siti Rahayu',
      reporterNIK: '3201012345678902',
      reporterPhone: '081234567891',
      caseType: 'Pencurian',
      incidentDate: '2026-05-17',
      location: 'Jl. Thamrin No. 45, Jakarta Pusat',
      description: 'Pencurian sepeda motor Honda Beat warna merah, Nopol B 1234 XYZ',
      status: 'assigned',
      priority: 'high',
      assignedTo: 'Bripka. Andi Pratama',
      assignedBy: 'Kompol. Sarah Putri',
      assignedAt: '2026-05-18T11:00:00',
      notes: null,
      createdAt: '2026-05-17T16:00:00',
      updatedAt: '2026-05-18T11:00:00',
      timeline: [
        { status: 'Laporan dikirim', timestamp: '2026-05-17T16:00:00', note: null, officer: null },
        { status: 'Diverifikasi', timestamp: '2026-05-18T10:00:00', note: null, officer: 'Kompol. Sarah Putri' },
        { status: 'Ditugaskan', timestamp: '2026-05-18T11:00:00', note: 'High priority case', officer: 'Bripka. Andi Pratama' },
      ],
      evidence: [],
    },
    {
      id: 'R003',
      reportNumber: 'LP/003/V/2026',
      reporterUserId: null,
      reporterName: 'Ahmad Hidayat',
      reporterNIK: '3201012345678903',
      reporterPhone: '081234567892',
      caseType: 'Kecelakaan Lalu Lintas',
      incidentDate: '2026-05-20',
      location: 'Perempatan Semanggi, Jakarta Selatan',
      description: 'Kecelakaan tunggal, mobil menabrak pembatas jalan',
      status: 'completed',
      priority: 'urgent',
      assignedTo: 'Bripka. Andi Pratama',
      assignedBy: 'Admin System',
      assignedAt: '2026-05-20T08:30:00',
      notes: 'Kasus telah diselesaikan, laporan telah dibuat',
      createdAt: '2026-05-20T08:00:00',
      updatedAt: '2026-05-20T12:00:00',
      timeline: [
        { status: 'Laporan dikirim', timestamp: '2026-05-20T08:00:00', note: null, officer: null },
        { status: 'Diverifikasi', timestamp: '2026-05-20T08:20:00', note: null, officer: 'Kompol. Sarah Putri' },
        { status: 'Ditugaskan', timestamp: '2026-05-20T08:30:00', note: 'Urgent case - accident', officer: 'Bripka. Andi Pratama' },
        { status: 'Diproses', timestamp: '2026-05-20T09:00:00', note: null, officer: 'Bripka. Andi Pratama' },
        { status: 'Selesai', timestamp: '2026-05-20T12:00:00', note: 'Laporan kecelakaan telah dibuat dan diserahkan', officer: 'Bripka. Andi Pratama' },
      ],
      evidence: [],
    },
    {
      id: 'R004',
      reportNumber: 'LP/004/V/2026',
      reporterUserId: 'U001',
      reporterName: 'Dewi Lestari',
      reporterNIK: '3201012345678904',
      reporterPhone: '081234567893',
      caseType: 'Penipuan',
      incidentDate: '2026-05-19',
      location: 'Online - Platform E-Commerce',
      description: 'Penipuan jual beli online, sudah transfer tapi barang tidak dikirim',
      status: 'submitted',
      priority: 'medium',
      assignedTo: null,
      assignedBy: null,
      assignedAt: null,
      notes: null,
      createdAt: '2026-05-20T14:00:00',
      updatedAt: '2026-05-20T14:00:00',
      timeline: [{ status: 'Laporan dikirim', timestamp: '2026-05-20T14:00:00', note: null, officer: null }],
      evidence: ['bukti_transfer.jpg', 'chat_penjual.pdf'],
    },
  ];

  for (const r of seedReports) {
    const { timeline, evidence, ...reportRow } = r;
    insertReport.run(reportRow);
    for (const t of timeline) {
      insertTimeline.run(r.id, t.status, t.timestamp, t.note, t.officer);
    }
    for (const f of evidence) {
      insertEvidence.run(r.id, f);
    }
  }

  db.prepare(
    `INSERT INTO letter_requests (id, request_number, requester_user_id, requester_name, requester_nik, letter_type, purpose, status, pickup_date, created_at)
     VALUES (@id, @requestNumber, @requesterUserId, @requesterName, @requesterNIK, @letterType, @purpose, @status, @pickupDate, @createdAt)`,
  ).run({
    id: 'L001',
    requestNumber: 'SKCK/001/V/2026',
    requesterUserId: 'U001',
    requesterName: 'Budi Santoso',
    requesterNIK: '3201012345678901',
    letterType: 'SKCK',
    purpose: 'Melamar pekerjaan',
    status: 'ready',
    pickupDate: '2026-05-22T00:00:00',
    createdAt: '2026-05-15T10:00:00',
  });
  db.prepare(
    `INSERT INTO letter_requests (id, request_number, requester_user_id, requester_name, requester_nik, letter_type, purpose, status, pickup_date, created_at)
     VALUES (@id, @requestNumber, @requesterUserId, @requesterName, @requesterNIK, @letterType, @purpose, @status, @pickupDate, @createdAt)`,
  ).run({
    id: 'L002',
    requestNumber: 'SKH/002/V/2026',
    requesterUserId: 'U001',
    requesterName: 'Budi Santoso',
    requesterNIK: '3201012345678901',
    letterType: 'Surat Keterangan Kehilangan',
    purpose: 'Penggantian SIM',
    status: 'verified',
    pickupDate: null,
    createdAt: '2026-05-18T14:00:00',
  });

  db.prepare(
    `INSERT INTO complaints (id, complaint_number, submitter_user_id, submitter_name, submitter_nik, category, subject, description, status, response, response_date, created_at, updated_at)
     VALUES (@id, @complaintNumber, @submitterUserId, @submitterName, @submitterNik, @category, @subject, @description, @status, @response, @responseDate, @createdAt, @updatedAt)`,
  ).run({
    id: 'C001',
    complaintNumber: 'ADU/001/V/2026',
    submitterUserId: 'U001',
    submitterName: 'Budi Santoso',
    submitterNik: '3201012345678901',
    category: 'pelayanan',
    subject: 'Proses laporan terlalu lama',
    description: 'Sudah 2 minggu laporan saya belum diproses',
    status: 'resolved',
    response: 'Terima kasih atas masukannya. Laporan Anda telah kami proses dan selesai.',
    responseDate: '2026-05-18T14:30:00',
    createdAt: '2026-05-10T10:00:00',
    updatedAt: '2026-05-18T14:30:00',
  });
  db.prepare(
    `INSERT INTO complaints (id, complaint_number, submitter_user_id, submitter_name, submitter_nik, category, subject, description, status, response, response_date, created_at, updated_at)
     VALUES (@id, @complaintNumber, @submitterUserId, @submitterName, @submitterNik, @category, @subject, @description, @status, @response, @responseDate, @createdAt, @updatedAt)`,
  ).run({
    id: 'C002',
    complaintNumber: 'ADU/002/V/2026',
    submitterUserId: 'U001',
    submitterName: 'Budi Santoso',
    submitterNik: '3201012345678901',
    category: 'sistem',
    subject: 'Error saat upload dokumen',
    description: 'Sistem error ketika saya mencoba upload file PDF',
    status: 'processing',
    response: 'Sedang dalam penanganan tim teknis kami.',
    responseDate: null,
    createdAt: '2026-05-15T09:00:00',
    updatedAt: '2026-05-16T11:00:00',
  });
}

export function ensureDbReady() {
  if (!initialized) {
    initDatabase();
    initialized = true;
  }
}

export { db };
