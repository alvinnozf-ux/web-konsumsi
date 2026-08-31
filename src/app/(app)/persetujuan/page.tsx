"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  CheckCircle, XCircle, Eye, Loader2, ClipboardCheck,
  RefreshCw, X, CalendarDays, Clock3, MapPin, FileText,
} from "lucide-react";

import { JENIS_LABEL, JENIS_COLOR } from "@/lib/constants";

type Permintaan = {
  id: string;
  namaAcara: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
  status: string;
  catatan: string | null;
  createdAt: string;
  pemohon: { id: string; nama: string };
  items: { id: string; jenis: string; qty: number; keterangan?: string }[];
};

export default function PersetujuanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [list,          setList]          = useState<Permintaan[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [setujuiTarget, setSetujuiTarget] = useState<Permintaan | null>(null);
  const [tolakTarget,   setTolakTarget]   = useState<Permintaan | null>(null);
  const [alasanTolak,   setAlasanTolak]   = useState("");
  const [alasanError,   setAlasanError]   = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      const role = session?.user?.role;
      if (role !== "APPROVER" && role !== "ADMIN") router.replace("/dashboard");
    }
  }, [session, status, router]);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/permintaan?status=PENDING&limit=50");
      const json = await res.json();
      setList(json.data ?? []);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  async function handleSetujui() {
    if (!setujuiTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/permintaan/${setujuiTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DISETUJUI" }),
      });
      if (!res.ok) throw new Error("Gagal memproses");
      toast.success("Permintaan berhasil disetujui ✓");
      setSetujuiTarget(null);
      fetchPending();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTolak() {
    if (!tolakTarget) return;
    if (!alasanTolak.trim()) {
      setAlasanError("Alasan penolakan wajib diisi");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/permintaan/${tolakTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DITOLAK", alasanTolak: alasanTolak.trim() }),
      });
      if (!res.ok) throw new Error("Gagal memproses");
      toast.success("Permintaan ditolak");
      setTolakTarget(null);
      setAlasanTolak("");
      fetchPending();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  const formatTanggal = (str: string) =>
    new Date(str).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  const formatCreatedAt = (str: string) =>
    new Date(str).toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  if (status === "loading") return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-600" size={28} />
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">

      {/* Header — konsisten dengan dashboard */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
            </span>
            {!loading && list.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                {list.length} menunggu persetujuan
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Persetujuan Konsumsi
          </h1>
        </div>
        <button
          onClick={fetchPending}
          className="btn-secondary flex-shrink-0"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card p-16 text-center">
          <Loader2 className="animate-spin mx-auto text-blue-600" size={32} />
          <p className="text-sm text-gray-400 mt-3">Memuat permintaan...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && list.length === 0 && (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-800 mb-1">Semua sudah diproses!</h2>
          <p className="text-sm text-gray-400">Tidak ada permintaan yang menunggu persetujuan.</p>
        </div>
      )}

      {/* Tabel — desktop */}
      {!loading && list.length > 0 && (
        <>
          <div className="card overflow-hidden hidden md:block">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Daftar Pending</p>
              <p className="text-xs text-gray-400">{list.length} permintaan</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="table-th">Nama Acara</th>
                    <th className="table-th">Tanggal &amp; Jam</th>
                    <th className="table-th">Ruangan</th>
                    <th className="table-th">Pemohon</th>
                    <th className="table-th">Konsumsi</th>
                    <th className="table-th">Diajukan</th>
                    <th className="table-th text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {list.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="table-td">
                        <p className="font-semibold text-gray-900 text-sm">{p.namaAcara}</p>
                        {p.catatan && (
                          <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate flex items-center gap-1">
                            <FileText size={10} className="flex-shrink-0" />
                            {p.catatan}
                          </p>
                        )}
                      </td>
                      <td className="table-td whitespace-nowrap">
                        <p className="text-sm text-gray-700">{formatTanggal(p.tanggal)}</p>
                        <p className="text-xs text-gray-400">{p.jamMulai} – {p.jamSelesai} WIB</p>
                      </td>
                      <td className="table-td text-sm text-gray-600">{p.ruangan}</td>
                      <td className="table-td">
                        <p className="text-sm font-medium text-gray-800">{p.pemohon.nama}</p>
                      </td>
                      <td className="table-td">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {p.items.map((item) => {
                            const colorClass = JENIS_COLOR[item.jenis] ?? "bg-gray-50 text-gray-600 border-gray-200";
                            return (
                              <span
                                key={item.id}
                                className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${colorClass}`}
                              >
                                {item.jenis === "DLL" && item.keterangan
                                  ? item.keterangan
                                  : JENIS_LABEL[item.jenis]}
                                <span className="font-bold opacity-70">×{item.qty}</span>
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="table-td text-xs text-gray-500 whitespace-nowrap">
                        {formatCreatedAt(p.createdAt)}
                      </td>
                      <td className="table-td">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/permintaan/${p.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye size={14} />
                          </Link>
                          <button
                            onClick={() => setSetujuiTarget(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:scale-[.97] transition-all"
                          >
                            <CheckCircle size={12} />Setujui
                          </button>
                          <button
                            onClick={() => { setTolakTarget(p); setAlasanTolak(""); setAlasanError(""); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 active:scale-[.97] transition-all"
                          >
                            <XCircle size={12} />Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card view — mobile */}
          <div className="md:hidden space-y-3">
            {list.map((p) => (
              <div key={p.id} className="card p-4 space-y-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{p.namaAcara}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.pemohon.nama}</p>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={11} className="text-gray-400" />
                    {formatTanggal(p.tanggal)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 size={11} className="text-gray-400" />
                    {p.jamMulai}–{p.jamSelesai}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-gray-400" />
                    {p.ruangan}
                  </span>
                </div>

                {p.catatan && (
                  <p className="text-xs text-gray-400 flex items-start gap-1">
                    <FileText size={10} className="flex-shrink-0 mt-0.5" />
                    {p.catatan}
                  </p>
                )}

                <div className="flex flex-wrap gap-1">
                  {p.items.map((item) => {
                    const colorClass = JENIS_COLOR[item.jenis] ?? "bg-gray-50 text-gray-600 border-gray-200";
                    return (
                      <span
                        key={item.id}
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${colorClass}`}
                      >
                        {item.jenis === "DLL" && item.keterangan
                          ? item.keterangan
                          : JENIS_LABEL[item.jenis]}
                        <span className="font-bold opacity-70">×{item.qty}</span>
                      </span>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                  <Link href={`/permintaan/${p.id}`} className="btn-secondary py-1.5 px-3 text-xs flex-1 justify-center">
                    <Eye size={12} />Detail
                  </Link>
                  <button
                    onClick={() => setSetujuiTarget(p)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex-1"
                  >
                    <CheckCircle size={12} />Setujui
                  </button>
                  <button
                    onClick={() => { setTolakTarget(p); setAlasanTolak(""); setAlasanError(""); }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors flex-1"
                  >
                    <XCircle size={12} />Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal Setujui */}
      {setujuiTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSetujuiTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <button
              onClick={() => setSetujuiTarget(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Setujui Permintaan</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Setujui{" "}
                  <span className="font-medium text-gray-700">"{setujuiTarget.namaAcara}"</span>{" "}
                  dari {setujuiTarget.pemohon.nama}?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSetujuiTarget(null)} className="btn-secondary" disabled={actionLoading}>
                Batal
              </button>
              <button
                onClick={handleSetujui}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 active:scale-[.97] transition-all disabled:opacity-50"
              >
                {actionLoading
                  ? <><Loader2 size={14} className="animate-spin" />Memproses...</>
                  : <><CheckCircle size={14} />Ya, Setujui</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tolak + Alasan */}
      {tolakTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setTolakTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <button
              onClick={() => setTolakTarget(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <XCircle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tolak Permintaan</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tolak{" "}
                  <span className="font-medium text-gray-700">"{tolakTarget.namaAcara}"</span>{" "}
                  dari {tolakTarget.pemohon.nama}?
                </p>
              </div>
            </div>
            <div className="mb-5">
              <label className="label">
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Stok konsumsi sedang kosong, harap ajukan ulang minggu depan..."
                value={alasanTolak}
                onChange={(e) => { setAlasanTolak(e.target.value); setAlasanError(""); }}
                className={`input-field resize-none ${alasanError ? "error" : ""}`}
                maxLength={500}
              />
              {alasanError && <p className="text-red-500 text-xs mt-1.5">{alasanError}</p>}
              <p className="text-xs text-gray-400 mt-1 text-right">{alasanTolak.length}/500</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setTolakTarget(null)} className="btn-secondary" disabled={actionLoading}>
                Batal
              </button>
              <button onClick={handleTolak} disabled={actionLoading} className="btn-danger">
                {actionLoading
                  ? <><Loader2 size={14} className="animate-spin" />Memproses...</>
                  : <><XCircle size={14} />Ya, Tolak</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
