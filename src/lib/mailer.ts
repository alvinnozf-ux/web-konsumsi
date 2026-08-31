import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Kirim notifikasi email ke Approver saat ada permintaan baru.
 * Gagal kirim tidak akan throw error — hanya di-log supaya tidak ganggu alur utama.
 */
export async function sendPermintaanNotif({
  namaAcara,
  namaPemohon,
  jurusan,
  tanggal,
  jamMulai,
  jamSelesai,
  ruangan,
}: {
  namaAcara: string;
  namaPemohon: string;
  jurusan: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
}) {
  const to = process.env.APPROVER_EMAIL;
  if (!to || !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  const tanggalFormatted = new Date(tanggal).toLocaleDateString("id-ID", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  try {
    await transporter.sendMail({
      from: `"SiPeKon 🍱" <${process.env.GMAIL_USER}>`,
      to,
      subject: `[SiPeKon] Permintaan Baru: ${namaAcara}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0f2035 0%, #162d4a 100%); padding: 24px 28px;">
            <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Sistem Permintaan Konsumsi</p>
            <h1 style="margin: 6px 0 0; color: white; font-size: 20px; font-weight: 700;">Ada Permintaan Baru</h1>
          </div>

          <!-- Body -->
          <div style="padding: 24px 28px; background: white;">
            <p style="margin: 0 0 20px; color: #64748b; font-size: 14px;">
              Permintaan konsumsi baru masuk dan menunggu persetujuan kamu.
            </p>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #94a3b8; width: 40%; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Nama Acara</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 700;">${namaAcara}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #94a3b8; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Pemohon</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${namaPemohon}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #94a3b8; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Jurusan</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${jurusan}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #94a3b8; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Tanggal</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${tanggalFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #94a3b8; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Waktu</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${jamMulai} – ${jamSelesai} WIB</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #94a3b8; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Ruangan</td>
                <td style="padding: 10px 0; color: #0f172a;">${ruangan}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 14px 18px; background: #fef3c7; border-radius: 10px; border: 1px solid #fde68a;">
              <p style="margin: 0; color: #92400e; font-size: 13px;">
                ⏳ Buka aplikasi SiPeKon untuk menyetujui atau menolak permintaan ini.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 16px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #94a3b8; font-size: 11px; text-align: center;">
              Email ini dikirim otomatis oleh SiPeKon · SMK Mitra Industri MM2100 &amp; 03
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    // Tidak throw — gagal email tidak boleh ganggu simpan permintaan
    console.error("[mailer] Gagal kirim email notifikasi:", err);
  }
}
