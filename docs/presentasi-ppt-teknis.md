# SPKT Digital — Materi PPT Teknis (PRD · ERD · Database · Backend · Frontend)

Dokumen ini **hanya** berisi 5 topik teknis inti — penjelasan sedetail mungkin untuk slide presentasi / skripsi.

**Urutan disarankan saat presentasi:** PRD → ERD → Database → Backend → Frontend

Lihat indeks: [presentasi-ppt.md](presentasi-ppt.md)

---

# BAGIAN A — PRD (Product Requirements Document)

> PRD menjawab: **apa yang harus bisa dilakukan sistem**, oleh **siapa**, dengan **aturan bisnis** apa.

---

## A1 — Visi Produk

**Nama:** SPKT Digital (Sistem Pelayanan Kepolisian Terpadu)

**Masalah yang diselesaikan:**
- Masyarakat sulit melacak status laporan/surat tanpa datang ke kantor
- Petugas tidak punya antrian digital terpusat
- Admin tidak punya visibilitas statistik & audit

**Solusi:** Satu portal web — laporan polisi, layanan surat, pengaduan, informasi, survei kepuasan (CSI) — dengan 3 peran: **Masyarakat**, **Petugas**, **Admin**.

---

## A2 — Aktor & Peran (Actors)

| Aktor | Role di sistem | Hak akses utama |
|-------|----------------|-----------------|
| **Masyarakat** | `user` | Buat/lacak laporan sendiri, ajukan surat, pengaduan, pengaturan akun |
| **Petugas SPKT** | `petugas` | Antrian laporan masuk, proses surat & pengaduan, update status |
| **Administrator** | `admin` | Semua laporan, kelola user/petugas, statistik, CSI, artikel, audit |
| **Pengunjung anonim** | — | Lacak layanan (nomor + NIK), baca artikel publik, daftar akun |

---

## A3 — Modul Layanan (Scope Fungsional)

| # | Modul | Deskripsi singkat | Wajib ada |
|---|-------|-------------------|-----------|
| 1 | **Autentikasi** | Login, register, sesi cookie, logout, lupa password | ✓ |
| 2 | **2FA (TOTP)** | Aktif/nonaktif Google Authenticator | ✓ |
| 3 | **Laporan Polisi** | Buat, draft, upload bukti, lacak status, timeline | ✓ |
| 4 | **Layanan Surat** | Ajukan surat, lampiran, status, PDF siap ambil | ✓ |
| 5 | **Pengaduan** | Submit, timeline, tanggapan petugas | ✓ |
| 6 | **Lacak Layanan** | Tanpa login — nomor + NIK + tipe layanan | ✓ |
| 7 | **Notifikasi in-app** | Status berubah → notifikasi (hormati preferensi) | ✓ |
| 8 | **CSI / Survei** | Setelah layanan selesai, 5 dimensi kepuasan | ✓ |
| 9 | **Informasi** | Artikel edukasi (CMS admin) | ✓ |
| 10 | **Kelola User** | Admin: suspend/aktifkan, ubah role | ✓ |
| 11 | **Kelola Petugas** | Admin: CRUD petugas, link ke akun login | ✓ |
| 12 | **Audit Log** | Jejak aksi sensitif admin | ✓ |
| 13 | **Privasi & Ekspor** | Preferensi profil publik, ekspor data, hapus akun | ✓ |
| 14 | **Statistik Admin** | Agregat laporan, surat, pengaduan | ✓ |

**Di luar scope (tidak diimplementasi):** email/SMS otomatis, integrasi SIM/NIK nasional, mobile app native.

---

## A4 — User Stories per Role

### Masyarakat (`user`)

| ID | User Story | Kriteria penerimaan |
|----|------------|---------------------|
| U-01 | Sebagai masyarakat, saya ingin **mendaftar** agar bisa mengakses layanan | Form validasi email unik, password hash, role default `user` |
| U-02 | Saya ingin **membuat laporan** dengan bukti foto | Upload → `data/uploads/`, nomor `LAP-YYYY-NNNN`, status `submitted` |
| U-03 | Saya ingin **menyimpan draft** laporan | Status `draft`, bisa dilanjutkan dari My Reports |
| U-04 | Saya ingin **melihat laporan saya** dengan timeline | Filter by NIK, pagination |
| U-05 | Saya ingin **mengajukan surat** | Nomor `SUR-...`, timeline status |
| U-06 | Saya ingin **mengajukan pengaduan** | Nomor `PGD-...`, bisa lampiran |
| U-07 | Saya ingin **diberi notifikasi** saat status berubah | `notifications` jika preferensi `push` + `reportUpdate` aktif |
| U-08 | Saya ingin **mengisi survei CSI** setelah layanan selesai | Cek eligibility via `/api/survey/check` |
| U-09 | Saya ingin **lacak tanpa login** | `/api/track` + rate limit |
| U-10 | Saya ingin **hapus akun** | Anonimisasi data terkait NIK, hapus sesi |

### Petugas (`petugas`)

| ID | User Story | Kriteria penerimaan |
|----|------------|---------------------|
| P-01 | Saya ingin melihat **antrian laporan masuk** | `officerInbox`: belum ditugaskan + tugas saya |
| P-02 | Saya ingin **verifikasi** laporan | Status `submitted` → `verified` + timeline |
| P-03 | Saya ingin **ambil tugas** | Set `assigned_officer_id`, status `assigned` |
| P-04 | Saya ingin **update proses/selesai** | Transisi valid per `status-transitions.ts` |
| P-05 | Saya ingin **proses surat & pengaduan** | PATCH dengan timeline + notifikasi pelapor |

### Admin (`admin`)

| ID | User Story | Kriteria penerimaan |
|----|------------|---------------------|
| A-01 | Saya ingin melihat **semua laporan** | Tanpa filter NIK, override status |
| A-02 | Saya ingin **kelola user** (suspend/aktifkan) | `users.active` = 0/1 |
| A-03 | Saya ingin **kelola petugas** | CRUD `officers`, link `user_id` |
| A-04 | Saya ingin **dashboard statistik** | `/api/stats/admin` |
| A-05 | Saya ingin **ringkasan CSI** | `/api/survey/csi/summary` |
| A-06 | Saya ingin **kelola artikel** | CRUD `info_articles` |
| A-07 | Setiap aksi sensitif **tercatat audit** | `audit_logs` |

