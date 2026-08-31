# Rangkuman Project SiPeKon
**Sistem Permintaan Konsumsi — SMK Mitra Industri MM2100 & 03**

---

## Stack Teknologi

| Komponen | Teknologi |
|---|---|
| Frontend + Backend | Next.js 14 App Router |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth.js (login pakai username + password) |
| UI | Tailwind CSS |
| Notifikasi | react-hot-toast |
| Icons | lucide-react |

---

## Fitur yang Sudah Jadi

- ✅ Login dengan role **Admin / Staff / Approver**
- ✅ Dashboard permintaan + stat cards + filter + pagination
- ✅ Form buat & edit permintaan (nama acara, jurusan, tanggal, jam, ruangan, konsumsi, catatan)
- ✅ Detail permintaan + cetak/print (header SMK, tanpa header/footer browser)
- ✅ Halaman persetujuan khusus Approver (setujui / tolak + alasan)
- ✅ Manajemen User CRUD (admin only) + field username
- ✅ Status: Pending → Disetujui / Ditolak → Selesai
- ✅ Alasan tolak tampil di detail permintaan
- ✅ Tombol Edit hanya muncul saat status PENDING
- ✅ Blokir akses halaman edit jika status bukan PENDING
- ✅ Buka link coffeeshop di tab baru setelah simpan permintaan
- ✅ Branding SMK Mitra Industri + 2 logo (MM2100 & 03)
- ✅ Bisa dibuka di HP lewat hotspot (jalankan dengan `-H 0.0.0.0`)
- ✅ Field pemohon di form pakai **autocomplete** (ketik nama, pilih dari daftar)
- ✅ **109 guru** dari Data Guru Per Divisi sudah dimasukkan sebagai STAFF

---

## Riwayat UI / Fix

### UI Redesign Awal (31 Agustus 2026)
- ✅ **Login page** — split layout (branding kiri, form kanan), grid bg subtle, headline bold, stats strip
- ✅ **Sidebar** — deeper navy gradient, app name pill "SiPeKon", gradient avatar, nav item dengan icon box
- ✅ **Dashboard header** — tanggal hari ini + badge jumlah pending
- ✅ **Stat cards** — full color solid (navy / amber / emerald / merah), angka besar putih, bisa diklik sebagai filter
- ✅ **Item konsumsi (form)** — list row tap-able, warna per item, checkbox custom, qty muncul setelah dipilih
- ✅ **StatusBadge** — dot indicator, rounded-lg, lebih ekspresif
- ✅ **globals.css** — design tokens: btn-primary gradient navy, input field, card shadow clean

### Bug Fix & Polish (31 Agustus 2026 — sesi ke-2)
- ✅ **Tailwind bug fix** — `text-navy-700`, `bg-navy-700` dll sekarang resolve via `@layer utilities` di globals.css
- ✅ **Opacity non-standard fix** — `bg-white/8`, `bg-sky-500/8` diganti `rgba()` inline
- ✅ **Sidebar** — hapus CSS variable `--hover-bg`, tombol Keluar pakai `onMouseEnter/Leave`
- ✅ **Dashboard mobile** — emoji diganti Lucide icons (`CalendarDays`, `Clock3`, `MapPin`)
- ✅ **Persetujuan page** — header konsisten, item badges per-warna, modal `rounded-2xl + backdrop-blur`
- ✅ **Users page** — role badges pakai dot indicator, modal `rounded-2xl + backdrop-blur`
- ✅ **Detail page** — card tiles dengan icon, alasan tolak prominent, item badges per jenis, catatan amber bg
- ✅ **ConfirmModal** — `rounded-2xl shadow-2xl backdrop-blur-sm`, icon container `rounded-xl`

