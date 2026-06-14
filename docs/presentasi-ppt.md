# SPKT Digital — Panduan Materi Presentasi (PPT)

Dokumen ini disusun **per slide** agar mudah disalin ke PowerPoint, Google Slides, atau Canva.  
Isi diselaraskan dengan implementasi proyek di repository ini.

**Struktur deck disarankan:**

| Bagian | Slide | Isi |
|--------|-------|-----|
| **A — Bisnis & Fitur** | 1–18 | Apa itu SPKT, layanan, peran, alur user |
| **B — Teknis (DB, BE, FE)** | 19–30 | Cara app jalan, frontend, backend, database |
| **Penutup** | 31–32 | Kesimpulan & Q&A |

**Durasi:** 15–20 menit · **Tema visual:** biru polisi / modern digital

---

## Daftar Isi Cepat

**Bagian A:** Slide 1–18 (fitur & layanan)  
**Bagian B:** Slide 19–30 (runtime, FE, BE, flow database)  
**Penutup:** Slide 31–32

---

## Slide 1 — Judul

**Judul:** SPKT Digital  
**Subjudul:** Sistem Pelayanan Kepolisian Terpadu Berbasis Web  
**Footer:** [Nama tim / institusi] · [Tanggal]

**Catatan pembicara:**  
Buka dengan menjelaskan bahwa SPKT Digital adalah aplikasi layanan polisi terintegrasi yang menghubungkan masyarakat, petugas, dan administrator dalam satu platform.

---

## Slide 2 — Apa Itu SPKT?

**Judul:** Apa Itu SPKT?

**Poin di slide:**
- **SPKT** = *Satuan Pelayanan Kepolisian Terpadu* (unit pelayanan publik di lingkungan kepolisian)
- Melayani masyarakat: laporan kejadian, surat keterangan, pengaduan layanan
- **SPKT Digital** = versi digital / online dari layanan tersebut

**Analogi singkat (opsional):**  
“Meja layanan SPKT di kantor polisi — sekarang bisa diakses lewat browser.”

---

## Slide 3 — Latar Belakang & Permasalahan

**Judul:** Mengapa Perlu Digitalisasi?

**Poin di slide:**
- Antrian manual & dokumen fisik memakan waktu
- Masyarakat sulit memantau status laporan/surat secara real-time
- Petugas kesulitan mengelola antrian lintas layanan
- Data layanan belum terpusat untuk evaluasi kualitas (CSI)

**Visual saran:** ikon antrian panjang → panah → layar digital

---

## Slide 4 — Tujuan Sistem

**Judul:** Tujuan SPKT Digital

**Poin di slide:**
1. **Mudah diakses** — layanan polisi dari perangkat masyarakat
2. **Transparan** — status & timeline dapat dilacak
3. **Efisien** — antrian terstruktur untuk petugas
4. **Terukur** — survei kepuasan (CSI) untuk perbaikan layanan
5. **Aman** — autentikasi, sesi, dan audit aktivitas admin

---

## Slide 5 — Ruang Lingkup Layanan

**Judul:** Empat Pilar Layanan

| Layanan | Untuk siapa | Contoh |
|---------|-------------|--------|
| **Laporan Polisi** | Masyarakat | Pencurian, kecelakaan, penipuan |
| **Layanan Surat** | Masyarakat | SKCK, surat kehilangan, izin keramaian |
| **Pengaduan** | Masyarakat | Keluhan/saran pelayanan SPKT |
| **CSI** | Masyarakat → Admin | Survei kepuasan setelah layanan selesai |

**Visual saran:** 4 kartu/kotak berwarna dengan ikon

---

## Slide 6 — Siapa Penggunanya?

**Judul:** Tiga Peran Pengguna

| Peran | Deskripsi |
|-------|-----------|
| **Masyarakat (`user`)** | Daftar, buat laporan/surat/pengaduan, lacak status |
| **Petugas (`petugas`)** | Proses antrian laporan, surat, dan pengaduan |
| **Admin (`admin`)** | Kelola user, petugas, statistik, CSI, audit |

**Visual saran:** diagram tiga kolom dengan ikon orang

---

## Slide 7 — Fitur untuk Masyarakat

**Judul:** Fitur Masyarakat

**Poin di slide:**
- Registrasi & login (NIK, email, telepon)
- **Buat laporan** + simpan draft + lampiran bukti
- **Laporan Saya** — timeline status per laporan
- **Layanan surat** — ajukan, draft, unduh PDF saat siap
- **Pengaduan** — keluhan dengan kategori & lampiran
- **Lacak layanan tanpa login** (nomor + NIK)
- Notifikasi in-app saat status berubah
- Pengaturan: profil, 2FA, export data, hapus akun

