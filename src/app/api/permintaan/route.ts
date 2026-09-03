import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendPermintaanNotif } from "@/lib/mailer";

export const runtime = "nodejs";

const JURUSAN_LIST = ["TKR", "Elind", "TSM", "Akuntansi", "Mesin", "Hotel", "TKI", "Listrik"] as const;

const itemSchema = z.object({
  jenis: z.enum(["SNACK_PAGI", "SNACK_SORE", "MAKAN_SIANG", "KOPI", "AIR_MINERAL", "DLL"]),
  qty: z.number().int().min(1),
  keterangan: z.string().max(200).optional().nullable(),
});

const createPermintaanSchema = z.object({
  namaAcara:  z.string().min(3, "Nama acara minimal 3 karakter").max(200),
  jurusan:    z.enum(JURUSAN_LIST, { errorMap: () => ({ message: "Jurusan tidak valid" }) }),
  kampus:     z.enum(["MM2100", "03"]).default("MM2100"),
  tanggal:    z.string(),
  jamMulai:   z.string().regex(/^\d{2}:\d{2}$/, "Format jam HH:MM"),
  jamSelesai: z.string().regex(/^\d{2}:\d{2}$/, "Format jam HH:MM"),
  ruangan:    z.string().min(2, "Ruangan wajib diisi").max(100),
  pemohonId:  z.string().min(1, "Pemohon wajib dipilih"),
  catatan:    z.string().max(500).optional().nullable(),
  items:      z.array(itemSchema).min(1, "Pilih minimal 1 item konsumsi"),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page          = Number(searchParams.get("page") ?? 1);
  const limit         = Number(searchParams.get("limit") ?? 10);
  const status        = searchParams.get("status") ?? "";
  const pemohonId     = searchParams.get("pemohonId") ?? "";
  const tanggalDari   = searchParams.get("tanggalDari") ?? "";
  const tanggalSampai = searchParams.get("tanggalSampai") ?? "";
  const search        = searchParams.get("search") ?? "";

  const where: Record<string, unknown> = {};
  if (status)    where.status = status;
  if (pemohonId) where.pemohonId = pemohonId;
  if (search)    where.namaAcara = { contains: search };
  if (tanggalDari || tanggalSampai) {
    where.tanggal = {
      ...(tanggalDari    ? { gte: new Date(tanggalDari) } : {}),
      ...(tanggalSampai  ? { lte: new Date(tanggalSampai + "T23:59:59") } : {}),
    };
  }

  const [total, data] = await Promise.all([
    prisma.permintaan.count({ where }),
    prisma.permintaan.findMany({
      where,
      include: {
        pemohon: { select: { id: true, nama: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const result = createPermintaanSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validasi gagal", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { namaAcara, jurusan, kampus, tanggal, jamMulai, jamSelesai, ruangan, pemohonId, catatan, items } = result.data;

  const permintaan = await prisma.permintaan.create({
    data: {
      namaAcara,
      jurusan,
      kampus,
      tanggal: new Date(tanggal),
      jamMulai,
      jamSelesai,
      ruangan,
      pemohonId,
      catatan: catatan ?? null,
      items: { create: items },
    },
    include: {
      pemohon: { select: { id: true, nama: true } },
      items: true,
    },
  });

  // Kirim notif email ke admin per kampus (fire-and-forget)
  sendPermintaanNotif({
    id: permintaan.id,
    namaAcara,
    namaPemohon: permintaan.pemohon.nama,
    jurusan,
    kampus,
    tanggal,
    jamMulai,
    jamSelesai,
    ruangan,
  });

  return NextResponse.json(permintaan, { status: 201 });
}