---

## A5 — Aturan Bisnis Status (State Machine)

### Laporan (`reports.status`)

```
draft ──► submitted ──► verified ──► assigned ──► processing ──► completed
              │              │            │
              └──────────────┴────────────┴──► rejected
```

| Status | Arti bisnis | Siapa yang boleh ubah |
|--------|-------------|----------------------|
| `draft` | Belum dikirim | Masyarakat (edit/hapus draft) |
| `submitted` | Menunggu verifikasi | Petugas verifikasi |
| `verified` | Data valid | Petugas assign |
| `assigned` | Ada petugas penanggung jawab | Petugas proses |
| `processing` | Sedang ditangani | Petugas selesaikan |
| `completed` | Selesai | — (terminal) |
| `rejected` | Ditolak | — (terminal) |

**Admin:** boleh override transisi (`adminOverride: true`).

### Surat (`letter_requests.status`)

```
draft → submitted → verified → ready → completed
                         └──► rejected
```

### Pengaduan (`complaints.status`)

```
submitted → reviewing → processing → resolved → closed
     └──────────┴──────────┴────────────► closed
```

---

## A6 — Requirement Non-Fungsional

| Kategori | Requirement |
|----------|-------------|
| **Platform** | Web browser modern, responsive (mobile header + sidebar sheet) |
| **Runtime** | Node.js ≥ 22.5 (`node:sqlite`) |
| **Keamanan** | Password bcrypt, cookie HttpOnly `spkt_session`, rate limit login/track/forgot-password |
| **Data** | SQLite file `data/spkt.db`, upload fisik `data/uploads/` |
| **Performa** | Pagination default 20 item/halaman |
| **Deploy** | Healthcheck `/api/health`, volume persisten untuk `DATA_DIR` |
| **Privasi** | Preferensi `publicProfile`, `activityHistory`; ekspor data JSON |

---

## A7 — Matriks Fitur × Role (Ringkas 1 Slide)

| Fitur | user | petugas | admin | anonim |
|-------|:----:|:-------:|:-----:|:------:|
| Login / Register | ✓ | ✓ | ✓ | register saja |
| Buat laporan | ✓ | — | — | — |
| Antrian laporan | — | ✓ | ✓ (semua) | — |
| Layanan surat | ✓ | ✓ proses | ✓ | — |
| Pengaduan | ✓ | ✓ proses | ✓ | — |
| Lacak layanan | ✓ | ✓ | ✓ | ✓ |
| Kelola user | — | — | ✓ | — |
| Kelola petugas | — | — | ✓ | — |
| Statistik / CSI | — | — | ✓ | — |
| Artikel informasi | baca | baca | baca + kelola | baca |

---

# BAGIAN B — ERD (Entity Relationship Diagram)

> ERD menjawab: **entitas data apa saja**, **kolom apa**, **relasi antar tabel**.

**Total tabel:** 21 · **File schema:** `src/lib/db.ts`

---

## B1 — Diagram Hub Pusat (`users`)

```
                         ┌─────────────────────────────────┐
                         │            users                │
                         │  PK: id (TEXT, U1739...)        │
                         │  UNIQUE: email                  │
                         │  role: user|petugas|admin       │
                         │  active, preferences_json       │
                         │  totp_secret, totp_enabled      │
                         └───────────────┬─────────────────┘
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
           ▼                            ▼                            ▼
    ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
    │  sessions   │              │notifications│              │  officers   │
    │ PK: id UUID │              │ PK: id      │              │ PK: id OFF..│
    │ FK: user_id │              │ FK: user_id │              │ FK: user_id │
    └─────────────┘              └─────────────┘              └──────┬──────┘
           │                                                         │
    ┌─────────────┐                                                   │
    │ pending_2fa │                                                   │
    │ PK: token   │         assigned_officer_id ──────────────────────┘
    │ FK: user_id │
    └─────────────┘
```

---

## B2 — ERD Tabel `users` (Detail Kolom)

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| `id` | TEXT | PK | `U` + timestamp |
| `email` | TEXT | NOT NULL, UNIQUE | Login |
| `password` | TEXT | NOT NULL | bcrypt hash |
| `name` | TEXT | NOT NULL | Nama tampilan |
| `nik` | TEXT | — | 16 digit, filter data milik user |
| `phone` | TEXT | — | Kontak |
| `role` | TEXT | CHECK user/petugas/admin | RBAC |
| `active` | INTEGER | DEFAULT 1 | 0 = suspend |
| `address` | TEXT | — | Profil |
| `avatar_url` | TEXT | — | URL avatar |
| `preferences_json` | TEXT | DEFAULT `{}` | Notifikasi & privasi |
| `totp_secret` | TEXT | — | Base32 secret 2FA |
| `totp_enabled` | INTEGER | DEFAULT 0 | 1 = wajib 2FA saat login |

**Relasi keluar (1 user → banyak):**
- `sessions`, `notifications`, `user_activities`, `pending_2fa`, `satisfaction_surveys`
- `reports` via `reporter_user_id` (opsional)
- `letter_requests` via `requester_user_id`
- `complaints` via `submitter_user_id`
- `officers` via `user_id` (1:0..1 untuk petugas)

---

## B3 — ERD Klaster Autentikasi

### `sessions`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | Token UUID = nilai cookie `spkt_session` |
| `user_id` | TEXT FK → users | Pemilik sesi |
| `expires_at` | TEXT | Default +7 hari |
| `created_at` | TEXT | Waktu dibuat |

**Index:** `idx_sessions_user`, `idx_sessions_expires`

### `pending_2fa`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `token` | TEXT PK | Token sementara setelah password benar |
| `user_id` | TEXT FK | User menunggu verifikasi TOTP |
| `expires_at` | TEXT | Expire singkat (~5 menit) |

**Relasi:** `users` 1 ──< N `sessions` · `users` 1 ──< N `pending_2fa`

