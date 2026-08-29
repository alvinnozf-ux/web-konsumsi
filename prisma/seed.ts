import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.itemKonsumsi.deleteMany();
  await prisma.permintaan.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword    = await bcrypt.hash("admin123", 10);
  const approverPassword = await bcrypt.hash("approver123", 10);
  const staffPassword    = await bcrypt.hash("staff123", 10);

  const admin = await prisma.user.create({
    data: { nama: "Ahmad Fauzi", role: "ADMIN", password: adminPassword },
  });

  await prisma.user.create({
    data: { nama: "Rina Apriyanti", role: "APPROVER", password: approverPassword },
  });

  const staff1 = await prisma.user.create({
    data: { nama: "Siti Rahayu", role: "STAFF", password: staffPassword },
  });

  const staff2 = await prisma.user.create({
    data: { nama: "Budi Santoso", role: "STAFF", password: staffPassword },
  });

  const staff3 = await prisma.user.create({
    data: { nama: "Dewi Lestari", role: "STAFF", password: staffPassword },
  });

  await prisma.permintaan.create({
    data: {
      namaAcara: "Rapat Koordinasi Bulanan",
      jurusan: "TKR",
      tanggal: new Date("2026-09-05"),
      jamMulai: "09:00",
      jamSelesai: "11:00",
      ruangan: "Aula Utama",
      status: "DISETUJUI",
      catatan: "Mohon disiapkan lebih awal 30 menit",
      pemohonId: staff1.id,
      items: {
        create: [
          { jenis: "SNACK_PAGI",  qty: 20 },
          { jenis: "MAKAN_SIANG", qty: 20 },
          { jenis: "KOPI",        qty: 15 },
          { jenis: "AIR_MINERAL", qty: 20 },
        ],
      },
    },
  });

  await prisma.permintaan.create({
    data: {
      namaAcara: "Workshop Peningkatan SDM",
      jurusan: "Elind",
      tanggal: new Date("2026-09-10"),
      jamMulai: "08:00",
      jamSelesai: "16:00",
      ruangan: "Ruang Workshop Lt.2",
      status: "PENDING",
      pemohonId: staff2.id,
      items: {
        create: [
          { jenis: "SNACK_PAGI",  qty: 30 },
          { jenis: "SNACK_SORE",  qty: 30 },
          { jenis: "MAKAN_SIANG", qty: 30 },
          { jenis: "KOPI",        qty: 25 },
          { jenis: "AIR_MINERAL", qty: 30 },
        ],
      },
    },
  });

  await prisma.permintaan.create({
    data: {
      namaAcara: "Presentasi Laporan Keuangan Q3",
      jurusan: "Akuntansi",
      tanggal: new Date("2026-08-28"),
      jamMulai: "13:00",
      jamSelesai: "15:00",
      ruangan: "Ruang Rapat Kecil",
      status: "SELESAI",
      catatan: "Tambahkan minuman teh jika ada",
      pemohonId: staff3.id,
      items: {
        create: [
          { jenis: "SNACK_SORE",  qty: 10 },
          { jenis: "KOPI",        qty: 8  },
          { jenis: "AIR_MINERAL", qty: 10 },
        ],
      },
    },
  });

  await prisma.permintaan.create({
    data: {
      namaAcara: "Rapat Evaluasi Tahunan",
      jurusan: "Mesin",
      tanggal: new Date("2026-09-20"),
      jamMulai: "10:00",
      jamSelesai: "12:00",
      ruangan: "Aula Utama",
      status: "PENDING",
      pemohonId: admin.id,
      items: {
        create: [
          { jenis: "SNACK_PAGI",  qty: 15 },
          { jenis: "MAKAN_SIANG", qty: 15 },
          { jenis: "AIR_MINERAL", qty: 15 },
        ],
      },
    },
  });

  await prisma.permintaan.create({
    data: {
      namaAcara: "Sosialisasi Peraturan Baru",
      jurusan: "Hotel",
      tanggal: new Date("2026-09-15"),
      jamMulai: "14:00",
      jamSelesai: "16:00",
      ruangan: "Ruang Kelas XII TKJ",
      status: "DITOLAK",
      alasanTolak: "Stok konsumsi sedang kosong, harap ajukan ulang minggu depan",
      pemohonId: staff1.id,
      items: {
        create: [
          { jenis: "SNACK_SORE",  qty: 25 },
          { jenis: "AIR_MINERAL", qty: 25 },
          { jenis: "DLL", qty: 1, keterangan: "Tisu meja" },
        ],
      },
    },
  });

  console.log("✅ Seed selesai!");
  console.log("");
  console.log("📋 Akun login:");
  console.log("   Admin    → nama: Ahmad Fauzi     | password: admin123");
  console.log("   Approver → nama: Rina Apriyanti  | password: approver123");
  console.log("   Staff    → nama: Siti Rahayu     | password: staff123");
  console.log("   Staff    → nama: Budi Santoso    | password: staff123");
  console.log("   Staff    → nama: Dewi Lestari    | password: staff123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
