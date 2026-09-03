import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const APP_URL = process.env.NEXTAUTH_URL || "https://konsumsi-app.vercel.app";

function formatTanggal(tanggal: string) {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function emailWrapper(headerBg: string, headerTitle: string, headerSubtitle: string, body: string) {
  return `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: ${headerBg}; padding: 24px 28px;">
        <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Sistem Permintaan Konsumsi</p>
        <h1 style="margin: 6px 0 0; color: white; font-size: 20px; font-weight: 700;">${headerTitle}</h1>
        ${headerSubtitle ? `<p style="margin: 6px 0 0; color: rgba(255,255,255,0.6); font-size: 13px;">${headerSubtitle}</p>` : ""}
      </div>
      <div style="padding: 24px 28px; background: white;">
        ${body}
      </div>
      <div style="padding: 16px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 11px; text-align: center;">
          Email ini dikirim otomatis oleh SiPeKon · SMK Mitra Industri MM2100 &amp; 03
        </p>
      </div>
    </div>
  `;
}

function detailTable(rows: { label: string; value: string }[]) {
  return `
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      ${rows.map((r, i) => `
        <tr>
          <td style="padding: 10px 0; ${i < rows.length - 1 ? "border-bottom: 1px solid #f1f5f9;" : ""} color: #94a3b8; width: 40%; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">${r.label}</td>
          <td style="padding: 10px 0; ${i < rows.length - 1 ? "border-bottom: 1px solid #f1f5f9;" : ""} color: #0f172a; font-weight: ${i === 0 ? "700" : "400"};">${r.value}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

/**
 * Penerima notif saat permintaan baru masuk (PENDING), dibagi per kampus.
 */
const PENDING_NOTIF_EMAILS: Record<string, string[]> = {
  MM2100: ["alvinozefanyaa@gmail.com"],
  "03":   ["alvinozefanyaa@gmail.com"],
};

/**
 * Kirim notifikasi email saat ada permintaan baru masuk (+ link langsung ke halaman persetujuan).
 * Hanya dikirim ke admin kampus yang sesuai.
 */
export async function sendPermintaanNotif({
  id,
  namaAcara,
  namaPemohon,
  jurusan,
  kampus,
  tanggal,
  jamMulai,
  jamSelesai,
  ruangan,
}: {
  id: string;
  namaAcara: string;
  namaPemohon: string;
  jurusan: string;
  kampus: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;
  const recipients = PENDING_NOTIF_EMAILS[kampus] ?? PENDING_NOTIF_EMAILS["MM2100"];
  const to = recipients.join(", ");

  const linkPersetujuan = `${APP_URL}/persetujuan`;

  const body = `
    <p style="margin: 0 0 20px; color: #64748b; font-size: 14px;">
      Permintaan konsumsi baru masuk dan menunggu persetujuan kamu.
    </p>
    ${detailTable([
      { label: "Nama Acara", value: namaAcara },
      { label: "Pemohon", value: namaPemohon },
      { label: "Jurusan", value: jurusan },
      { label: "Kampus", value: `SMK Mitra Industri ${kampus}` },
      { label: "Tanggal", value: formatTanggal(tanggal) },
      { label: "Waktu", value: `${jamMulai} – ${jamSelesai} WIB` },
      { label: "Ruangan", value: ruangan },
    ])}
    <div style="margin-top: 24px;">
      <a href="${linkPersetujuan}"
        style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #1e3a5f 0%, #0f2035 100%); color: white; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px;">
        Buka Halaman Persetujuan →
      </a>
    </div>
    <p style="margin: 16px 0 0; color: #94a3b8; font-size: 12px;">
      Atau buka langsung: <a href="${linkPersetujuan}" style="color: #3b82f6;">${linkPersetujuan}</a>
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"SiPeKon 🍱" <${process.env.GMAIL_USER}>`,
      to,
      subject: `[SiPeKon] Permintaan Baru: ${namaAcara}`,
      html: emailWrapper(
        "linear-gradient(135deg, #0f2035 0%, #162d4a 100%)",
        "Ada Permintaan Baru",
        "",
        body
      ),
    });
  } catch (err) {
    console.error("[mailer] Gagal kirim notif ke approver:", err);
  }
}

/**
 * Penerima notif saat permintaan DISETUJUI, dibagi per kampus.
 */
const APPROVAL_NOTIF_EMAILS: Record<string, string[]> = {
  MM2100: ["bwrkiro@gmail.com"],
  "03":   ["bwrkiro@gmail.com"],
};

/**
 * Kirim notifikasi ke admin kampus yang sesuai saat permintaan DISETUJUI.
 */