---

## B4 — ERD Klaster Petugas (`officers`)

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | `OFF...` |
| `user_id` | TEXT FK → users | Link akun login petugas (nullable) |
| `name` | TEXT | Nama petugas |
| `rank` | TEXT | Pangkat |
| `email` | TEXT | Email petugas |
| `phone` | TEXT | Telepon |
| `status` | TEXT | `available` / lainnya |

**Relasi ke laporan:**
```
officers.id ◄── reports.assigned_officer_id
reports.assigned_to (TEXT legacy — nama petugas)
```

---

## B5 — ERD Klaster Laporan

### `reports`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | UUID internal |
| `report_number` | TEXT UNIQUE | `LAP-2025-0001` |
| `reporter_user_id` | TEXT FK | Opsional |
| `reporter_name` | TEXT | Nama pelapor |
| `reporter_nik` | TEXT | **Kunci filter** milik masyarakat |
| `reporter_phone` | TEXT | Kontak |
| `case_type` | TEXT | Jenis kejadian |
| `incident_date` | TEXT | Tanggal kejadian |
| `location` | TEXT | Lokasi |
| `description` | TEXT | Uraian |
| `status` | TEXT | State machine laporan |
| `priority` | TEXT | low/medium/high |
| `assigned_to` | TEXT | Nama petugas (legacy) |
| `assigned_officer_id` | TEXT | FK → officers |
| `assigned_by` | TEXT | Siapa assign |
| `assigned_at` | TEXT | Waktu assign |
| `notes` | TEXT | Catatan petugas |
| `created_at`, `updated_at` | TEXT | Timestamp |

**Index:** `idx_reports_nik`, `idx_reports_assigned`

### Anak `reports` (1 ──< N)

**`report_timeline`**

| Kolom | Tipe |
|-------|------|
| `id` | INTEGER PK AUTO |
| `report_id` | TEXT FK ON DELETE CASCADE |
| `status` | TEXT |
| `timestamp` | TEXT |
| `note` | TEXT |
| `officer` | TEXT |

**`report_evidence`**

| Kolom | Tipe |
|-------|------|
| `id` | INTEGER PK AUTO |
| `report_id` | TEXT FK CASCADE |
| `filename` | TEXT | Nama file di `data/uploads/` |

```
reports (1) ──< (N) report_timeline
reports (1) ──< (N) report_evidence
reports (N) ──> (1) officers [assigned_officer_id]
reports (N) ──> (1) users [reporter_user_id]
```

---

## B6 — ERD Klaster Surat

### `letter_requests`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | |
| `request_number` | TEXT UNIQUE | `SUR-...` atau `DRAFT-...` |
| `requester_user_id` | TEXT FK | |
| `requester_name` | TEXT | |
| `requester_nik` | TEXT | Filter + lacak |
| `requester_phone` | TEXT | |
| `letter_type` | TEXT | Jenis surat |
| `purpose` | TEXT | Keperluan |
| `status` | TEXT | State machine surat |
| `pickup_date` | TEXT | Jadwal ambil |
| `rejection_reason` | TEXT | Jika ditolak |
| `created_at`, `updated_at` | TEXT | |

**Index:** `idx_letters_nik`

### Anak surat

**`letter_timeline`** — sama struktur dengan `report_timeline` (letter_id FK)

**`letter_attachments`** — `letter_id` + `filename`

```
letter_requests (1) ──< (N) letter_timeline
letter_requests (1) ──< (N) letter_attachments
letter_requests (N) ──> (1) users
```

---

## B7 — ERD Klaster Pengaduan

### `complaints`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | |
| `complaint_number` | TEXT UNIQUE | `PGD-...` |
| `submitter_user_id` | TEXT FK | |
| `submitter_name` | TEXT | |
| `submitter_nik` | TEXT | Bisa nullable |
| `category` | TEXT | Kategori pengaduan |
| `subject` | TEXT | Judul |
| `description` | TEXT | Isi |
| `status` | TEXT | State machine |
| `response` | TEXT | Tanggapan petugas |
| `response_date` | TEXT | |
| `created_at`, `updated_at` | TEXT | |

**Index:** `idx_complaints_nik`

### Anak pengaduan

**`complaint_timeline`** — complaint_id, status, timestamp, note, officer

**`complaint_files`** — complaint_id, filename

```
complaints (1) ──< (N) complaint_timeline
complaints (1) ──< (N) complaint_files
complaints (N) ──> (1) users
```

---

## B8 — ERD Klaster CSI (Survei Kepuasan)

### `survey_dimensions` (master)

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INTEGER PK | |
| `code` | TEXT UNIQUE | ease, speed, officer, ... |
| `name` | TEXT | Label dimensi |
| `weight` | REAL | Bobot perhitungan CSI |

### `satisfaction_surveys`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INTEGER PK | |
| `user_id` | TEXT | FK logis ke users |
| `user_name`, `user_email` | TEXT | Snapshot |
| `service_type` | TEXT | report / letter / complaint |
| `service_label` | TEXT | Label tampilan |
| `reference_id` | TEXT | Nomor layanan |
| `comment` | TEXT | Komentar bebas |
| `csi_score` | REAL | Skor agregat |
| `submitted_at` | TEXT | |

### `survey_responses`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INTEGER PK | |
| `survey_id` | INTEGER FK CASCADE | |
| `dimension_id` | INTEGER FK | |
| `score` | INTEGER | 1–4 |
| UNIQUE | (survey_id, dimension_id) | Satu skor per dimensi |

```
survey_dimensions (1) ──< (N) survey_responses
satisfaction_surveys (1) ──< (N) survey_responses
users (1) ──< (N) satisfaction_surveys
```

---

## B9 — ERD Tabel Pendukung

### `reference_counters`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `prefix` | TEXT | LAP, SUR, PGD |
| `year` | INTEGER | Tahun |
| `last_value` | INTEGER | Counter terakhir |
| **PK** | (prefix, year) | Composite |

