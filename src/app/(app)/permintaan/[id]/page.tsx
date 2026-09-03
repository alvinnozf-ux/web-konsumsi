"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft, Pencil, Printer, Trash2, Loader2, RefreshCw,
  CalendarDays, Clock3, MapPin, User, Building2, AlertCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmModal } from "@/components/ConfirmModal";
import { JENIS_LABEL, JENIS_COLOR } from "@/lib/constants";

const STATUS_NEXT: Record<string, { value: string; label: string }> = {
  DISETUJUI: { value: "SELESAI", label: "Tandai Selesai" },
};

type Permintaan = {
  id: string;
  namaAcara: string;
  jurusan: string;
  kampus: string;
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

  const [data,          setData]          = useState<Permintaan | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusOpen,    setStatusOpen]    = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

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
    new Date(str).toLocaleDateString("id-ID", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });

  const formatCreatedAt = (str: string) =>
    new Date(str).toLocaleDateString("id-ID", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

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
          @page { size: A4; margin: 0; }
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-wrapper { padding: 1.5cm; }
        }
      `}</style>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-6 pb-4 border-b-2 border-gray-800">
        <div className="flex items-center justify-center gap-3 mb-1">
          <div className="flex items-center gap-1">
            <img src="/logo-mm2100.png" alt="MM2100" className="w-12 h-12 rounded-full object-cover" />
            <img src="/logo-03.png" alt="03" className="w-12 h-12 rounded-full object-cover" />
          </div>
          <div className="text-left">
            <p className="font-bold text-lg leading-tight text-gray-900">SMK Mitra Industri</p>
            <p className="text-sm text-gray-600">MM2100 &amp; 03</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Sistem Permintaan Konsumsi</p>
      </div>

      <div className="print-wrapper p-4 md:p-6 max-w-3xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn-secondary p-2">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Detail Permintaan</h1>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{data.id}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={() => {
                const prev = document.title;
                document.title = " ";
                window.print();
                document.title = prev;
              }}
              className="btn-secondary"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            {data.status === "PENDING" && (
              <Link href={`/permintaan/${id}/edit`} className="btn-secondary">
                <Pencil size={15} />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            )}
            {isAdmin && nextStatus && (
              <button onClick={() => setStatusOpen(true)} className="btn-primary">
                <RefreshCw size={15} />
                <span className="hidden sm:inline">{nextStatus.label}</span>
              </button>
            )}
            {isAdmin && (
              <button onClick={() => setDeleteOpen(true)} className="btn-danger">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Alasan Tolak — prominent block */}
        {data.status === "DITOLAK" && data.alasanTolak && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle size={16} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Alasan Penolakan</p>
              <p className="text-sm text-red-800 leading-relaxed">{data.alasanTolak}</p>
            </div>
          </div>
        )}

        {/* Main card */}
        <div className="card p-5 md:p-6 space-y-5">

          {/* Status + timestamp row */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <StatusBadge status={data.status} />
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Dibuat</p>
              <p className="text-xs text-gray-600 mt-0.5">{formatCreatedAt(data.createdAt)}</p>
            </div>
          </div>

          {/* Info grid */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Informasi Acara</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Nama Acara — full width */}
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Nama Acara</p>
                <p className="text-gray-900 font-bold text-base">{data.namaAcara}</p>
              </div>

              {/* Pemohon */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Pemohon</p>
                  <p className="text-gray-900 font-semibold text-sm">{data.pemohon.nama}</p>
                </div>
              </div>

              {/* Jurusan */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                <Building2 size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Jurusan</p>
                  <p className="text-gray-900 font-semibold text-sm">{data.jurusan}</p>
                </div>
              </div>

              {/* Kampus */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                <Building2 size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Kampus</p>
                  <p className="text-gray-900 font-semibold text-sm">SMK Mitra Industri {data.kampus}</p>
                </div>
              </div>

              {/* Tanggal */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                <CalendarDays size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Tanggal</p>
                  <p className="text-gray-900 font-semibold text-sm">{formatTanggal(data.tanggal)}</p>
                </div>
              </div>

              {/* Waktu */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                <Clock3 size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Waktu</p>
                  <p className="text-gray-900 font-semibold text-sm">{data.jamMulai} – {data.jamSelesai} WIB</p>
                </div>
              </div>

              {/* Ruangan — full width */}
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Ruangan</p>
                  <p className="text-gray-900 font-semibold text-sm">{data.ruangan}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Item Konsumsi */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Item Konsumsi</p>
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Keterangan</th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.items.map((item) => {
                    const colorClass = JENIS_COLOR[item.jenis] ?? "bg-gray-50 text-gray-600 border-gray-200";
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-full border font-semibold ${colorClass}`}>
                            {JENIS_LABEL[item.jenis]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.keterangan ?? "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-bold">{item.qty} <span className="font-normal text-gray-400">pcs</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Catatan */}
          {data.catatan && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Catatan</p>
              <p className="text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-xl p-3.5 leading-relaxed">
                {data.catatan}
              </p>
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

      <ConfirmModal
        open={deleteOpen}
        title="Hapus Permintaan"
        message={`Yakin hapus "${data.namaAcara}"? Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
      <ConfirmModal
        open={statusOpen}
        title="Ubah Status"
        message={`Ubah status menjadi "${nextStatus?.label}"?`}
        confirmLabel="Ya, Ubah"
        variant="primary"
        loading={statusLoading}
        onConfirm={handleStatusChange}
        onCancel={() => setStatusOpen(false)}
      />
    </>
  );
}