### Anti-Slop Fix (31 Agustus 2026 — sesi ke-3)
- ✅ **`lib/constants.ts`** — `JENIS_LABEL` dan `JENIS_COLOR` dipindah ke satu file shared, tidak lagi duplikat di 3 file
- ✅ **Type hantu fix** — `jabatan` dan `divisi` di persetujuan/page.tsx dihapus (tidak ada di schema DB)
- ✅ **Empty state** — `PartyPopper` → `ClipboardList` (lebih relevan untuk app daftar)
- ✅ **FieldError** — emoji `⚠` → Lucide `AlertCircle` (konsisten dengan sisa UI)
- ✅ **Dashboard greeting** — dari nama doang jadi `"Selamat pagi/siang/sore, [Nama]"` + subtitle role
- ✅ **Greeting logic** — IIFE di JSX diganti `getGreeting()` function + `firstName` variable di luar render

### Fitur Baru (31 Agustus 2026 — sesi ke-4)
- ✅ **Logo diupdate** — logo lama diganti 2 logo bulat (MM2100 + 03) di login page, sidebar, dan print header
- ✅ **Field pemohon autocomplete** — Admin bisa ketik nama pemohon, muncul suggestion dari daftar user, pilih → `pemohonId` terisi otomatis. Berlaku di form buat dan edit permintaan.
- ✅ **Username system** — field `username` ditambah ke tabel `User`. Login sekarang pakai username bukan nama. Nama lengkap tetap tampil sebagai display name.
- ✅ **109 guru di-seed** — dari file "Data Guru Per Divisi 26 Agustus 2026.pdf", semua nama unik dimasukkan sebagai STAFF. Username = 2 kata pertama nama lowercase (contoh: `abdul.munir`), password = username.
- ✅ **Users page** — kolom username ditambahkan di tabel, form tambah/edit user sekarang ada field username

### Perbaikan & Fitur Baru (31 Agustus 2026 — sesi ke-5)
- ✅ **Fix login error state** — validasi per-field (kosong) dipisah dari error kredensial salah. Field tidak merah saat salah login.
- ✅ **Fix Sidebar NavLink** — dipindah ke luar nested component, tidak di-recreate setiap render.
- ✅ **API `/api/permintaan/stats`** — endpoint baru pakai Prisma `groupBy`, 1 request menggantikan 5 fetch paralel.
- ✅ **Fix Dashboard stats** — `fetchStats` sekarang 1 fetch ke `/api/permintaan/stats`.
- ✅ **Fix validasi jam** — form buat & edit sekarang reject jika jam selesai ≤ jam mulai.
- ✅ **Upgrade edit/page.tsx** — visual card per item, icon warna-warni, custom checkbox, sama persis dengan form buat baru.
- ✅ **Polish Pagination** — warna active button sekarang navy gradient, konsisten dengan btn-primary.
- ✅ **Search bar Users page** — cari by nama, username, atau role. Real-time, ada tombol clear, counter berubah saat filter aktif.
- ✅ **Notifikasi email** — pakai Nodemailer + Gmail App Password. Email terkirim otomatis ke Approver setiap ada permintaan baru. Gagal kirim tidak ganggu simpan permintaan.

---

## Cara Buka di HP (Hotspot)

```bash
# Laptop konek ke hotspot HP
# Cek IP baru laptop
ipconfig

# Jalankan server
cd C:\Users\Alvino\konsumsi-app
npx next dev -H 0.0.0.0

# Buka di browser HP
http://<IP-laptop>:3000
```

---

## Struktur Halaman

| URL | Deskripsi | Akses |
|---|---|---|
| `/login` | Halaman login | Semua |
| `/dashboard` | Daftar semua permintaan + stat cards | Admin, Staff |
| `/permintaan/baru` | Form buat permintaan baru | Admin, Staff |
| `/permintaan/[id]` | Detail permintaan + print | Admin, Staff |
| `/permintaan/[id]/edit` | Edit permintaan (hanya PENDING) | Admin, Staff |
| `/persetujuan` | Setujui / tolak permintaan | Approver, Admin |
| `/users` | Manajemen user CRUD | Admin only |

---

## Akun Login Default