### `notifications`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | |
| `user_id` | TEXT FK CASCADE | |
| `type` | TEXT | report_status, letter_status, ... |
| `title`, `message` | TEXT | |
| `link` | TEXT | Deep link opsional |
| `read` | INTEGER | 0/1 |
| `created_at` | TEXT | |

### `audit_logs`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | |
| `actor_id`, `actor_name` | TEXT | Admin yang bertindak |
| `action` | TEXT | override_status, delete_account, ... |
| `entity_type` | TEXT | report, user, ... |
| `entity_id` | TEXT | ID entitas |
| `details` | TEXT | JSON/string detail |
| `created_at` | TEXT | |

### `info_articles`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | |
| `title`, `category` | TEXT | |
| `description`, `content` | TEXT | |
| `published_at` | TEXT | |

### `user_activities`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INTEGER PK | |
| `user_id` | TEXT FK CASCADE | |
| `action` | TEXT | login, create_report, ... |
| `details` | TEXT | Konteks |
| `created_at` | TEXT | |

---

## B10 — ERD Lengkap (1 Slide Ringkasan)

```
users ──┬── sessions, pending_2fa, notifications, user_activities
        ├── officers ──► reports.assigned_officer_id
        ├── reports ── report_timeline, report_evidence
        ├── letter_requests ── letter_timeline, letter_attachments
        ├── complaints ── complaint_timeline, complaint_files
        └── satisfaction_surveys ── survey_responses ── survey_dimensions

Standalone: reference_counters, audit_logs, info_articles
File fisik: data/uploads/ (tidak di ERD — disimpan di disk)
```

**Cardinality penting:**
- 1 Report → N Timeline, N Evidence
- 1 User → N Reports (via NIK / user_id)
- 1 Officer → N Reports (assigned)
- 1 Survey → tepat 5 Responses (5 dimensi)

---

# BAGIAN C — DATABASE (Flow & Operasi)

> Database menjawab: **kapan tabel di-read/write**, **urutan operasi SQL**, **file fisik**.

**Engine:** SQLite via `node:sqlite` · **File:** `data/spkt.db` · **Mode:** WAL

---

## C1 — Inisialisasi & Lifecycle DB

```
Runtime pertama (bukan saat npm run build)
    │
    ▼
ensureDbReady()                    [db.ts]
    │
    ├── getConnection() → buka/buat data/spkt.db
    ├── initDatabase()
    │     ├── CREATE TABLE (21 tabel)
    │     ├── seed survey_dimensions (5 dimensi)
    │     └── initAppTables()
    │           ├── migrateSchema() — ALTER kolom baru
    │           ├── seedAppData() — user demo jika kosong
    │           ├── linkOfficersToUsers()
    │           └── backfill timeline kosong
    └── initialized = true
```

**Build production:** DB di-stub (tidak init) — hindari file lock paralel Next.js.

**Env:**
- `DATA_DIR` → default `./data`
- `DATABASE_PATH` → `DATA_DIR/spkt.db`
- `UPLOAD_DIR` → `DATA_DIR/uploads`

---

## C2 — Flow DB: Registrasi & Login

### Register (`POST /api/auth/register`)

| Step | SQL | Tabel |
|------|-----|-------|
| 1 | Cek email EXISTS | `users` SELECT |
| 2 | bcrypt.hash(password) | — |
| 3 | INSERT user baru | `users` (role=user, active=1) |

### Login (`POST /api/auth/login`)

| Step | SQL | Tabel |
|------|-----|-------|
| 1 | SELECT by email | `users` |
| 2 | bcrypt.compare + active=1 | `users` |
| 3a | Jika totp_enabled: INSERT token | `pending_2fa` |
| 3b | Jika tidak: INSERT session UUID | `sessions` |
| 4 | (Opsional) INSERT aktivitas | `user_activities` |

### Cek sesi (`GET /api/auth/session`)

```sql
SELECT u.* FROM sessions s
JOIN users u ON u.id = s.user_id
WHERE s.id = :cookie_token AND s.expires_at > datetime('now')
```

### Logout

```sql
DELETE FROM sessions WHERE id = :token
```

---

## C3 — Flow DB: Generate Nomor Referensi

**Fungsi:** `allocateReferenceNumber(prefix)` di `spkt.ts`

```sql
-- Baca counter tahun berjalan
SELECT last_value FROM reference_counters
WHERE prefix = 'LAP' AND year = 2025

-- Jika tidak ada: INSERT (LAP, 2025, 1)
-- Jika ada: UPDATE last_value = last_value + 1

-- Hasil: LAP-2025-0001, SUR-2025-0002, PGD-2025-0001
```

**Tabel:** `reference_counters` — thread-safe dalam satu proses Node.

---

## C4 — Flow DB: Buat Laporan (Lengkap)

### Upload bukti dulu (`POST /api/upload`)

```
1. Validasi MIME & ukuran file
2. Generate storedName (hash/random)
3. fs.writeFile → data/uploads/{storedName}
4. Return { storedName } ke client
   (belum ada baris DB — metadata baru saat create report)
```

### Create report (`POST /api/reports`)

| Step | Operasi | Tabel |
|------|---------|-------|
| 1 | allocateReportNumber() | `reference_counters` |
| 2 | INSERT laporan | `reports` |
| 3 | INSERT event awal | `report_timeline` |
| 4 | Per file: INSERT filename | `report_evidence` |
| 5 | logUserActivity | `user_activities` |

**Draft:** status=`draft`, nomor bisa `DRAFT-...` — tidak masuk antrian petugas.

**Submitted:** status=`submitted` — muncul di `officerInbox`.

---

## C5 — Flow DB: Query Antrian Petugas (`officerInbox`)

**Dipanggil otomatis** saat petugas `GET /api/reports` tanpa filter.

```sql
SELECT * FROM reports
WHERE status != 'draft'
AND (
  (assigned_officer_id IS NULL AND (assigned_to IS NULL OR assigned_to = ''))
  OR assigned_officer_id = :myOfficerId
  OR assigned_to = :myOfficerName
)
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset
```

**Arti:**
- Baris 1: laporan **belum ditugaskan** (masuk antrian umum)
- Baris 2–3: laporan **sudah ditugaskan ke petugas ini**

---

