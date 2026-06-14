import fs from 'node:fs';
import path from 'node:path';

const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
const dbPath = process.env.DATABASE_PATH ?? path.join(dataDir, 'spkt.db');
const uploadDir = process.env.UPLOAD_DIR ?? path.join(dataDir, 'uploads');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(dataDir, 'backups', stamp);

fs.mkdirSync(backupDir, { recursive: true });

if (fs.existsSync(dbPath)) {
  fs.copyFileSync(dbPath, path.join(backupDir, 'spkt.db'));
  console.log(`Database disalin ke ${path.join(backupDir, 'spkt.db')}`);
} else {
  console.warn(`Database tidak ditemukan: ${dbPath}`);
}

if (fs.existsSync(uploadDir)) {
  const destUploads = path.join(backupDir, 'uploads');
  fs.cpSync(uploadDir, destUploads, { recursive: true });
  console.log(`Uploads disalin ke ${destUploads}`);
}

console.log(`Backup selesai: ${backupDir}`);