---

## Slide 8 — Fitur untuk Petugas

**Judul:** Fitur Petugas

**Poin di slide:**
- **Laporan Masuk** — antrian belum ditugaskan + tugas saya
- Verifikasi → ambil tugas → proses → selesai
- Kelola **pengajuan surat** masyarakat
- Tanggapi **pengaduan** dengan status & catatan
- Dashboard ringkasan: belum ditugaskan, diproses, selesai

**Visual saran:** screenshot mockup OfficerDashboard (jika ada)

---

## Slide 9 — Fitur untuk Admin

**Judul:** Fitur Administrator

**Poin di slide:**
- **Semua Laporan** — override status, reassign petugas
- **User Management** — aktif/nonaktif, ubah role
- **Kelola Petugas** — data petugas + tautan akun login
- **Statistik** — tren laporan, distribusi kasus
- **Dashboard CSI** — skor kepuasan per dimensi
- **Kelola Artikel** — CMS informasi & panduan
- **Audit log** — jejak aksi sensitif admin

---

## Slide 10 — Alur Laporan Polisi

**Judul:** Alur Laporan Polisi

**Diagram teks (bisa jadi SmartArt di PPT):**

```
Masyarakat buat laporan
    → Dikirim (submitted)
    → Diverifikasi petugas (verified)
    → Ditugaskan (assigned)
    → Diproses (processing)
    → Selesai (completed) / Ditolak (rejected)
```

**Poin tambahan:**
- Setiap perubahan status tercatat di **timeline**
- Nomor laporan otomatis (contoh: `LAP-2025-0001`)
- Notifikasi ke pelapor saat status berubah

**Visual saran:** flowchart horizontal 6 kotak

---

## Slide 11 — Alur Layanan Surat

**Judul:** Alur Layanan Surat

**Jenis surat:**
- Surat Keterangan Catatan Kepolisian (SKCK)
- Surat Keterangan Kehilangan
- Surat Izin Keramaian

**Alur status:**
```
Draft → Dikirim → Diverifikasi → Diproses → Siap Diambil → Selesai
                                              (atau Ditolak)
```

**Fitur unggulan:**
- Simpan draft & lanjutkan nanti
- Timeline pengajuan
- Unduh **PDF** surat saat siap

---

## Slide 12 — Alur Pengaduan & CSI

**Judul:** Pengaduan & Kepuasan Masyarakat (CSI)

**Pengaduan:**
```
Diajukan → Ditinjau → Diproses → Selesai / Ditutup
```
- Petugas/admin memberi tanggapan tertulis
- Timeline riwayat status pengaduan

**CSI (Customer Satisfaction Index):**
- Muncul setelah layanan selesai (laporan/surat/pengaduan)
- Skor dimensi 1–5 + komentar opsional
- Admin melihat rata-rata CSI, tren, per layanan

---

## Slide 13 — Lacak Tanpa Login

**Judul:** Transparansi: Lacak Layanan Publik

**Poin di slide:**
- Masyarakat **tidak wajib login** untuk cek status
- Input: **jenis layanan** + **nomor referensi** + **NIK**
- Mendukung: laporan, surat, pengaduan
- Melindungi privasi: hanya data yang cocok dengan NIK yang ditampilkan

**Visual saran:** mockup halaman “Lacak layanan tanpa login”

---

## Slide 14 — Arsitektur Teknis

**Judul:** Arsitektur Sistem

**Diagram teks:**

```
[Browser / Masyarakat & Petugas]
        ↓ HTTPS
[Next.js 15 — React UI + API Routes]
        ↓
[Service Layer — spkt.ts, users.ts, dll.]
        ↓
[SQLite]  +  [Folder Upload]
 data/spkt.db    data/uploads/
```

**Karakteristik:**
- Single Page Application (SPA) — navigasi `/?view=menu`
- REST API di `/api/*`
- Database & upload otomatis dibuat saat pertama jalan

---

## Slide 15 — Stack Teknologi

**Judul:** Teknologi yang Digunakan

| Lapisan | Teknologi |
|---------|-----------|
| Frontend | React 19, Tailwind CSS, Radix UI |
| Framework | Next.js 15 (App Router) |
| Backend | Next.js API Routes (Node.js) |
| Database | SQLite (`node:sqlite`) |
| Auth | Cookie session + bcrypt + 2FA TOTP |
| Chart CSI | Recharts |
| Testing | Vitest |
| CI | GitLab CI (test + build) |

**Persyaratan:** Node.js ≥ 22.5.0

---

## Slide 16 — Keamanan & Privasi