## C6 — Flow DB: Update Laporan (Petugas/Admin)

**`PATCH /api/reports/:id` → `updateReport()`**

| Aksi | UPDATE reports | INSERT report_timeline | INSERT notifications |
|------|----------------|------------------------|----------------------|
| Verifikasi | status=verified | "Laporan diverifikasi" | notify pelapor |
| Assign | assigned_officer_id, status=assigned | "Ditugaskan ke ..." | — |
| Proses | status=processing | "Sedang diproses" | ✓ |
| Selesai | status=completed | "Laporan selesai" | ✓ |
| Tolak | status=rejected | alasan | ✓ |

**Notifikasi (`notifyUserByNik`):**
```sql
SELECT id FROM users WHERE nik = :reporter_nik
-- Cek preferences_json.push & reportUpdate
INSERT INTO notifications (user_id, type, title, message, ...)
```

**Admin override:** `canTransitionReport(..., { adminOverride: true })` + `INSERT audit_logs`

---

## C7 — Flow DB: Layanan Surat

### Buat surat

| Step | Tabel |
|------|-------|
| allocate SUR number | `reference_counters` |
| INSERT request | `letter_requests` |
| INSERT timeline awal | `letter_timeline` |
| Lampiran | `letter_attachments` |

### Update status petugas

| Step | Tabel |
|------|-------|
| UPDATE status, pickup_date, rejection_reason | `letter_requests` |
| INSERT timeline | `letter_timeline` |
| Notifikasi | `notifications` (type letter_status, cek letterReady) |

### PDF (`GET /api/letters/:id/pdf`)

- SELECT `letter_requests` + JOIN timeline
- Generate PDF runtime (pdf-lib) — **tidak** disimpan di DB

---

## C8 — Flow DB: Pengaduan

| Step | Tabel |
|------|-------|
| INSERT pengaduan | `complaints` |
| Timeline awal | `complaint_timeline` |
| File lampiran | `complaint_files` + `data/uploads/` |
| PATCH tanggapan | UPDATE `complaints` (response, status) |
| | INSERT `complaint_timeline` |
| | `notifications` ke submitter |

---

## C9 — Flow DB: CSI / Survei

**Cek eligibility (`GET /api/survey/check`):**
```sql
-- Layanan harus status terminal (completed/resolved)
-- Belum ada survey untuk reference_id + service_type + user
SELECT ... FROM satisfaction_surveys WHERE reference_id = ? AND user_id = ?
```

**Submit (`POST /api/survey/submit`):**
| Step | Tabel |
|------|-------|
| Hitung csi_score dari 5 skor | — |
| INSERT header survei | `satisfaction_surveys` |
| INSERT 5 baris skor | `survey_responses` (per dimension_id) |

**Admin summary:** agregat AVG, COUNT GROUP BY service_type, dimension

---

## C10 — Flow DB: Notifikasi, Audit, Hapus Akun

### Notifikasi

```sql
SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC
UPDATE notifications SET read = 1 WHERE id = ?
```

### Audit (admin)

```sql
INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details, ...)
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?
```

### Hapus akun

```
1. UPDATE reports/letters/complaints SET nama anonim, nik=NULL (by nik)
2. DELETE user_activities, satisfaction_surveys, notifications, sessions
3. DELETE users WHERE id = ?
4. INSERT audit_logs (delete_account)
```

### Backup

`npm run backup:db` → salin `spkt.db` + folder `uploads/` ke `data/backups/`

---

## C11 — Diagram Alur Data (1 Slide)

```
[Client] ──HTTP──► [API Route] ──► [Service spkt.ts]
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
              reference_counters    reports (+child)    data/uploads/
              users/sessions        letter_requests
              notifications         complaints
              audit_logs            satisfaction_surveys
```

**Prinsip:** Metadata di SQLite, binary file di disk — tidak BLOB di DB.

---

# BAGIAN D — BACKEND (BE)

> Backend menjawab: **endpoint apa**, **siapa boleh akses**, **service apa** yang dipanggil.

**Pola standar setiap request:**
```
route.ts → handleApi() → requireAuth/requireRole → service/*.ts → ensureDbReady() → jsonOk()
```

**File inti:** `src/app/api/**/route.ts`, `src/lib/services/`, `src/lib/auth-server.ts`

---

## D1 — Peta Folder Backend

```
src/app/api/
├── auth/
│   ├── login/route.ts          POST — bcrypt, 2FA, cookie
│   ├── logout/route.ts         POST — hapus session
│   ├── session/route.ts        GET — user dari cookie
│   ├── register/route.ts       POST — daftar
│   ├── forgot-password/route.ts POST — reset (rate limit)
│   └── verify-2fa/route.ts     POST — selesaikan login 2FA
├── reports/
│   ├── route.ts                GET (list+pagination), POST (create)
│   └── [id]/route.ts           GET, PATCH
├── letters/
│   ├── route.ts                GET, POST
│   ├── [id]/route.ts           GET, PATCH
│   └── [id]/pdf/route.ts       GET — generate PDF
├── complaints/
│   ├── route.ts                GET, POST
│   └── [id]/route.ts           GET, PATCH
├── users/
│   ├── route.ts                GET list (admin)
│   ├── [id]/route.ts           PATCH (admin)
│   └── me/
│       ├── route.ts            GET/PATCH profil
│       ├── password/route.ts   PATCH ganti password
│       ├── preferences/route.ts PATCH notifikasi/privasi
│       ├── export/route.ts     GET ekspor data
│       └── totp/route.ts       GET/POST/DELETE 2FA
├── officers/
│   ├── route.ts                GET, POST
│   └── [id]/route.ts           GET, PATCH, DELETE
├── notifications/
│   ├── route.ts                GET, PATCH all read
│   └── [id]/route.ts           PATCH read satu
├── track/route.ts              GET publik (rate limit)
├── upload/route.ts             POST multipart
├── files/[name]/route.ts       GET file upload
├── audit-logs/route.ts         GET (admin)
├── stats/admin/route.ts        GET statistik
├── info/articles/
│   ├── route.ts                GET, POST
│   └── [id]/route.ts           GET, PATCH, DELETE
├── survey/
│   ├── check/route.ts          GET eligibility
│   ├── dimensions/route.ts     GET master dimensi
│   ├── submit/route.ts         POST survei
│   ├── recent/route.ts         GET survei terbaru
│   └── csi/summary/route.ts    GET agregat admin
└── health/route.ts             GET healthcheck deploy

src/lib/services/
├── spkt.ts          — laporan, surat, pengaduan (inti bisnis)
├── users.ts         — profil, preferences, officers helper
├── notifications.ts — create + preferensi
├── audit.ts         — audit log
├── account.ts       — hapus akun
├── track.ts         — lacak publik
├── info.ts          — artikel CMS
└── csi.ts           — survei (jika terpisah)

src/lib/
├── auth-server.ts   — session, cookie, requireAuth, requireRole
├── api-response.ts  — handleApi, jsonOk, ApiError
├── pagination.ts    — parsePagination, buildPaginatedResult
├── status-transitions.ts — validasi state machine
└── db.ts            — schema, seed, migrate
```

