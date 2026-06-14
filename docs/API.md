# SPKT Digital — API Contract

Base URL: `/api`

## Auth

| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | `/auth/login` | Login `{ email, password }` |
| POST | `/auth/register` | Register `{ email, password, name, nik, phone }` |
| POST | `/auth/logout` | Logout |
| GET | `/auth/session` | Cek sesi aktif |

## Users

| Method | Path | Role | Deskripsi |
|--------|------|------|-----------|
| GET | `/users/me` | any | Profil user |
| PATCH | `/users/me` | any | Update `{ name, phone, address, avatarUrl }` |
| POST | `/users/me/password` | any | Ganti password |
| GET/PATCH | `/users/me/preferences` | any | Preferensi notifikasi & tema |
| GET | `/users` | admin | Daftar user |
| PATCH | `/users/:id` | admin | Update `{ name, email, role, active }` |

## Reports

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/reports` | List (user: by NIK; staff: all/filter) |
| POST | `/reports` | Buat laporan |
| GET/PATCH | `/reports/:id` | Detail / update (user: draft; staff: proses) |

## Letters & Complaints

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET/POST | `/letters` | List / buat pengajuan surat |
| PATCH | `/letters/:id` | Update status (petugas/admin) |
| GET/POST | `/complaints` | List / buat pengaduan |
| PATCH | `/complaints/:id` | Tanggapi (petugas/admin) |

## Officers & Stats

| Method | Path | Role |
|--------|------|------|
| GET/POST | `/officers` | admin (POST), petugas+admin (GET) |
| PATCH | `/officers/:id` | admin |
| GET | `/stats/admin` | admin |

## Survey (CSI)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/survey/dimensions` | Dimensi penilaian |
| GET | `/survey/check?serviceType=&referenceId=` | Cek sudah submit |
| POST | `/survey/submit` | Kirim penilaian |
| GET | `/survey/csi/summary` | Ringkasan CSI (admin) |
| GET | `/survey/recent` | Penilaian terbaru (admin) |

## Lainnya

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/notifications` | Notifikasi user |
| PATCH | `/notifications/:id` | Tandai dibaca |
| POST | `/upload` | Upload file |
| GET | `/files/:name` | Unduh file |
| GET | `/info/articles` | Artikel informasi |
| GET | `/health` | Healthcheck |
