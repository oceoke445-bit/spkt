# SPKT Digital — API

Base URL: `/api`

## Auth

| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Registrasi user |
| POST | `/auth/logout` | Logout |
| GET | `/auth/session` | Cek sesi aktif |

## User

| Method | Path | Role | Deskripsi |
|--------|------|------|-----------|
| GET | `/users/me` | auth | Profil |
| PATCH | `/users/me` | auth | Update profil |
| POST | `/users/me/password` | auth | Ganti password |
| GET | `/users` | admin | Daftar user |
| PATCH | `/users/[id]` | admin | Aktif/nonaktif user |

## Laporan

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET/POST | `/reports` | List / buat laporan |
| GET/PATCH | `/reports/[id]` | Detail / update (user: draft only) |

## Surat & Pengaduan

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET/POST | `/letters` | Layanan surat |
| GET/PATCH | `/letters/[id]` | Kelola status (petugas/admin) |
| GET/POST | `/complaints` | Pengaduan |
| GET/PATCH | `/complaints/[id]` | Tanggapan (admin/petugas) |

## Lainnya

| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | `/upload` | Upload file |
| GET | `/files/[name]` | Download file |
| GET | `/notifications` | Notifikasi in-app |
| PATCH | `/notifications/[id]` | Tandai dibaca |
| GET | `/stats/admin` | Statistik dashboard admin |
| POST | `/survey/submit` | Survey CSI (auth required) |