**Total:** ~49 route handlers

---

## D2 — Middleware Auth & Otorisasi

### `requireAuth(request)`

```
1. Baca cookie header → spkt_session
2. getUserBySessionToken(token)
3. Jika null → throw ApiError(401)
4. Return SessionUser { id, email, name, role, nik, phone }
```

### `requireRole(user, ['admin'])`

```
Jika user.role tidak di daftar → ApiError(403)
```

### Endpoint publik (tanpa cookie)

| Endpoint | Catatan |
|----------|---------|
| `POST /api/auth/login` | Rate limit IP |
| `POST /api/auth/register` | |
| `POST /api/auth/forgot-password` | Rate limit |
| `GET /api/track` | Rate limit |
| `GET /api/health` | |
| `GET /api/info/articles` | Baca artikel |

### Cookie session

| Properti | Nilai |
|----------|-------|
| Nama | `spkt_session` |
| HttpOnly | true |
| Max-Age | 7 hari |
| SameSite | lax |

---

## D3 — Service Layer: `spkt.ts` (Fungsi Utama)

| Fungsi | Tugas |
|--------|-------|
| `listReports(filter, pagination)` | Query + hydrate timeline/evidence; filter `officerInbox` |
| `getReportById(id)` | Satu laporan lengkap |
| `createReport(payload)` | Nomor + INSERT + timeline + evidence |
| `updateReport(id, payload, actor)` | Validasi transisi + timeline + notif + audit |
| `listLetters` / `createLetter` / `updateLetter` | Surat |
| `listComplaints` / `createComplaint` / `updateComplaint` | Pengaduan |
| `getOfficerByUserId(userId)` | Link petugas ↔ akun |
| `allocateReportNumber()` | Counter LAP |
| `hydrateReport(row)` | JOIN timeline + evidence ke objek JSON |

**Side effect otomatis setelah mutasi:**
1. INSERT timeline (report/letter/complaint)
2. `notifyUserByNik()` jika status berubah
3. `createAuditLog()` jika admin override
4. `logUserActivity()` untuk aksi user

---

## D4 — Contoh Flow BE: GET Laporan (per Role)

### Masyarakat

```
GET /api/reports?page=1&limit=20
→ requireAuth → role=user
→ wajib punya NIK
→ listReports({ nik: sessionUser.nik })
→ jsonOk({ reports, pagination })
```

### Petugas (antrian default)

```
GET /api/reports
→ requireAuth → role=petugas
→ getOfficerByUserId(sessionUser.id)
→ listReports({ officerInbox: { officerId, officerName } })
→ jsonOk — belum ditugaskan + tugas saya
```

### Admin

```
GET /api/reports?nik=...&assignedOfficerId=...
→ listReports(filter opsional)
→ semua laporan
```

---

## D5 — Contoh Flow BE: PATCH Laporan

```
PATCH /api/reports/:id
Body: { status, assignedOfficerId, notes, timelineNote, adminOverride }

1. requireAuth — petugas atau admin
2. getReportById — laporan existing
3. canTransitionReport(oldStatus, newStatus, { adminOverride })
4. UPDATE reports SET ...
5. INSERT report_timeline
6. notifyUserByNik(reporter_nik, { type: 'report_status', ... })
7. Jika adminOverride → createAuditLog
8. Return hydrateReport
```

**Validasi bisnis:** `src/lib/status-transitions.ts`

---

## D6 — Contoh Flow BE: Upload & Serve File

### Upload

```
POST /api/upload (multipart/form-data)
→ requireAuth
→ validasi tipe file (image/pdf)
→ simpan ke UPLOAD_DIR/{randomName}
→ return { files: [{ storedName, originalName }] }
```

### Download

```
GET /api/files/:name
→ requireAuth (atau sesuai kebijakan)
→ baca file dari UPLOAD_DIR
→ stream response dengan Content-Type
```

Metadata nama file disimpan di `report_evidence` / `letter_attachments` / `complaint_files`.

---

## D7 — Response Format & Error Handling

### Sukses

```json
{
  "ok": true,
  "data": { "report": { ... } }
}
```

### Error (`handleApi` menangkap)

```json
{
  "ok": false,
  "error": "Pesan error"
}
```

| Kode | Arti |
|------|------|
| 400 | Validasi gagal |
| 401 | Belum login |
| 403 | Role tidak cukup |
| 404 | Tidak ditemukan |
| 429 | Rate limit |
| 500 | Error server |

### Pagination

```json
{
  "reports": [...],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

## D8 — Rate Limiting & Keamanan BE

| Endpoint | Proteksi |
|----------|----------|
| Login | Max attempt per IP/window |
| Track | Max request per IP |
| Forgot password | Max per IP |
| Semua mutasi | requireAuth |
| Admin only | requireRole(['admin']) |

**Password:** bcrypt cost default  
**2FA:** TOTP (otplib) — `pending_2fa` bridge  
**SQL:** prepared statements (tidak string concat user input)

---

# BAGIAN E — FRONTEND (FE)

> Frontend menjawab: **komponen apa**, **alur UI**, **bagaimana memanggil API**.

**Stack:** React 19 · Next.js 15 App Router · Tailwind · Radix UI · Client Components (`'use client'`)

**File inti:** `src/components/`, `src/contexts/`, `src/hooks/`, `src/lib/spktApi.ts`

---

## E1 — Struktur Aplikasi FE

```
src/app/
├── layout.tsx          — root layout, font, AuthProvider
└── page.tsx            — entry → Suspense → DashboardApp

