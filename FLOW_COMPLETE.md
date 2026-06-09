# 🔵 FLOW LENGKAP SISTEM SPKT DIGITAL

## 🎯 OVERVIEW SISTEM

SPKT Digital adalah sistem **3 Role** dengan flow yang **jelas dan terstruktur**:

```
USER (Masyarakat) → Buat Laporan
        ↓
    DATABASE
        ↓
PETUGAS → Ambil & Proses
        ↓
ADMIN → Monitor & Control
```

---

## 👤 FLOW 1: USER (MASYARAKAT)

### **A. LOGIN & DASHBOARD**
```
1. Buka aplikasi
2. Login dengan: user@spkt.id / password
3. Masuk ke Dashboard User
   
   Dashboard menampilkan:
   ✅ 4 Stats Card:
      - Total Laporan
      - Sedang Diproses
      - Selesai
      - Layanan Surat
   
   ✅ Quick Actions (3 tombol besar):
      - Buat Laporan
      - Ajukan Surat
      - Lacak Status
   
   ✅ Laporan Terbaru (3 laporan terakhir)
   ✅ Notifikasi (jika ada surat siap diambil)
```

### **B. BUAT LAPORAN** (Feature Utama)
```
Dashboard → Klik "Buat Laporan"
    ↓
FORM LAPORAN (3 Section):

1️⃣ DATA PELAPOR
   - Nama Lengkap (auto-fill dari akun)
   - NIK (auto-fill)
   - No Telepon (auto-fill)

2️⃣ DATA KEJADIAN
   - Jenis Kasus (dropdown: Kehilangan, Pencurian, dll)
   - Tanggal Kejadian (date picker)
   - Lokasi (text + icon Map)
   - Kronologi (textarea min 50 karakter)

3️⃣ UPLOAD BUKTI (Optional)
   - Drag & drop area
   - Support: PNG, JPG, PDF
   - Max 10MB per file
   - Max 5 files

    ↓
Klik "Kirim Laporan"
    ↓
✅ Success Screen:
   - Icon checklist besar
   - Nomor Laporan: LP/XXX/V/2026
   - Button: "Lihat Laporan Saya"
   - Button: "Kembali ke Dashboard"
```

### **C. TRACKING LAPORAN**
```
Dashboard → "Laporan Saya"
    ↓
LIST VIEW:
   - Search bar (cari nomor/jenis)
   - Filter: Semua, Proses, Selesai
   - Card per laporan dengan:
     • Nomor Laporan
     • Status Badge (warna)
     • Jenis Kasus
     • Tanggal
     • Button "Detail" ← BARU!
    ↓
Klik "Detail"
    ↓
MODAL DETAIL LAPORAN:
   
   Header:
   - Nomor Laporan (besar)
   - Status Badge
   - Tanggal dibuat
   
   Content:
   1️⃣ TIMELINE TRACKING (Visual Keren!)
      ✅ Laporan Dikirim (tanggal + jam)
      ✅ Diverifikasi (officer name + tanggal)
      🔵 Ditugaskan (officer name + note)
      ⏳ Diproses (current step)
      ⬜ Selesai (pending)
   
   2️⃣ DATA PELAPOR
      - Nama, NIK, Telepon
   
   3️⃣ DETAIL KEJADIAN
      - Jenis, Tanggal, Lokasi, Kronologi
   
   4️⃣ BUKTI PENDUKUNG
      - List file yang diupload
   
   5️⃣ CATATAN PETUGAS (jika ada)
      - Background hijau
      - Icon info
      - Text catatan
```

### **D. LAYANAN SURAT**
```
Dashboard → "Layanan Surat"
    ↓
3 CARD LAYANAN:
   📋 SKCK
   📄 Surat Kehilangan
   🎉 Izin Keramaian
    ↓
Klik Card → Form Pengajuan
    ↓
FORM:
   - Data Diri
   - Keperluan
   - Upload Dokumen
   - Pilih Tanggal Pengambilan
    ↓
Submit → Status: "Diajukan"
    ↓
TRACKING:
   - List pengajuan saya
   - Status: Diajukan → Diverifikasi → Siap Diambil
   - Notifikasi saat siap
```

