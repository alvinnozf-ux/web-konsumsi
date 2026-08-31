import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 109 guru unik dari PDF "Data Guru Per Divisi 26 Agustus 2026"
// username = 2 kata pertama nama, lowercase, spasi → titik
// password = username
const GURU: { nama: string; username: string }[] = [
  { nama: "Abdul Munir",                      username: "abdul.munir" },
  { nama: "Nuryana Fitriyani",                username: "nuryana.fitriyani" },
  { nama: "Hidayat Atori",                    username: "hidayat.atori" },
  { nama: "Elis Rika Sugiarti",               username: "elis.rika" },
  { nama: "Tini Nurmala",                     username: "tini.nurmala" },
  { nama: "Putri Purwaningsih",               username: "putri.purwaningsih" },
  { nama: "Aprilia Rahayu Wilujeng",          username: "aprilia.rahayu" },
  { nama: "Adhista Cindy Rahmayani",          username: "adhista.cindy" },
  { nama: "Prasasti Puspasari",               username: "prasasti.puspasari" },
  { nama: "Maristya Catur Dwi Pratiwi",       username: "maristya.catur" },
  { nama: "Puspita Sari",                     username: "puspita.sari" },
  { nama: "Diva Alysha Oktaviany",            username: "diva.alysha" },
  { nama: "Viany Lingga Revi",                username: "viany.lingga" },
  { nama: "Dodi Perdana Putra",               username: "dodi.perdana" },
  { nama: "Diah Maulias Dewi Putri",          username: "diah.maulias" },
  { nama: "Abdillah Putra Nusa",              username: "abdillah.putra" },
  { nama: "Anisha Septiana",                  username: "anisha.septiana" },
  { nama: "Adynda Ray Razika",                username: "adynda.ray" },
  { nama: "Azzam Izzuddin Ramadhan",          username: "azzam.izzuddin" },
  { nama: "Dede Rukmayanti",                  username: "dede.rukmayanti" },
  { nama: "Danu Purwanto",                    username: "danu.purwanto" },
  { nama: "Maulana Evendi",                   username: "maulana.evendi" },
  { nama: "Ayu Warestu",                      username: "ayu.warestu" },
  { nama: "Dwi Fajar Meidiatno",              username: "dwi.fajar" },
  { nama: "Devin Eldwin",                     username: "devin.eldwin" },
  { nama: "Okxy Ixganda",                     username: "okxy.ixganda" },
  { nama: "Muhamad Yudi D. C",               username: "muhamad.yudi" },
  { nama: "Alifiyah Az-Zahra",               username: "alifiyah.azzahra" },
  { nama: "Feri Hapsara",                     username: "feri.hapsara" },
  { nama: "Berti Effira Fatahan",             username: "berti.effira" },
  { nama: "Ambar Tri Laksono",               username: "ambar.tri" },
  { nama: "Haya Suhaela",                     username: "haya.suhaela" },
  { nama: "Tri Lestari",                      username: "tri.lestari" },
  { nama: "Moh. Aldy Akbar Supriyadi",       username: "aldy.akbar" },
  { nama: "Joice Engie Wella Sianipar",       username: "joice.engie" },
  { nama: "Ryo Maytana",                      username: "ryo.maytana" },
  { nama: "Amalia Dewi Lestari",              username: "amalia.dewi" },
  { nama: "Heas Priyo Wicaksono",             username: "heas.priyo" },
  { nama: "Tiara Kusuma Dewi",               username: "tiara.kusuma" },
  { nama: "Fuji Sampan Sudjana",             username: "fuji.sampan" },
  { nama: "Nida Apriliatul Hasanah",         username: "nida.apriliatul" },
  { nama: "Heri Suprianto",                  username: "heri.suprianto" },
  { nama: "Aula Al Layali",                  username: "aula.allayali" },
  { nama: "Ahmad Nasrul Sidik",              username: "ahmad.nasrul" },
  { nama: "Tidtaya Puteri Larasanty",        username: "tidtaya.puteri" },
  { nama: "Fadli Maulana",                   username: "fadli.maulana" },
  { nama: "Ressa Hadi Purwoko",              username: "ressa.hadi" },
  { nama: "Astri Afmi Wulandari",            username: "astri.afmi" },
  { nama: "Esa Apriyadi",                    username: "esa.apriyadi" },
  { nama: "Septiawan Filtra Santosa",        username: "septiawan.filtra" },
  { nama: "M. Hafidz Ghufron",               username: "hafidz.ghufron" },
  { nama: "Munandar",                        username: "munandar" },
  { nama: "Heru Triatmo",                    username: "heru.triatmo" },
  { nama: "Fadly Narendra Uttomo",           username: "fadly.narendra" },
  { nama: "Dikky Apri Setia Nugraha",        username: "dikky.apri" },
  { nama: "Azhari Budirianto",               username: "azhari.budirianto" },
  { nama: "Maharani Benedicta Azarine Piljai", username: "maharani.benedicta" },
  { nama: "Kiki Widhia Swara",               username: "kiki.widhia" },
  { nama: "Nanda Diansyah Dwi",             username: "nanda.diansyah" },
  { nama: "Ahmad Suhaimi",                   username: "ahmad.suhaimi" },
  { nama: "Gesti Khoirunnisa",               username: "gesti.khoirunnisa" },
  { nama: "Retno Dwi Astuti",                username: "retno.dwi" },
  { nama: "Refty Royan J",                   username: "refty.royan" },
  { nama: "Syaifulloh",                      username: "syaifulloh" },
  { nama: "Intan Chaya Nintyas",             username: "intan.chaya" },
  { nama: "Nurmayanti",                      username: "nurmayanti" },
  { nama: "Nia Desnata Hati",                username: "nia.desnata" },
  { nama: "Muhamad Iqbal",                   username: "muhamad.iqbal" },
  { nama: "Tri Sulistyaningsih",             username: "tri.sulistyaningsih" },
  { nama: "Serli Aprodita",                  username: "serli.aprodita" },
  { nama: "Putri Nur Azizah",               username: "putri.nur" },
  { nama: "Novita Hani R",                   username: "novita.hani" },
  { nama: "Rahmat Hidayat",                  username: "rahmat.hidayat" },
  { nama: "Yanda Eko Putra",                 username: "yanda.eko" },
  { nama: "Raihan Hakim",                    username: "raihan.hakim" },
  { nama: "Mochammad Deden Nuriyana",        username: "mochammad.deden" },
  { nama: "Pandu Andariansyah",              username: "pandu.andariansyah" },
  { nama: "Eldha Luvy Zha",                  username: "eldha.luvy" },
  { nama: "Yuda Putra Utama",               username: "yuda.putra" },
  { nama: "Trisno Ngestuti",                 username: "trisno.ngestuti" },
  { nama: "Muhamad Hafidz Firdaus P",        username: "muhamad.hafidz" },
  { nama: "Ditta Octaviani",                 username: "ditta.octaviani" },
  { nama: "Enggar Fata",                     username: "enggar.fata" },
  { nama: "Bagus Indra Permana",             username: "bagus.indra" },
  { nama: "Abdul Haris Safa'adi",            username: "abdul.haris" },
  { nama: "Cecep Bermana Sakti Gumilar",     username: "cecep.bermana" },
  { nama: "Iwan Sutiawan",                   username: "iwan.sutiawan" },
  { nama: "Umarrudin",                       username: "umarrudin" },
  { nama: "Purnomo",                         username: "purnomo" },
  { nama: "Noval Al Mahdy",                  username: "noval.almahdy" },
  { nama: "Arya Yudha Satriatama",           username: "arya.yudha" },
  { nama: "Anggi Apriansyah",               username: "anggi.apriansyah" },
  { nama: "Isroni",                          username: "isroni" },
  { nama: "Sultan Saladdin",                 username: "sultan.saladdin" },
  { nama: "Muhammad Al Ihsan",              username: "muhammad.alihsan" },
  { nama: "Ah Dafiq Najiyullah",             username: "dafiq.najiyullah" },
  { nama: "Istiqomah",                       username: "istiqomah" },
  { nama: "Dwi Nugroho",                     username: "dwi.nugroho" },
  { nama: "Muhammad Teguh Supriyatin",       username: "muhammad.teguh" },
  { nama: "Sukma Dwiaugita Rahardjo",        username: "sukma.dwiaugita" },
  { nama: "Joko Setyo Nugroho",              username: "joko.setyo" },
  { nama: "Diana Cholida",                   username: "diana.cholida" },
  { nama: "Ridwan",                          username: "ridwan" },
  { nama: "Hanifah Novianty",               username: "hanifah.novianty" },
  { nama: "Salsa Fathia Azhar",              username: "salsa.fathia" },
  { nama: "Syafrudin",                       username: "syafrudin" },
  { nama: "Fernanda Retna Ningtyas",         username: "fernanda.retna" },
  { nama: "Sonza Rahmanirwana Fushshilat",   username: "sonza.rahmanirwana" },
  { nama: "Rany Haerunnysa",                username: "rany.haerunnysa" },
];

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.itemKonsumsi.deleteMany();
  await prisma.permintaan.deleteMany();
  await prisma.user.deleteMany();

  // ── Admin & Approver ──────────────────────────────────────────────────────
  const adminPassword    = await bcrypt.hash("admin123", 10);
  const approverPassword = await bcrypt.hash("approver123", 10);

  const admin = await prisma.user.create({
    data: { username: "admin",    nama: "Ahmad Fauzi",   role: "ADMIN",    password: adminPassword },
  });

  await prisma.user.create({
    data: { username: "approver", nama: "Rina Apriyanti", role: "APPROVER", password: approverPassword },
  });

  // ── 109 Guru (STAFF) ─────────────────────────────────────────────────────
  console.log(`📚 Memasukkan ${GURU.length} guru...`);

  const staffUsers = await Promise.all(
    GURU.map(async ({ nama, username }) => {
      const hashed = await bcrypt.hash(username, 10);
      return prisma.user.create({
        data: { username, nama, role: "STAFF", password: hashed },
      });
    })
  );

  const staff1 = staffUsers[0]; // Abdul Munir
  const staff2 = staffUsers[1]; // Nuryana Fitriyani
  const staff3 = staffUsers[2]; // Hidayat Atori

  // ── Contoh Permintaan ─────────────────────────────────────────────────────
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
  console.log("   Admin    → username: admin     | password: admin123");
  console.log("   Approver → username: approver  | password: approver123");
  console.log(`   Staff    → ${GURU.length} guru, username = nama (contoh: abdul.munir), password = username`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
