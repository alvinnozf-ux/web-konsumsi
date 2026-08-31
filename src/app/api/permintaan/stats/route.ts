import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/permintaan/stats
 * Return semua stats sekaligus dalam 1 request (groupBy status).
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const grouped = await prisma.permintaan.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const map: Record<string, number> = {};
  let total = 0;
  for (const row of grouped) {
    map[row.status] = row._count._all;
    total += row._count._all;
  }

  return NextResponse.json({
    total,
    pending:   map["PENDING"]   ?? 0,
    disetujui: map["DISETUJUI"] ?? 0,
    ditolak:   map["DITOLAK"]   ?? 0,
    selesai:   map["SELESAI"]   ?? 0,
  });
}