src/contexts/
└── AuthContext.tsx     — state user global, login/logout/register

src/components/
├── DashboardApp.tsx    — router internal ?view= × role
├── LoginPage.tsx       — login, register, forgot, track
├── Sidebar.tsx         — navigasi per role
├── MobileHeader.tsx    — header mobile + menu sheet
├── NotificationBell.tsx— polling notifikasi
├── UserDashboard.tsx   — dashboard masyarakat
├── CreateReport.tsx    — form buat laporan
├── MyReports.tsx       — daftar laporan + draft
├── OfficerDashboard.tsx— antrian petugas
├── AdminControl.tsx    — semua laporan admin
├── AdminUserManagement.tsx
├── AdminOfficerManagement.tsx
├── LetterService.tsx   — layanan surat
├── Complaints.tsx      — pengaduan
├── Settings.tsx        — profil, 2FA, privasi, hapus akun
├── Information.tsx     — baca artikel
├── AdminCSI.tsx        — dashboard survei
└── ui/                 — komponen Radix (button, dialog, ...)

src/hooks/
├── useReports.ts       — fetch + pagination laporan
├── useLetters.ts       — fetch surat
├── useComplaints.ts    — fetch pengaduan
├── useOfficers.ts      — daftar petugas
└── useCsiEligibility.ts— cek boleh survei

