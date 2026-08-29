"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  PlusCircle, Search, Filter, Eye, Pencil, Trash2,
  RefreshCw, Loader2, ChevronDown
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Pagination } from "@/components/Pagination";
import { ConfirmModal } from "@/components/ConfirmModal";

const JENIS_LABEL: Record<string, string> = {
  SNACK_PAGI:  "Snack Pagi",
  SNACK_SORE:  "Snack Sore",
  MAKAN_SIANG: "Makan Siang",
  KOPI:        "Kopi",
  AIR_MINERAL: "Air Mineral",
  DLL:         "Dll",
};

const STATUS_OPTIONS = [
  { value: "",          label: "Semua Status" },
  { value: "PENDING",   label: "Pending" },
  { value: "DISETUJUI", label: "Disetujui" },
  { value: "DITOLAK",   label: "Ditolak" },
  { value: "SELESAI",   label: "Selesai" },
];

const STATUS_NEXT: Record<string, { value: string; label: string }> = {
  DISETUJUI: { value: "SELESAI",  label: "Selesaikan" },
  SELESAI:   { value: "PENDING",  label: "Reset ke Pending" },
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

type User = { id: string; nama: string };

export default function DashboardPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [permintaan,  setPermintaan]  = useState<Permintaan[]>([]);
  const [users,       setUsers]       = useState<User[]>([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [status,      setStatus]      = useState("");
  const [pemohonId,   setPemohonId]   = useState("");
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai,setTanggalSampai]=useState("");
  const [page,        setPage]        = useState(1);
  const [showFilter,  setShowFilter]  = useState(false);
  const [deleteTarget,setDeleteTarget]= useState<Permintaan | null>(null);
  const [deleteLoading,setDeleteLoading]=useState(false);
  const [statusTarget,setStatusTarget]= useState<Permintaan | null>(null);
  const [statusLoading,setStatusLoading]=useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: "10",
        ...(search       && { search }),
        ...(status       && { status }),
        ...(pemohonId    && { pemohonId }),
        ...(tanggalDari  && { tanggalDari }),
        ...(tanggalSampai&& { tanggalSampai }),
      });
      const res  = await fetch(`/api/permintaan?${params}`);
      const json = await res.json();
      setPermintaan(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, pemohonId, tanggalDari, tanggalSampai]);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    try { const res = await fetch("/api/users"); setUsers(await res.json()); } catch {}
  }, [isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function resetFilters() {
    setSearch(""); setStatus(""); setPemohonId("");
    setTanggalDari(""); setTanggalSampai(""); setPage(1);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/permintaan/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
      toast.success("Permintaan berhasil dihapus");
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleStatusChange() {
    if (!statusTarget) return;
    const next = STATUS_NEXT[statusTarget.status];
    if (!next) return;
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/permintaan/${statusTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next.value }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status");
      toast.success(`Status diubah ke ${next.label}`);
      setStatusTarget(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setStatusLoading(false);
    }
  }

  const formatTanggal = (str: string) =>
    new Date(str).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard Permintaan</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} permintaan ditemukan</p>
        </div>
        <Link href="/permintaan/baru" className="btn-primary">
          <PlusCircle size={16} /><span className="hidden sm:inline">Buat Permintaan</span><span className="sm:hidden">Buat</span>
        </Link>
      </div>

      {/* Filter */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Cari Acara</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Nama acara..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-field pl-9"
              />
            </div>
          </div>
          <div className="w-40">
            <label className="label">Status</label>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field">
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button onClick={() => setShowFilter(!showFilter)} className="btn-secondary flex items-center gap-1 self-end">
            <Filter size={14} />Filter
            <ChevronDown size={14} className={`transition-transform ${showFilter ? "rotate-180" : ""}`} />
          </button>
          <button onClick={resetFilters} className="btn-secondary self-end" title="Reset"><RefreshCw size={14} /></button>
        </div>

        {showFilter && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
            {isAdmin && (
              <div className="w-48">
                <label className="label">Pemohon</label>
                <select value={pemohonId} onChange={(e) => { setPemohonId(e.target.value); setPage(1); }} className="input-field">
                  <option value="">Semua Pemohon</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.nama}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="label">Tanggal Dari</label>
              <input type="date" value={tanggalDari} onChange={(e) => { setTanggalDari(e.target.value); setPage(1); }} className="input-field w-40" />
            </div>
            <div>
              <label className="label">Tanggal Sampai</label>
              <input type="date" value={tanggalSampai} onChange={(e) => { setTanggalSampai(e.target.value); setPage(1); }} className="input-field w-40" />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
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
                <th className="table-th">Status</th>
                <th className="table-th text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Loader2 className="animate-spin mx-auto text-blue-600" size={28} />
                  <p className="text-sm text-gray-400 mt-2">Memuat data...</p>
                </td></tr>
              ) : permintaan.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <p className="text-gray-400 text-sm">Tidak ada data ditemukan</p>
                  <Link href="/permintaan/baru" className="btn-primary mt-4 inline-flex">
                    <PlusCircle size={14} />Buat Permintaan Pertama
                  </Link>
                </td></tr>
              ) : (
                permintaan.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td font-medium">{p.namaAcara}</td>
                    <td className="table-td whitespace-nowrap">
                      <div className="text-gray-900">{formatTanggal(p.tanggal)}</div>
                      <div className="text-gray-400 text-xs">{p.jamMulai} – {p.jamSelesai} WIB</div>
                    </td>
                    <td className="table-td text-gray-600 text-sm">{p.ruangan}</td>
                    <td className="table-td">
                      <div className="font-medium">{p.pemohon.nama}</div>
                      <div className="text-xs text-gray-400">{p.pemohon.divisi}</div>
                    </td>
                    <td className="table-td">
                      <div className="flex flex-wrap gap-1">
                        {p.items.map((item) => (
                          <span key={item.id} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            {item.jenis === "DLL" && item.keterangan ? item.keterangan : JENIS_LABEL[item.jenis]}
                            <span className="font-semibold">{item.qty}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="table-td"><StatusBadge status={p.status} /></td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/permintaan/${p.id}`}
                          className="p-1.5 rounded-md text-gray-500 hover:bg-blue-50 hover:text-blue-700 transition-colors" title="Lihat Detail">
                          <Eye size={15} />
                        </Link>
                        <Link href={`/permintaan/${p.id}/edit`}
                          className="p-1.5 rounded-md text-gray-500 hover:bg-yellow-50 hover:text-yellow-700 transition-colors" title="Edit">
                          <Pencil size={15} />
                        </Link>
                        {isAdmin && (
                          <>
                            {STATUS_NEXT[p.status] && (
                              <button onClick={() => setStatusTarget(p)}
                                className="p-1.5 rounded-md text-gray-500 hover:bg-green-50 hover:text-green-700 transition-colors"
                                title={`Ubah ke ${STATUS_NEXT[p.status].label}`}>
                                <RefreshCw size={15} />
                              </button>
                            )}
                            <button onClick={() => setDeleteTarget(p)}
                              className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Hapus">
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && permintaan.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Menampilkan {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} dari {total} data
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <ConfirmModal open={!!deleteTarget} title="Hapus Permintaan"
        message={`Yakin hapus "${deleteTarget?.namaAcara}"?`}
        confirmLabel="Hapus" variant="danger" loading={deleteLoading}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmModal open={!!statusTarget} title="Ubah Status"
        message={`Ubah status "${statusTarget?.namaAcara}" menjadi "${statusTarget ? STATUS_NEXT[statusTarget.status]?.label : ""}"?`}
        confirmLabel="Ya, Ubah" variant="primary" loading={statusLoading}
        onConfirm={handleStatusChange} onCancel={() => setStatusTarget(null)}
      />
    </div>
  );
}