export async function sendApprovalNotifToAdmins({
  id,
  namaAcara,
  namaPemohon,
  jurusan,
  kampus,
  tanggal,
  jamMulai,
  jamSelesai,
  ruangan,
}: {
  id: string;
  namaAcara: string;
  namaPemohon: string;
  jurusan: string;
  kampus: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;
  const recipients = APPROVAL_NOTIF_EMAILS[kampus] ?? APPROVAL_NOTIF_EMAILS["MM2100"];

  const linkDetail = `${APP_URL}/permintaan/${id}`;

  const body = `
    <p style="margin: 0 0 16px; color: #64748b; font-size: 14px;">
      Permintaan konsumsi berikut telah <strong>disetujui</strong>.
    </p>
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; font-size: 12px; font-weight: 700; border-radius: 20px; text-transform: uppercase;">✓ Disetujui</span>
    </div>
    ${detailTable([
      { label: "Nama Acara", value: namaAcara },
      { label: "Pemohon",    value: namaPemohon },
      { label: "Jurusan",    value: jurusan },
      { label: "Kampus",     value: `SMK Mitra Industri ${kampus}` },
      { label: "Tanggal",    value: formatTanggal(tanggal) },
      { label: "Waktu",      value: `${jamMulai} – ${jamSelesai} WIB` },
      { label: "Ruangan",    value: ruangan },
    ])}
    <div style="margin-top: 20px; padding: 14px 18px; background: #f0fdf4; border-radius: 10px; border: 1px solid #bbf7d0;">
      <p style="margin: 0; color: #166534; font-size: 13px;">🎉 Permintaan konsumsi ini sudah disetujui dan siap untuk diproses.</p>
    </div>
    <div style="margin-top: 24px;">
      <a href="${linkDetail}"
        style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: white; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px;">
        Lihat Detail Permintaan →
      </a>
    </div>
    <p style="margin: 16px 0 0; color: #94a3b8; font-size: 12px;">
      Atau buka: <a href="${linkDetail}" style="color: #3b82f6;">${linkDetail}</a>
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"SiPeKon 🍱" <${process.env.GMAIL_USER}>`,
      to: recipients.join(", "),
      subject: `[SiPeKon] Permintaan Disetujui: ${namaAcara}`,
      html: emailWrapper(
        "linear-gradient(135deg, #065f46 0%, #047857 100%)",
        "Permintaan Disetujui ✓",
        "Kabar baik — konsumsi sudah di-approve!",
        body
      ),
    });
  } catch (err) {
    console.error("[mailer] Gagal kirim notif approval ke admin:", err);
  }
}

/**
 * Kirim notifikasi ke Pemohon saat permintaan disetujui atau ditolak.
 */
export async function sendHasilNotif({
  emailPemohon,
  namaPemohon,
  namaAcara,
  status,
  alasanTolak,
  permintaanId,
  tanggal,
  jamMulai,
  jamSelesai,
  ruangan,
}: {
  emailPemohon: string;
  namaPemohon: string;
  namaAcara: string;
  status: "DISETUJUI" | "DITOLAK";
  alasanTolak?: string | null;
  permintaanId: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  const isSetujui = status === "DISETUJUI";
  const linkDetail = `${APP_URL}/permintaan/${permintaanId}`;

  const statusBadge = isSetujui
    ? `<span style="display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; font-size: 12px; font-weight: 700; border-radius: 20px; text-transform: uppercase;">✓ Disetujui</span>`
    : `<span style="display: inline-block; padding: 4px 12px; background: #fee2e2; color: #991b1b; font-size: 12px; font-weight: 700; border-radius: 20px; text-transform: uppercase;">✗ Ditolak</span>`;

  const body = `
    <p style="margin: 0 0 16px; color: #64748b; font-size: 14px;">
      Halo <strong>${namaPemohon}</strong>, permintaan konsumsi kamu telah diproses.
    </p>
    <div style="margin-bottom: 20px;">${statusBadge}</div>
    ${detailTable([
      { label: "Nama Acara", value: namaAcara },
      { label: "Tanggal", value: formatTanggal(tanggal) },
      { label: "Waktu", value: `${jamMulai} – ${jamSelesai} WIB` },
      { label: "Ruangan", value: ruangan },
    ])}
    ${!isSetujui && alasanTolak ? `
      <div style="margin-top: 20px; padding: 14px 18px; background: #fef2f2; border-radius: 10px; border: 1px solid #fecaca;">
        <p style="margin: 0 0 4px; color: #991b1b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Alasan Penolakan</p>
        <p style="margin: 0; color: #7f1d1d; font-size: 14px;">${alasanTolak}</p>
      </div>
    ` : ""}
    ${isSetujui ? `
      <div style="margin-top: 20px; padding: 14px 18px; background: #f0fdf4; border-radius: 10px; border: 1px solid #bbf7d0;">
        <p style="margin: 0; color: #166534; font-size: 13px;">🎉 Permintaan kamu telah disetujui. Silakan koordinasi lebih lanjut dengan pihak terkait.</p>
      </div>
    ` : ""}
    <div style="margin-top: 24px;">
      <a href="${linkDetail}"
        style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #1e3a5f 0%, #0f2035 100%); color: white; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px;">
        Lihat Detail Permintaan →
      </a>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"SiPeKon 🍱" <${process.env.GMAIL_USER}>`,
      to: emailPemohon,
      subject: `[SiPeKon] Permintaan ${isSetujui ? "Disetujui" : "Ditolak"}: ${namaAcara}`,
      html: emailWrapper(
        isSetujui
          ? "linear-gradient(135deg, #065f46 0%, #047857 100%)"
          : "linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)",
        isSetujui ? "Permintaan Disetujui ✓" : "Permintaan Ditolak",
        isSetujui ? "Kabar baik untuk kamu!" : "Permintaan kamu tidak dapat diproses",
        body
      ),
    });
  } catch (err) {
    console.error("[mailer] Gagal kirim notif hasil ke pemohon:", err);
  }
}