**Judul:** Keamanan Data

**Poin di slide:**
- Sesi **HttpOnly cookie** (7 hari)
- Password di-hash (bcrypt)
- **2FA TOTP** opsional; admin bisa diwajibkan
- Rate limit login & lupa password
- Security headers (X-Frame-Options, dll.)
- **Audit log** untuk aksi admin sensitif
- Hapus akun: anonimisasi data layanan by NIK
- Preferensi notifikasi & riwayat aktivitas dapat dikontrol user

---

## Slide 17 — Demo & Akun Uji

**Judul:** Cara Menjalankan & Akun Demo

**Setup singkat:**
```bash
npm install
npm run dev
```
Buka: `http://localhost:3000`

| Role | Email | Password |
|------|-------|----------|
| Masyarakat | `user@spkt.id` | `spkt123` |
| Petugas | `petugas@spkt.id` | `spkt123` |
| Admin | `admin@spkt.id` | `spkt123` |

**Tips demo live:** login petugas → Laporan Masuk → ambil tugas → ubah status

---

## Slide 18 — Manfaat & Dampak

**Judul:** Manfaat SPKT Digital

**Untuk masyarakat:**
- Hemat waktu & biaya transport
- Status layanan terpantau 24/7
- Bukti digital (nomor referensi, timeline, PDF surat)

**Untuk institusi:**
- Antrian terstruktur & terukur
- Data statistik & CSI untuk evaluasi
- Jejak audit untuk akuntabilitas

**Untuk penelitian / pengembangan:**
- Kode terbuka, terdokumentasi, dapat diuji (unit test + skenario uji)

---

## Slide 19 — Batasan & Pengembangan Lanjut

**Judul:** Batasan Saat Ini & Roadmap

**Sudah ada:**
- Notifikasi in-app, pagination, backup DB, CMS artikel

**Belum / opsional ke depan:**
- Email & SMS notifikasi (perlu provider eksternal)
- Push notification mobile
- Integrasi sistem kepolisian nasional
- Deployment multi-region & rate limit terdistribusi

**Pesan penutup:** fondasi digital layanan SPKT sudah siap untuk pilot & iterasi

---

## Slide 20 — Kesimpulan

**Judul:** Kesimpulan

**Poin di slide:**
- SPKT Digital mengintegrasikan **laporan, surat, pengaduan, dan CSI** dalam satu platform
- Tiga peran (**masyarakat, petugas, admin**) dengan hak akses jelas
- Dibangun dengan stack modern (**Next.js + SQLite**) yang mudah di-deploy
- Mendukung **transparansi, efisiensi, dan pengukuran kualitas layanan**

**Kalimat penutup (opsional):**  
“SPKT Digital bukan pengganti proses hukum, melainkan jembatan digital yang mempercepat dan memperjelas pelayanan kepolisian kepada masyarakat.”

---

## Slide 21 — Terima Kasih / Q&A

**Judul:** Terima Kasih  
**Subjudul:** Pertanyaan & Diskusi?

**Kontak / referensi (sesuaikan):**
- Repo / dokumentasi: `docs/penjelasan.md`, `docs/API.md`
- Health check: `/api/health`
- Backup: `npm run backup:db`

---

# Lampiran — Cheat Sheet untuk Designer PPT

## Palet warna (sesuai UI aplikasi)
- Background gelap: `#0d1b2a` / biru navy
- Aksen utama: `#3b82f6` (biru)
- Aksen sukses: `#10b981` (hijau)
- Teks: putih / `#93c5fd` (biru muda)

## Ikon yang cocok (Lucide / Material)
- Laporan: `FileText`, `Shield`
- Surat: `Mail`, `FileCheck`
- Pengaduan: `MessageSquare`
- Petugas: `User`, `Inbox`
- Admin: `BarChart`, `Settings`
- CSI: `Star`, `TrendingUp`

## Slide opsional (jika butuh 25 slide)
- **Slide A:** Perbandingan layanan manual vs digital (tabel before/after)
- **Slide B:** Model data ringkas (users, reports, letters, complaints, officers)
- **Slide C:** Screenshot beranda / login / dashboard per role
- **Slide D:** Metodologi penelitian (jika presentasi akademik)

## Urutan demo live (5 menit)
1. Login masyarakat → buat laporan draft → submit
2. Lacak tanpa login (nomor + NIK)
3. Login petugas → Laporan Masuk → verifikasi → ambil tugas
4. Login admin → statistik + CSI + audit log
5. Settings → 2FA / export data (sekilas)

---

*Dokumen: `docs/presentasi-ppt.md` · SPKT Digital · untuk keperluan presentasi PPT, bukan PDF.*