```
username: admin       → password: admin123     (ADMIN)
username: approver    → password: approver123  (APPROVER)

109 guru (STAFF):
username: abdul.munir         → password: abdul.munir
username: nuryana.fitriyani   → password: nuryana.fitriyani
username: hidayat.atori       → password: hidayat.atori
... dst (username = 2 kata pertama nama, lowercase, spasi → titik)
```

---

## Cara Menjalankan

```bash
cd C:\Users\Alvino\konsumsi-app
npm install          # pertama kali saja
npx prisma db push   # push schema ke database
npx prisma generate  # generate Prisma client
npx tsx prisma/seed.ts  # isi data awal (109 guru + admin + approver)
npm run dev          # jalankan server
```

Buka browser: **http://localhost:3000**

---

## Konfigurasi Environment

**.env**
```
DATABASE_URL=postgresql://... (Neon)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

**.env.local**
```
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

---

## Struktur File Penting

```
konsumsi-app/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                          ← 109 guru + admin + approver
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── dashboard/page.tsx       ← greeting kontekstual, stat cards, filter, mobile card
│   │   │   ├── permintaan/
│   │   │   │   ├── baru/page.tsx        ← form item konsumsi, autocomplete pemohon
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx         ← detail + print (card tiles, colored badges)
│   │   │   │       └── edit/page.tsx    ← autocomplete pemohon
│   │   │   ├── persetujuan/page.tsx     ← header konsisten, item badges per-warna
│   │   │   └── users/page.tsx           ← kolom + form username
│   │   ├── api/
│   │   │   ├── permintaan/
│   │   │   └── users/                   ← validasi username
│   │   ├── login/page.tsx               ← field username
│   │   ├── globals.css                  ← design tokens + navy utility classes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Sidebar.tsx                  ← 2 logo MM2100 & 03
│   │   ├── StatusBadge.tsx
│   │   ├── Pagination.tsx
│   │   └── ConfirmModal.tsx
│   └── lib/
│       ├── prisma.ts
│       ├── auth.ts                      ← login pakai username
│       └── constants.ts                 ← JENIS_LABEL, JENIS_COLOR (shared)
├── tailwind.config.ts
├── public/
│   ├── logo-mm2100.png                  ← logo SMK MM2100
│   └── logo-03.png                      ← logo SMK 03
├── .env
└── .env.local
```

---

## Database Schema

```
User          → id, username, nama, role, password
Permintaan    → id, namaAcara, jurusan, tanggal, jamMulai, jamSelesai,
                ruangan, status, alasanTolak, catatan, pemohonId
ItemKonsumsi  → id, jenis, qty, keterangan, permintaanId
```

**Role:** `ADMIN` | `STAFF` | `APPROVER`

**Status:** `PENDING` → `DISETUJUI` / `DITOLAK` → `SELESAI`

**Jenis Item:** `SNACK_PAGI` | `SNACK_SORE` | `MAKAN_SIANG` | `KOPI` | `AIR_MINERAL` | `DLL`

**Jurusan:** `TKR` | `Elind` | `TSM` | `Akuntansi` | `Mesin` | `Hotel` | `TKI` | `Listrik`

---

## Yang Belum / Rencana

- ✅ **Notifikasi email** — sudah jalan via Nodemailer + Gmail (`alvinnozf@gmail.com` → `alvinozefanyaa@gmail.com`)
  - Nanti ganti ke email khusus SiPeKon kalau sudah dibuat
  - Approver bisa ditambah sampai 3 email (pisah koma di `APPROVER_EMAIL`)
- ⏳ **Notifikasi WhatsApp** ke Approver via Fonnte (alternatif jika mau WA)
- ⏳ **Push ke GitHub** — https://github.com/alvinnozf-ux/web-konsumsi
- ⏳ **Deploy ke Vercel** — supaya bisa diakses tanpa laptop nyala

---

*Terakhir diperbarui: 31 Agustus 2026*
