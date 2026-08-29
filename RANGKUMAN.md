# Rangkuman Project SiPeKon
**Sistem Permintaan Konsumsi — SMK Mitra Industri MM2100 & 03**

---

## Stack Teknologi

| Komponen | Teknologi |
|---|---|
| Frontend + Backend | Next.js 14 App Router |
| Database | SQLite (file lokal) |
| ORM | Prisma |
| Auth | NextAuth.js (login pakai nama + password) |
| UI | Tailwind CSS |
| Notifikasi | react-hot-toast |
| Icons | lucide-react |

---

## Fitur yang Sudah Jadi

- ✅ Login dengan role **Admin / Staff / Approver**
- ✅ Dashboard permintaan + filter + pagination
- ✅ Form buat & edit permintaan (nama acara, tanggal, jam mulai–selesai, ruangan, konsumsi + dll, catatan)
- ✅ Detail permintaan + cetak/print
- ✅ Halaman persetujuan khusus Approver (setujui / tolak + alasan)
- ✅ Manajemen User CRUD (admin only)
- ✅ Status: Pending → Disetujui / Ditolak → Selesai
- ✅ Alasan tolak tampil di detail permintaan
- ✅ Buka link coffeeshop di tab baru setelah simpan permintaan
- ✅ Branding SMK Mitra Industri + logo

---

## Struktur Halaman

| URL | Deskripsi | Akses |
|---|---|---|
| `/login` | Halaman login | Semua |
| `/dashboard` | Daftar semua permintaan | Admin, Staff |
| `/permintaan/baru` | Form buat permintaan baru | Admin, Staff |
| `/permintaan/[id]` | Detail permintaan + print | Admin, Staff |
| `/permintaan/[id]/edit` | Edit permintaan | Admin, Staff |
| `/persetujuan` | Setujui / tolak permintaan | Approver, Admin |
| `/users` | Manajemen user CRUD | Admin only |

---

## Akun Login Default

| Role | Nama | Password |
|---|---|---|
| Admin | Ahmad Fauzi | `admin123` |
| Approver | Rina Apriyanti | `approver123` |
| Staff | Siti Rahayu | `staff123` |
| Staff | Budi Santoso | `staff123` |
| Staff | Dewi Lestari | `staff123` |

---

## Cara Menjalankan

```bash
# Masuk ke folder project
cd C:\Users\Alvino\konsumsi-app

# Install dependencies (pertama kali saja)
npm install

# Buat database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Isi data awal
npm run db:seed

# Jalankan server
npm run dev
```

Buka browser: **http://localhost:3000**

---

## Struktur File Penting

```
konsumsi-app/
├── prisma/
│   ├── schema.prisma        # Model database
│   └── seed.ts              # Data awal
├── src/
│   ├── app/
│   │   ├── (app)/           # Halaman dengan sidebar
│   │   │   ├── dashboard/
│   │   │   ├── permintaan/
│   │   │   │   ├── baru/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx   (detail)
│   │   │   │       └── edit/
│   │   │   ├── persetujuan/
│   │   │   └── users/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── permintaan/
│   │   │   └── users/
│   │   └── login/
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── Pagination.tsx
│   │   └── ConfirmModal.tsx
│   └── lib/
│       ├── prisma.ts
│       └── auth.ts
├── public/
│   └── logo.jpg
├── .env                     # Konfigurasi database & auth
└── .env.local               # Konfigurasi Next.js
```

---

## Database Schema

```
User          → id, nama, jabatan, divisi, role, password
Permintaan    → id, namaAcara, tanggal, jamMulai, jamSelesai,
                ruangan, status, alasanTolak, catatan, pemohonId
ItemKonsumsi  → id, jenis, qty, keterangan, permintaanId
```

**Role:** `ADMIN` | `STAFF` | `APPROVER`

**Status:** `PENDING` → `DISETUJUI` / `DITOLAK` → `SELESAI`

**Jenis Item:** `SNACK_PAGI` | `SNACK_SORE` | `MAKAN_SIANG` | `KOPI` | `AIR_MINERAL` | `DLL`

---

## Yang Belum / Rencana

- ⏳ **Notifikasi WhatsApp** ke Approver via Fonnte
  - Butuh daftar di https://fonnte.com
  - Butuh nomor WA pengirim (scan QR)
  - Butuh nomor WA 3 Approver
- ⏳ **Push ke GitHub** — https://github.com/alvinnozf-ux/web-konsumsi

---

*Dibuat: 29 Agustus 2026*
