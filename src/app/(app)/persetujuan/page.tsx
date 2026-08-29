"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Eye, Loader2, ClipboardCheck, RefreshCw, X } from "lucide-react";

const JENIS_LABEL: Record<string, string> = {
  SNACK_PAGI:  "Snack Pagi",
  SNACK_SORE:  "Snack Sore",
  MAKAN_SIANG: "Makan Siang",
  KOPI:        "Kopi",
  AIR_MINERAL: "Air Mineral",
  DLL:         "Dll",
};

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
  pemohon: { id: string; nama: string; jabatan: string; divisi: string };
  items: { id: string; jenis: string; qty: number; keterangan?: string }[];
};

export default function PersetujuanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [list,          setList]          = useState<Permintaan[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Setujui modal
  const [setujuiTarget, setSetujuiTarget] = useState<Permintaan | null>(null);

  // Tolak modal
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
    new Date(str).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (status === "loading") return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-600" size={28} />
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ClipboardCheck size={20} className="text-blue-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Persetujuan Konsumsi</h1>
            <p className="text-sm text-gray-500">
              {loading ? "Memuat..." : `${list.length} permintaan menunggu persetujuan`}
            </p>
          </div>
        </div>
        <button onClick={fetchPending} className="btn-secondary" disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Empty */}
      {!loading && list.length === 0 && (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Semua sudah diproses!</h2>
          <p className="text-sm text-gray-400">Tidak ada permintaan yang menunggu persetujuan.</p>
        </div>
      )}

      {loading && (
        <div className="card p-16 text-center">
          <Loader2 className="animate-spin mx-auto text-blue-600" size={32} />
          <p className="text-sm text-gray-400 mt-3">Memuat permintaan...</p>
        </div>
      )}

      {!loading && list.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="table-th">Nama Acara</th>
                  <th className="table-th">Tanggal & Jam</th>
                  <th className="table-th">Ruangan</th>
                  <th className="table-th">Pemohon</th>
                  <th className="table-th">Konsumsi</th>
                  <th className="table-th">Diajukan</th>
                  <th className="table-th text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td">
                      <p className="font-medium text-gray-900">{p.namaAcara}</p>
                      {p.catatan && <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">📝 {p.catatan}</p>}
                    </td>
                    <td className="table-td whitespace-nowrap">
                      <div className="font-medium">{formatTanggal(p.tanggal)}</div>
                      <div className="text-xs text-gray-400">{p.jamMulai} – {p.jamSelesai} WIB</div>
                    </td>
                    <td className="table-td">
                      <span className="text-sm text-gray-700">{p.ruangan}</span>
                    </td>
                    <td className="table-td">
                      <div className="font-medium">{p.pemohon.nama}</div>
                      <div className="text-xs text-gray-400">{p.pemohon.jabatan}</div>
                    </td>
                    <td className="table-td">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {p.items.map((item) => (
                          <span key={item.id} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                            {item.jenis === "DLL" && item.keterangan ? item.keterangan : JENIS_LABEL[item.jenis]}
                            <span className="font-bold">{item.qty}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="table-td text-xs text-gray-500 whitespace-nowrap">{formatCreatedAt(p.createdAt)}</td>
                    <td className="table-td">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/permintaan/${p.id}`}
                          className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye size={15} />
                        </Link>
                        <button onClick={() => setSetujuiTarget(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle size={13} />Setujui
                        </button>
                        <button onClick={() => { setTolakTarget(p); setAlasanTolak(""); setAlasanError(""); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                        >
                          <XCircle size={13} />Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Setujui */}
      {setujuiTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSetujuiTarget(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <button onClick={() => setSetujuiTarget(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={18} /></button>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Setujui Permintaan</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Setujui permintaan <span className="font-medium text-gray-700">"{setujuiTarget.namaAcara}"</span> dari {setujuiTarget.pemohon.nama}?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSetujuiTarget(null)} className="btn-secondary" disabled={actionLoading}>Batal</button>
              <button onClick={handleSetujui} disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? <><Loader2 size={14} className="animate-spin" />Memproses...</> : <><CheckCircle size={14} />Ya, Setujui</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tolak + Alasan */}
      {tolakTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setTolakTarget(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <button onClick={() => setTolakTarget(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={18} /></button>
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <XCircle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tolak Permintaan</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tolak permintaan <span className="font-medium text-gray-700">"{tolakTarget.namaAcara}"</span> dari {tolakTarget.pemohon.nama}?
                </p>
              </div>
            </div>
            <div className="mb-5">
              <label className="label">Alasan Penolakan <span className="text-red-500">*</span></label>
              <textarea rows={3} placeholder="Contoh: Stok konsumsi sedang kosong, harap ajukan ulang minggu depan..."
                value={alasanTolak}
                onChange={(e) => { setAlasanTolak(e.target.value); setAlasanError(""); }}
                className={`input-field resize-none ${alasanError ? "error" : ""}`}
                maxLength={500}
              />
              {alasanError && <p className="text-red-500 text-xs mt-1">{alasanError}</p>}
              <p className="text-xs text-gray-400 mt-1 text-right">{alasanTolak.length}/500</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setTolakTarget(null)} className="btn-secondary" disabled={actionLoading}>Batal</button>
              <button onClick={handleTolak} disabled={actionLoading} className="btn-danger">
                {actionLoading ? <><Loader2 size={14} className="animate-spin" />Memproses...</> : <><XCircle size={14} />Ya, Tolak</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