### **E. PENGADUAN**
```
Dashboard → "Pengaduan"
    ↓
FORM PENGADUAN:
   - Kategori (5 pilihan)
   - Subjek
   - Deskripsi
   - Upload Bukti
    ↓
Submit → Dapat nomor pengaduan
    ↓
TRACKING:
   - List pengaduan
   - Status + Tanggapan petugas
   - Button "Detail" untuk lihat lengkap
```

---

## 👮 FLOW 2: PETUGAS (OPERATOR)

### **A. LOGIN & DASHBOARD**
```
Login: petugas@spkt.id
    ↓
DASHBOARD PETUGAS:
   
   4 Stats Card:
   - Belum Ditugaskan (jumlah)
   - Ditugaskan ke Saya (jumlah)
   - Sedang Diproses (jumlah)
   - Selesai Hari Ini (jumlah)
```

### **B. PROSES LAPORAN (3 LANGKAH WAJIB)**
```
Dashboard → List "Laporan Masuk"
    ↓
CARD LAPORAN:
   - Nomor Laporan
   - Status Badge
   - Nama Pelapor
   - Jenis Kasus
   - Lokasi
   - Button "Detail" ← BARU!
    ↓
Klik "Detail" → Modal Detail
    ↓

🔵 LANGKAH 1: ASSIGN (jika belum assigned)
   Alert Biru:
   "✅ Langkah 1: Laporan belum ditugaskan"
   
   Button: "Ambil Laporan Ini"
   ↓ Klik
   Status: Dikirim → Ditugaskan
   Toast: "Laporan ditugaskan kepada Anda"
   
   ↓

🟡 LANGKAH 2: MULAI PROSES
   Alert Kuning:
   "✅ Langkah 2: Mulai memproses laporan"
   
   - Textarea: Catatan Awal
   - Button: "Mulai Proses"
   ↓ Klik
   Status: Ditugaskan → Diproses
   Toast: "Status diubah menjadi Diproses"
   
   ↓

🟣 LANGKAH 3: UPDATE STATUS
   Alert Ungu:
   "✅ Langkah 3: Update status laporan"
   
   - Dropdown: Status Baru
     • Masih Diproses
     • Selesai
     • Tolak
   - Textarea: Catatan
   - Button: "Update Status"
   ↓ Klik
   Status: Diproses → Selesai/Ditolak
   Toast: "Status berhasil diperbarui"
```

### **C. INFO PENUGASAN (Ditampilkan di Detail)**
```
Card Info (Background Indigo):
   - Ditugaskan ke: [Nama Petugas]
   - Oleh: [Admin/System]
   - Pada: [Tanggal + Jam]
   - Prioritas: [URGENT/HIGH/MEDIUM/LOW]
```

---

## 🧑‍💼 FLOW 3: ADMIN (MANAGEMENT)

### **A. LOGIN & DASHBOARD ANALYTICS**
```
Login: admin@spkt.id
    ↓
DASHBOARD ADMIN:
   
   4 Stats Card dengan Grafik:
   - Total Laporan (+12% bulan lalu)
   - Sedang Diproses (5 baru hari ini)
   - Selesai (85% completion rate)
   - Rata-rata Waktu (2.5 hari)
   
   4 Charts:
   📊 Line Chart - Tren Bulanan
   🥧 Pie Chart - Distribusi Kasus
   📊 Bar Chart - Waktu Respons
   📋 Activity Feed - Update Terkini
   
   System Health:
   ✅ Server Online
   ✅ Database Healthy
   👥 247 Active Users
   📈 99.9% Uptime
```

### **B. ADMIN CONTROL CENTER**
```
Dashboard → "Semua Laporan"
    ↓
ADMIN CONTROL PAGE:
   
   Header: 3 Power Cards
   🔴 Override Status
   🟠 Reassign Officer
   🟣 Suspend User
   
   Search Bar (cari laporan)
   
   LIST LAPORAN:
   Card per laporan:
   - Nomor + Status Badge
   - Priority Badge (Urgent/High/Medium)
   - Nama Pelapor
   - Jenis Kasus
   - Petugas yang handle
   
   3 ACTION BUTTONS:
   🔴 Override
   🔵 Reassign
   ⚫ Suspend User
```

