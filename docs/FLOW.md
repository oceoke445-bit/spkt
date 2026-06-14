# SPKT Digital — Alur Aplikasi

## Role & Navigasi

| Role | Menu utama |
|------|------------|
| Masyarakat (`user`) | Dashboard, Buat Laporan, Laporan Saya, Layanan Surat, Pengaduan, Informasi, Pengaturan |
| Petugas (`petugas`) | Dashboard, Laporan Masuk, Layanan Surat, Pengaduan, Informasi, Pengaturan |
| Admin (`admin`) | Dashboard, Semua Laporan, User Management, Kelola Petugas, Statistik, CSI, Informasi, Pengaturan |

Navigasi internal memakai query URL: `/?view=my-reports`

## Flow Laporan

```
draft → submitted → verified → assigned → processing → completed
                              ↘ rejected
```

1. **Masyarakat** membuat laporan (bisa simpan draft)
2. **Petugas** verifikasi laporan (`submitted → verified`)
3. **Petugas** ambil/tugaskan ke diri sendiri (`→ assigned`)
4. **Petugas** mulai proses (`→ processing`)
5. **Petugas** selesaikan (`→ completed`)
6. **Masyarakat** memberi penilaian CSI setelah status `completed`

Admin dapat override status dan reassign petugas via Admin Control Center.

## Flow Surat

```
submitted → verified → ready → completed
           ↘ rejected
```

CSI ditampilkan ke masyarakat saat status `ready` atau `completed`.

## Flow Pengaduan

```
submitted → reviewing → processing → resolved → closed
```

CSI ditampilkan saat status `resolved` atau `closed`.

## Notifikasi

Status laporan/surat/pengaduan memicu notifikasi in-app. Preferensi saluran disimpan per user di `users.preferences_json`.

## Autentikasi

- Session cookie `spkt_session` (7 hari)
- Register otomatis login sebagai role `user`