src/lib/spktApi.ts      — SEMUA fetch ke /api/*
```

---

## E2 — Bootstrap: Dari Buka Browser ke UI

```
[1] Browser GET http://localhost:3000/
[2] layout.tsx render <AuthProvider>{children}</AuthProvider>
[3] page.tsx render <Suspense><DashboardApp /></Suspense>
[4] AuthContext mount:
      loading = true
      spktApi.getSession() → GET /api/auth/session
[5a] Jika cookie valid → setUser → loading false
[5b] Jika tidak → user null → loading false
[6] DashboardApp:
      loading → tampil "Memuat sesi..."
      !user → <LoginPage />
      user  → render sidebar + view
[7] useSearchParams() baca ?view=dashboard|create-report|...
[8] ROLE_VIEWS guard — view ilegal → redirect dashboard
```

---

## E3 — Routing Internal (`?view=`)

**Bukan file-based route terpisah** — satu halaman `/` dengan query param `view`.

### `ROLE_VIEWS` (guard akses)

| Role | View yang diizinkan |
|------|---------------------|
| `user` | dashboard, create-report, my-reports, letter-service, complaints, information, settings |
| `petugas` | dashboard, incoming-reports, letter-service, complaints, information, settings |
| `admin` | dashboard, all-reports, letter-service, complaints, user-management, officer-management, statistics, csi-dashboard, information, article-management, settings |

### Mapping view → komponen

| `?view=` | Role | Komponen |
|----------|------|----------|
| `dashboard` | user | UserDashboard |
| `create-report` | user | CreateReport |
| `my-reports` | user | MyReports |
| `incoming-reports` | petugas | OfficerDashboard |
| `all-reports` | admin | AdminControl |
| `user-management` | admin | AdminUserManagement |
| `officer-management` | admin | AdminOfficerManagement |
| `statistics` | admin | AdminStatistics |
| `csi-dashboard` | admin | AdminCSI |
| `article-management` | admin | AdminArticleManagement |
| `letter-service` | semua | LetterService |
| `complaints` | semua | Complaints |
| `information` | semua | Information |
| `settings` | semua | Settings |

**Navigasi:** `navigate('create-report')` → `router.replace('/?view=create-report')`

---

## E4 — AuthContext & State Login

### State

```ts
user: User | null
loading: boolean
isAuthenticated: boolean  // !!user
```

### Flow login (`LoginPage` → `AuthContext.login`)

```
1. User isi email + password
2. spktApi.login(email, password) → POST /api/auth/login
3a. { user } → setUser(user) → DashboardApp
3b. { requires2fa, tempToken } → tampil form TOTP
     → spktApi.verify2fa → cookie set → setUser
3c. error → toast.error
```

### Register / Logout

- Register: `spktApi.register` → auto login atau redirect login
- Logout: `spktApi.logout` → clear cookie → setUser(null)

### Timeout sesi

AuthContext punya fallback timeout 8 detik jika `getSession` hang.

---

## E5 — Client API Layer (`spktApi.ts`)

**Semua komunikasi FE→BE lewat satu modul.**

### Helper internal

```ts
async function request<T>(path, options): Promise<T>
// fetch('/api' + path, { credentials: 'include', ... })
// parse JSON, throw Error jika !ok
```

### Grup method (ringkas)

| Grup | Method | Endpoint |
|------|--------|----------|
| Auth | getSession, login, logout, register, forgotPassword | `/auth/*` |
| Profil | getProfile, updateProfile, changePassword, exportMyData, deleteAccount | `/users/me/*` |
| 2FA | getTotpStatus, setupTotp, enableTotp, disableTotp | `/users/me/totp` |
| Laporan | getReports, getReport, createReport, updateReport | `/reports` |
| Surat | getLetters, createLetter, updateLetter, getLetter | `/letters` |
| Pengaduan | getComplaints, createComplaint, updateComplaint | `/complaints` |
| Petugas | getOfficers, createOfficer, updateOfficer, deleteOfficer | `/officers` |
| Admin | getUsers, updateUser, getAdminStats, getAuditLogs | `/users`, `/stats/admin` |
| Notifikasi | getNotifications, markNotificationRead | `/notifications` |
| Upload | uploadFiles(files) | `/upload` |
| Lacak | trackService(type, number, nik) | `/track` |
| CSI | (via komponen survei) | `/survey/*` |
| Artikel | getArticles, ... | `/info/articles` |

**Cookie:** `credentials: 'include'` — browser kirim `spkt_session` otomatis.

---

## E6 — Pola Data Fetching (Hooks)

### `useReports` — contoh

```ts
const { reports, loading, error, refresh, page, setPage, totalPages } = useReports();

// Di dalam hook:
useEffect → spktApi.getReports({ page, limit, nik?, ... })
→ setReports(data)
→ setTotalPages(pagination.totalPages)
```

| Hook | Data | API |
|------|------|-----|
| `useReports` | Laporan | getReports |
| `useLetters` | Surat | getLetters |
| `useComplaints` | Pengaduan | getComplaints |
| `useOfficers` | Petugas | getOfficers |
| `useCsiEligibility` | Boleh survei? | survey/check |

**Pagination UI:** komponen `SpktPagination` — tombol prev/next + nomor halaman.

---

## E7 — Flow FE: Buat Laporan (`CreateReport.tsx`)

```
[Mount]
  Jika draftId dari props → spktApi.getReport(draftId) → isi form

[User action]
  1. Isi form: jenis, tanggal, lokasi, deskripsi
  2. FileUploadZone → simpan File[] di state lokal
  3. Klik "Simpan Draft" atau "Kirim Laporan"

[Submit Kirim]
  if (files.length > 0)
    uploaded = await spktApi.uploadFiles(files)
  await spktApi.createReport({
    ...form,
    status: 'submitted',
    evidenceFiles: uploaded.map(f => f.storedName)
  })
  toast.success('Laporan berhasil dikirim')
  onNavigate('my-reports')

[Submit Draft]
  createReport({ ...form, status: 'draft' })
```

**MyReports:** tombol "Lanjutkan" → `onContinueDraft(id)` → navigate create-report dengan draftId.

---

## E8 — Flow FE: Dashboard Petugas (`OfficerDashboard.tsx`)

```
useReports()        → GET /api/reports (officerInbox di BE)
useOfficers()       → cari myOfficer where userId === user.id

Client-side split:
  unassigned = reports tanpa assigned_officer_id & assigned_to
  myTasks    = reports assigned ke myOfficer.id

Tombol aksi per kartu:
  Verifikasi     → spktApi.updateReport(id, { status: 'verified' })
  Ambil Tugas    → updateReport({ status: 'assigned', assignedOfficerId })
  Mulai Proses   → status: 'processing'
  Selesai        → status: 'completed'
  refresh() setelah setiap aksi
```

---

## E9 — Flow FE: Admin (`AdminControl.tsx`)

```
useReports({ paginate: true })  → semua laporan

Fitur:
  - Filter/search di client
  - Override status (adminOverride: true)
  - Reassign petugas
  - Lihat timeline + bukti
  - Setiap override → audit di BE otomatis

AdminUserManagement:
  spktApi.getUsers() → tabel user
  Toggle active → spktApi.updateUser(id, { active: true/false })

AdminOfficerManagement:
  CRUD petugas + link userId ke akun login
```

---

## E10 — Flow FE: Notifikasi, Settings, Lacak

### NotificationBell

```
useEffect interval ~30s:
  spktApi.getNotifications()
  Tampilkan badge unread count
  Klik → markNotificationRead / markAllNotificationsRead
```

### Settings.tsx

| Tab | API |
|-----|-----|
| Profil | updateProfile, upload avatar |
| Password | changePassword |
| 2FA | setupTotp, enableTotp, disableTotp |
| Notifikasi | updatePreferences (push, reportUpdate, ...) |
| Privasi | publicProfile, activityHistory |
| Ekspor | exportMyData → download JSON |
| Hapus akun | deleteAccount(password) |

### Lacak (LoginPage — mode track)

```
TrackService form:
  type: report | letter | complaint
  number + nik
→ spktApi.trackService(type, number, nik)
→ render timeline (tanpa login, tanpa sidebar)
```

---

## E11 — UI/UX & Komponen Bersama

| Aspek | Implementasi |
|-------|--------------|
| Styling | Tailwind CSS + `theme.css` |
| Komponen UI | Radix (Dialog, Sheet, Select, Toast/Sonner) |
| Layout desktop | Sidebar fixed kiri |
| Layout mobile | MobileHeader + Sheet menu |
| Feedback | `toast.success` / `toast.error` (sonner) |
| Loading | Skeleton / teks "Memuat..." |
| Error | Pesan dari `spktApi` throw Error |

---

## E12 — Diagram Integrasi FE ↔ BE ↔ DB (Penutup)

**Contoh: Petugas verifikasi laporan**

```
OfficerDashboard          spktApi              API Route           spkt.ts              SQLite
      │                      │                     │                   │                   │
      │─klik Verifikasi──────►│                     │                   │                   │
      │                      │─PATCH /reports/id──►│                   │                   │
      │                      │                     │─updateReport()───►│                   │
      │                      │                     │                   │─UPDATE reports───►│
      │                      │                     │                   │─INSERT timeline──►│
      │                      │                     │                   │─INSERT notif──────►│
      │                      │◄──── JSON report ───│◄──────────────────│                   │
      │◄── refresh() ────────│                     │                   │                   │
      │─ toast + UI update   │                     │                   │                   │
```

---

## Ringkasan Jumlah Slide per Bagian

| Bagian | Slide | Topik |
|--------|-------|-------|
| **A — PRD** | A1–A7 | Visi, aktor, modul, user stories, state machine, NFR, matriks role |
| **B — ERD** | B1–B10 | Hub users, per klaster, kolom detail, ringkasan |
| **C — Database** | C1–C11 | Init, login, nomor ref, CRUD flow, antrian, CSI, audit |
| **D — Backend** | D1–D8 | Peta API, auth, service, contoh flow, response, keamanan |
| **E — Frontend** | E1–E12 | Struktur, bootstrap, routing, hooks, flow per fitur |

**Total ~48 slide teknis** · durasi 18–25 menit (atau pilih 1 bagian saja)

---

*File: `docs/presentasi-ppt-teknis.md` — hanya PRD, ERD, Database, Backend, Frontend*