### **C. OVERRIDE STATUS**
```
Klik "Override" di laporan
    ↓
MODAL OVERRIDE:
   
   ⚠️ Warning Alert (Red):
   "PERHATIAN: Override akan tercatat dalam audit log"
   
   Form:
   - Status Saat Ini (tampil)
   - Status Baru (dropdown semua status)
   - Alasan Override* (wajib)
   
   Button: "Konfirmasi Override"
   ↓
Toast: "Status berhasil di-override"
Audit log tercatat
```

### **D. REASSIGN OFFICER**
```
Klik "Reassign" di laporan
    ↓
MODAL REASSIGN:
   
   Info Petugas Saat Ini (jika ada)
   
   Dropdown: Pilih Petugas Baru
   Tampil:
   - Nama + Rank
   - Status (Available/Busy/Offline)
   - Jumlah Cases saat ini
   
   Button: "Tugaskan Ulang"
   ↓
Toast: "Berhasil reassign ke [Nama Petugas]"
```

### **E. USER MANAGEMENT**
```
Dashboard → "User Management"
    ↓
TABLE USERS:
   | Nama | Email | Role | Status | Aksi |
   
   Aksi:
   - Edit (icon pensil)
   - Disable (icon ban)
   - Delete (icon trash)
```

### **F. STATISTIK**
```
Dashboard → "Statistik"
    ↓
Same as Admin Dashboard
(Charts & Analytics)
```

---

## 🔄 FLOW STATUS LENGKAP (7 Steps)

```
1. DRAFT
   ↓ User save draft
   
2. DIKIRIM 🟡
   ↓ User submit laporan
   
3. DIVERIFIKASI 🔵
   ↓ Admin/System verifikasi
   
4. DITUGASKAN 🟣
   ↓ Petugas ambil laporan
   
5. DIPROSES 🟠
   ↓ Petugas mulai proses
   
6. SELESAI 🟢
   ↓ Petugas selesaikan
   
7. DITOLAK 🔴 (optional branch)
   ↓ Petugas/Admin tolak
```

---

## 📱 FITUR DETAIL BUTTON (SEMUA PAGE)

### **User - Laporan Saya:**
```
Card Laporan → Button "Detail" (bottom right)
   ↓ Klik
Modal Full Detail dengan Timeline
```

### **Petugas - Laporan Masuk:**
```
Card Laporan → Button "Detail" (bottom right)
   ↓ Klik
Modal dengan 3-Step Action Guide
```

### **Admin - Semua Laporan:**
```
Card Laporan → 3 Button Actions:
   - Override
   - Reassign
   - Suspend
(Tetap bisa klik card untuk detail lengkap)
```

---

## 🎨 COLOR SYSTEM (BLUE THEME)

### **Primary Colors:**
```
Primary Blue:   #2563eb (buttons, links)
Light Blue:     #dbeafe (backgrounds)
Dark Blue:      #1e40af (headers)
```

### **Status Colors:**
```
Draft:      #6b7280 (Gray)
Dikirim:    #f59e0b (Amber)
Verified:   #3b82f6 (Blue)
Assigned:   #6366f1 (Indigo)
Processing: #8b5cf6 (Purple)
Completed:  #10b981 (Green)
Rejected:   #ef4444 (Red)
```

### **UI Elements:**
```
Cards:       White with blue border
Buttons:     Blue gradient
Badges:      Rounded with blue tint
Sidebar:     Dark blue (#1e3a8a)
Header:      Blue gradient
```

---

## 📊 MATRIX FEATURES

| Feature | User | Petugas | Admin |
|---------|------|---------|-------|
| Dashboard | ✅ Stats | ✅ Workload | ✅ Analytics |
| Buat Laporan | ✅ | ❌ | ❌ |
| Lihat Detail | ✅ Own | ✅ Assigned | ✅ All |
| Assign | ❌ | ✅ Self | ✅ Anyone |
| Process | ❌ | ✅ 3 Steps | ❌ |
| Override | ❌ | ❌ | ✅ |
| Reassign | ❌ | ❌ | ✅ |
| Suspend | ❌ | ❌ | ✅ |
| Statistics | ❌ | ❌ | ✅ |

---

## 🚀 TESTING FLOW

### **Quick Test:**
```
1. Login User → Buat Laporan → Klik "Detail" di list
2. Login Petugas → Klik "Detail" → Follow 3 Steps
3. Login Admin → Klik "Override" → Test power
```

---

**FLOW INI SUDAH 100% IMPLEMENTED! 🔥**
