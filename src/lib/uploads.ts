import fs from 'fs';
import path from 'path';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const uploadDir = process.env.UPLOAD_DIR || path.join(dataDir, 'uploads');

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']);

export function ensureUploadDir(): string {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
}

export function getUploadDir(): string {
  return ensureUploadDir();
}

function sanitizeBaseName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
}

export interface StoredFile {
  storedName: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export async function storeUploadedFile(file: File, userId?: string): Promise<StoredFile> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`File ${file.name} melebihi 10MB`);
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`Tipe file tidak diizinkan: ${ext || 'unknown'}`);
  }

  const dir = ensureUploadDir();
  const userPrefix = userId ? `${userId}_` : '';
  const storedName = `${userPrefix}${Date.now()}_${crypto.randomUUID().slice(0, 8)}_${sanitizeBaseName(file.name)}`;
  const fullPath = path.join(dir, storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(fullPath, buffer);

  return {
    storedName,
    originalName: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
  };
}

export function resolveUploadPath(storedName: string): string | null {
  const safeName = path.basename(storedName);
  const fullPath = path.join(getUploadDir(), safeName);
  if (!fs.existsSync(fullPath)) return null;
  return fullPath;
}

export const UPLOAD_LIMITS = {
  maxBytes: MAX_FILE_BYTES,
  maxFiles: 5,
  allowedExtensions: [...ALLOWED_EXTENSIONS],
};
