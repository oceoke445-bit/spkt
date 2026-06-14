# SPKT Digital — Flow

## Masyarakat (user)

1. **Registrasi / Login** → session cookie
2. **Buat Laporan** → upload bukti → `submitted` (atau simpan `draft` → lanjutkan nanti)
3. **Lacak laporan** → timeline + notifikasi in-app saat status berubah
4. **Layanan Surat** → upload dokumen → petugas verifikasi → siap diambil → selesai
5. **Pengaduan** → lampiran opsional → admin/petugas menanggapi

## Petugas

1. **Laporan Masuk** → verifikasi / assign / proses / selesai / tolak
2. **Layanan Surat** → verifikasi dokumen → siap diambil (set tanggal) → selesai
3. **Pengaduan** → ubah status + tanggapan

## Admin

1. Dashboard statistik (data real dari DB)
2. Override status laporan + reassign petugas
3. Kelola user (aktif/nonaktif)
4. CSI dashboard

## Status transisi

- **Laporan:** submitted → verified → assigned → processing → completed (admin boleh override)
- **Surat:** submitted → verified → ready → completed
- **Pengaduan:** submitted → reviewing → processing → resolved → closed
