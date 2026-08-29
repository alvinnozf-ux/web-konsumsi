"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil, Printer, Trash2, Loader2, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmModal } from "@/components/ConfirmModal";

const JENIS_LABEL: Record<string, string> = {
  SNACK_PAGI:  "Snack Pagi",
  SNACK_SORE:  "Snack Sore",
  MAKAN_SIANG: "Makan Siang",
  KOPI:        "Kopi",
  AIR_MINERAL: "Air Mineral",
  DLL:         "Dll",
};

const STATUS_NEXT: Record<string, { value: string; label: string }> = {
  DISETUJUI: { value: "SELESAI", label: "Tandai Selesai" },
};

type Permintaan = {
  id: string;
  namaAcara: string;
  jurusan: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
  status: string;
  alasanTolak: string | null;
  catatan: string | null;
  createdAt: string;
  pemohon: { id: string; nama: string };
  items: { id: string; jenis: string; qty: number; keterangan?: string }[];
};

export default function DetailPermintaanPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [data,         setData]         = useState<Permintaan | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [deleteOpen,   setDeleteOpen]   = useState(false);
  const [deleteLoading,setDeleteLoading]= useState(false);
  const [statusOpen,   setStatusOpen]   = useState(false);
  const [statusLoading,setStatusLoading]= useState(false);

  useEffect(() => {
    fetch(`/api/permintaan/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => toast.error("Permintaan tidak ditemukan"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/permintaan/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success("Permintaan berhasil dihapus");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleStatusChange() {
    if (!data) return;
    const next = STATUS_NEXT[data.status];
    if (!next) return;
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/permintaan/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next.value }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setData(updated);
      toast.success("Status berhasil diubah");
    } catch {
      toast.error("Gagal mengubah status");
    } finally {
      setStatusLoading(false);
      setStatusOpen(false);
    }
  }

  const formatTanggal = (str: string) =>
    new Date(str).toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  const formatCreatedAt = (str: string) =>
    new Date(str).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-600" size={28} />
    </div>
  );

  if (!data) return (
    <div className="p-6 text-center">
      <p className="text-gray-500">Permintaan tidak ditemukan.</p>
      <Link href="/dashboard" className="btn-primary mt-4 inline-flex">Kembali ke Dashboard</Link>
    </div>
  );

  const nextStatus = STATUS_NEXT[data.status];

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-wrapper {
            padding: 1.5cm;
          }
        }
      `}</style>

      {/* Print Header — hanya muncul saat print */}
      <div className="hidden print:block text-center mb-6 pb-4 border-b-2 border-gray-800">
        <div className="flex items-center justify-center gap-3 mb-1">
          <img src="/logo.jpg" alt="Logo" className="w-12 h-12 rounded-full object-cover" />
          <div className="text-left">
            <p className="font-bold text-lg leading-tight text-gray-900">SMK Mitra Industri</p>
            <p className="text-sm text-gray-600">MM2100 &amp; 03</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Sistem Permintaan Konsumsi</p>
      </div>

      <div className="print-wrapper p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 no-print">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn-secondary p-2"><ArrowLeft size={16} /></Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Detail Permintaan</h1>
              <p className="text-sm text-gray-500">ID: {data.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
          <button onClick={() => {
              const prev = document.title;
              document.title = " ";
              window.print();
              document.title = prev;
            }} className="btn-secondary">
              <Printer size={15} />Cetak
            </button>
            {data.status === "PENDING" && (
              <Link href={`/permintaan/${id}/edit`} className="btn-secondary">
                <Pencil size={15} />Edit
              </Link>
            )}
            {isAdmin && nextStatus && (
              <button onClick={() => setStatusOpen(true)} className="btn-primary">
                <RefreshCw size={15} />{nextStatus.label}
              </button>
            )}
            {isAdmin && (
              <button onClick={() => setDeleteOpen(true)} className="btn-danger">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="card p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <StatusBadge status={data.status} />
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Dibuat pada</p>
              <p className="text-sm text-gray-700">{formatCreatedAt(data.createdAt)}</p>
            </div>
          </div>

          {/* Alasan Tolak */}
          {data.status === "DITOLAK" && data.alasanTolak && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Alasan Penolakan</p>
              <p className="text-sm text-red-800">{data.alasanTolak}</p>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Nama Acara</p>
              <p className="text-gray-900 font-semibold">{data.namaAcara}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Pemohon</p>
              <p className="text-gray-900 font-semibold">{data.pemohon.nama}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Jurusan</p>
              <p className="text-gray-900">{data.jurusan}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Tanggal</p>
              <p className="text-gray-900">{formatTanggal(data.tanggal)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Waktu</p>
              <p className="text-gray-900">{data.jamMulai} – {data.jamSelesai} WIB</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Ruangan</p>
              <p className="text-gray-900">{data.ruangan}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Item Konsumsi</p>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Item</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Keterangan</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm text-gray-800">{JENIS_LABEL[item.jenis]}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{item.keterangan ?? "—"}</td>
                      <td className="px-4 py-2 text-sm text-gray-800 text-right font-medium">{item.qty} pcs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Catatan */}
          {data.catatan && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Catatan</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">{data.catatan}</p>
            </div>
          )}

          {/* Print signature */}
          <div className="hidden print:grid grid-cols-3 gap-8 pt-8 mt-8 border-t border-gray-300">
            {["Pemohon", "Disetujui Oleh", "Petugas Konsumsi"].map((label) => (
              <div key={label} className="text-center">
                <div className="h-16 border-b border-gray-400 mb-2" />
                <p className="text-xs text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal open={deleteOpen} title="Hapus Permintaan"
        message={`Yakin hapus "${data.namaAcara}"? Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus" variant="danger" loading={deleteLoading}
        onConfirm={handleDelete} onCancel={() => setDeleteOpen(false)}
      />
      <ConfirmModal open={statusOpen} title="Ubah Status"
        message={`Ubah status menjadi "${nextStatus?.label}"?`}
        confirmLabel="Ya, Ubah" variant="primary" loading={statusLoading}
        onConfirm={handleStatusChange} onCancel={() => setStatusOpen(false)}
      />
    </>
  );
}
