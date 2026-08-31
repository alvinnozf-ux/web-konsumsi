import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

export async function GET() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to   = process.env.APPROVER_EMAIL;

  // Cek env vars ada atau tidak
  if (!user || !pass || !to) {
    return NextResponse.json({
      ok: false,
      error: "Env vars missing",
      debug: {
        GMAIL_USER: user ? "✓ ada" : "✗ tidak ada",
        GMAIL_APP_PASSWORD: pass ? "✓ ada" : "✗ tidak ada",
        APPROVER_EMAIL: to ? "✓ ada" : "✗ tidak ada",
      },
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  try {
    const info = await transporter.sendMail({
      from: `"SiPeKon Test" <${user}>`,
      to,
      subject: "[SiPeKon] Test Email dari Vercel",
      text: "Email ini untuk verifikasi bahwa notifikasi email berjalan di Vercel.",
    });

    return NextResponse.json({
      ok: true,
      messageId: info.messageId,
      accepted: info.accepted,
    });
  } catch (err: unknown) {
    const error = err as Error & { code?: string; response?: string };
    return NextResponse.json({
      ok: false,
      error: error.message,
      code: error.code,
      response: error.response,
    });
  }
}
