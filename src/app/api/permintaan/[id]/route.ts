import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendApprovalNotifToAdmins } from "@/lib/mailer";

const JURUSAN_LIST = ["TKR", "Elind", "TSM", "Akuntansi", "Mesin", "Hotel", "TKI", "Listrik"] as const;

const itemSchema = z.object({
  jenis:      z.enum(["SNACK_PAGI", "SNACK_SORE", "MAKAN_SIANG", "KOPI", "AIR_MINERAL", "DLL"]),
  qty:        z.number().int().min(1),
  keterangan: z.string().max(200).optional().nullable(),
});

const updateSchema = z.object({
  namaAcara:   z.string().min(3).max(200).optional(),
  jurusan:     z.enum(JURUSAN_LIST).optional(),
  tanggal:     z.string().optional(),
  jamMulai:    z.string().regex(/^\d{2}:\d{2}$/).optional(),
  jamSelesai:  z.string().regex(/^\d{2}:\d{2}$/).optional(),
  ruangan:     z.string().min(2).max(100).optional(),
  pemohonId:   z.string().optional(),
  catatan:     z.string().max(500).nullable().optional(),
  alasanTolak: z.string().max(500).nullable().optional(),
  items:       z.array(itemSchema).min(1).optional(),
  status:      z.enum(["PENDING", "DISETUJUI", "DITOLAK", "SELESAI"]).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const permintaan = await prisma.permintaan.findUnique({
    where: { id: params.id },
    include: {
      pemohon: { select: { id: true, nama: true } },
      items: true,
    },
  });

  if (!permintaan) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  return NextResponse.json(permintaan);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validasi gagal", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { items, tanggal, status, alasanTolak, ...rest } = result.data;

  // APPROVER hanya boleh ubah status + alasanTolak
  if (session.user.role === "APPROVER") {
    if (!status || Object.keys(rest).length > 0 || items) {
      return NextResponse.json({ error: "Approver hanya bisa mengubah status" }, { status: 403 });
    }
    if (status !== "DISETUJUI" && status !== "DITOLAK") {
      return NextResponse.json({ error: "Approver hanya bisa menyetujui atau menolak" }, { status: 403 });
    }
  }

  const updateData: Record<string, unknown> = { ...rest };
  if (status)  updateData.status = status;
  if (tanggal) updateData.tanggal = new Date(tanggal);

  if (status === "DITOLAK") {
    updateData.alasanTolak = alasanTolak ?? null;
  } else if (status === "DISETUJUI") {
    updateData.alasanTolak = null;
  } else if (alasanTolak !== undefined) {
    updateData.alasanTolak = alasanTolak;
  }

  if (items) {
    await prisma.itemKonsumsi.deleteMany({ where: { permintaanId: params.id } });
    updateData.items = { create: items };
  }

  const permintaan = await prisma.permintaan.update({
    where: { id: params.id },
    data: updateData,
    include: {
      pemohon: { select: { id: true, nama: true } },
      items: true,
    },
  });

  // Kirim notifikasi email ke semua admin & approver saat DISETUJUI
  if (status === "DISETUJUI") {
    sendApprovalNotifToAdmins({
      id: permintaan.id,
      namaAcara: permintaan.namaAcara,
      namaPemohon: permintaan.pemohon.nama,
      jurusan: permintaan.jurusan,
      tanggal: permintaan.tanggal.toISOString(),
      jamMulai: permintaan.jamMulai,
      jamSelesai: permintaan.jamSelesai,
      ruangan: permintaan.ruangan,
    }).catch((err) =>
      console.error("[mailer] Gagal kirim notif approval:", err)
    );
  }

  return NextResponse.json(permintaan);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.permintaan.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Permintaan berhasil dihapus" });
}
