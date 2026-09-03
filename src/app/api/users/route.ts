import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(50)
    .regex(/^[a-z0-9_.]+$/, "Hanya huruf kecil, angka, titik, underscore"),
  nama:     z.string().min(2, "Nama minimal 2 karakter").max(100),
  role:     z.enum(["ADMIN", "STAFF", "APPROVER"]),
  password: z.string().min(6, "Password minimal 6 karakter"),
  email:    z.string().email("Format email tidak valid").optional().or(z.literal("")),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      nama: true,
      role: true,
      email: true,
      createdAt: true,
      _count: { select: { permintaan: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body   = await req.json();
  const result = createUserSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validasi gagal", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { username, nama, role, password, email } = result.data;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Username sudah digunakan" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, nama, role, password: hashedPassword, email: email || null },
    select: { id: true, username: true, nama: true, role: true, email: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
