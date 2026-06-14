import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'spkt.db');
const db = new DatabaseSync(dbPath);

const DIMENSIONS = [
  { code: 'ease', name: 'Kemudahan Prosedur', weight: 1 },
  { code: 'speed', name: 'Kecepatan Pelayanan', weight: 1 },
  { code: 'officer', name: 'Keramahan Petugas', weight: 1 },
  { code: 'clarity', name: 'Kejelasan Informasi', weight: 1 },
  { code: 'quality', name: 'Kualitas Hasil Layanan', weight: 1 },
];

const MAX_SCORE = 4;

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
    'INSERT OR IGNORE INTO survey_dimensions (code, name, weight) VALUES (@code, @name, @weight)'
  );

  for (const dimension of DIMENSIONS) {
    insertDimension.run(dimension);
  }
}

initDatabase();

export { db, MAX_SCORE };
