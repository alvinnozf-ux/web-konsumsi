"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  PlusCircle, Search, Filter, Eye, Pencil, Trash2,
  RefreshCw, Loader2, ChevronDown, ClipboardList,
  Clock, CheckCircle2, XCircle,
  CalendarDays, Clock3, MapPin,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Pagination } from "@/components/Pagination";
import { ConfirmModal } from "@/components/ConfirmModal";
import { JENIS_LABEL } from "@/lib/constants";

const STATUS_OPTIONS = [
  { value: "",          label: "Semua Status" },
  { value: "PENDING",   label: "Pending" },
  { value: "DISETUJUI", label: "Disetujui" },
  { value: "DITOLAK",   label: "Ditolak" },
  { value: "SELESAI",   label: "Selesai" },
];

const STATUS_NEXT: Record<string, { value: string; label: string }> = {
  DISETUJUI: { value: "SELESAI", label: "Selesaikan" },
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
  catatan: string | null;
  createdAt: string;
  pemohon: { id: string; nama: string };
  items: { id: string; jenis: string; qty: number; keterangan?: string }[];
};

type User = { id: string; nama: string };

type Stats = { total: number; pending: number; disetujui: number; ditolak: number; selesai: number };

const STAT_CARDS = [
  {
    key: "total",
    label: "Total",
    icon: ClipboardList,
    bg: "bg-[#0f2035]",
    iconColor: "text-blue-400",
    numColor: "text-white",
    labelColor: "text-blue-300/70",
    dark: true,
  },
  {
    key: "pending",
    label: "Menunggu",
    icon: Clock,
    bg: "bg-amber-500",
    iconColor: "text-amber-100",
    numColor: "text-white",
    labelColor: "text-amber-100/80",
    dark: true,
  },
  {
    key: "disetujui",
    label: "Disetujui",
    icon: CheckCircle2,
    bg: "bg-emerald-500",
    iconColor: "text-emerald-100",
    numColor: "text-white",
    labelColor: "text-emerald-100/80",
    dark: true,
  },
  {
    key: "ditolak",
    label: "Ditolak",
    icon: XCircle,
    bg: "bg-red-500",
    iconColor: "text-red-100",
    numColor: "text-white",
    labelColor: "text-red-100/80",
    dark: true,
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [permintaan,   setPermintaan]   = useState<Permintaan[]>([]);
  const [users,        setUsers]        = useState<User[]>([]);
  const [stats,        setStats]        = useState<Stats>({ total: 0, pending: 0, disetujui: 0, ditolak: 0, selesai: 0 });
  const [total,        setTotal]        = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [status,       setStatus]       = useState("");
  const [pemohonId,    setPemohonId]    = useState("");
  const [tanggalDari,  setTanggalDari]  = useState("");
  const [tanggalSampai,setTanggalSampai]= useState("");
  const [page,         setPage]         = useState(1);
  const [showFilter,   setShowFilter]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Permintaan | null>(null);
  const [deleteLoading,setDeleteLoading]= useState(false);
  const [statusTarget, setStatusTarget] = useState<Permintaan | null>(null);
  const [statusLoading,setStatusLoading]= useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: "10",
        ...(search        && { search }),
        ...(status        && { status }),
        ...(pemohonId     && { pemohonId }),
        ...(tanggalDari   && { tanggalDari }),
        ...(tanggalSampai && { tanggalSampai }),
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

  // Fetch stats (semua status dalam 1 request via endpoint dedicated)
  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch("/api/permintaan/stats");
      const json = await res.json();
      setStats({
        total:     json.total     ?? 0,
        pending:   json.pending   ?? 0,
        disetujui: json.disetujui ?? 0,
        ditolak:   json.ditolak   ?? 0,
        selesai:   json.selesai   ?? 0,
      });
    } catch {}
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    try { const res = await fetch("/api/users"); setUsers(await res.json()); } catch {}
  }, [isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
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
      fetchData(); fetchStats();
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
      toast.success("Status berhasil diubah");
      setStatusTarget(null);
      fetchData(); fetchStats();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setStatusLoading(false);
    }
  }

  const formatTanggal = (str: string) =>
    new Date(str).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  function getGreeting() {
    const jam = new Date().getHours();
    if (jam < 11) return "Selamat pagi";
    if (jam < 15) return "Selamat siang";
    return "Selamat sore";
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
            </span>
            {stats.pending > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                {stats.pending} menunggu persetujuan
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight truncate">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {session?.user?.role === "ADMIN"
              ? "Kamu masuk sebagai Admin — kelola semua permintaan konsumsi."
              : "Buat permintaan konsumsi untuk kegiatan jurusanmu."}
          </p>
        </div>
        <Link href="/permintaan/baru" className="btn-primary gap-2 flex-shrink-0">
          <PlusCircle size={15} />
          <span className="hidden sm:inline">Buat Permintaan</span>
          <span className="sm:hidden">Buat</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAT_CARDS.map(({ key, label, icon: Icon, bg, iconColor, numColor, labelColor }) => {
          const isActive = status === (key === "total" ? "" : key.toUpperCase());
          return (
            <button
              key={key}
              onClick={() => { setStatus(key === "total" ? "" : key.toUpperCase()); setPage(1); }}
              className={`
                ${bg} rounded-2xl p-4 text-left
                transition-all duration-150
                hover:-translate-y-0.5 active:scale-[.97]
                ${isActive ? "ring-2 ring-offset-2 ring-white/50 shadow-lg scale-[1.01]" : "shadow-md"}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon size={16} className={iconColor} />
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/60" />}
              </div>
              <p className={`text-3xl font-extrabold tracking-tight leading-none ${numColor}`}>
                {stats[key as keyof Stats]}
              </p>
              <p className={`text-xs font-semibold mt-2 ${labelColor}`}>{label}</p>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" placeholder="Cari nama acara..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-field pl-9"
              />
            </div>
          </div>
          <div className="w-40">
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field">
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`btn-secondary flex items-center gap-1.5 ${showFilter ? "bg-blue-50 border-blue-300 text-blue-700" : ""}`}
          >
            <Filter size={14} />
            <span className="hidden sm:inline">Filter</span>
            <ChevronDown size={13} className={`transition-transform ${showFilter ? "rotate-180" : ""}`} />
          </button>
          {(search || status || pemohonId || tanggalDari || tanggalSampai) && (
            <button onClick={resetFilters} className="btn-secondary text-xs">
              Reset
            </button>
          )}
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
              <label className="label">Dari</label>
              <input type="date" value={tanggalDari} onChange={(e) => { setTanggalDari(e.target.value); setPage(1); }} className="input-field w-40" />
            </div>
            <div>
              <label className="label">Sampai</label>
              <input type="date" value={tanggalSampai} onChange={(e) => { setTanggalSampai(e.target.value); setPage(1); }} className="input-field w-40" />
            </div>
          </div>
        )}
      </div>

      {/* Tabel — desktop */}
      <div className="card overflow-hidden hidden md:block">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Daftar Permintaan</p>
          {!loading && <p className="text-xs text-gray-400">{total} data</p>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="table-th">Nama Acara</th>
                <th className="table-th">Tanggal</th>
                <th className="table-th">Ruangan</th>
                <th className="table-th">Pemohon</th>
                <th className="table-th">Item</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-blue-500" size={24} />
                  <p className="text-sm text-gray-400 mt-3">Memuat data...</p>
                </td></tr>
              ) : permintaan.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center">
                  <ClipboardList size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400 text-sm font-medium">Belum ada permintaan</p>
                  <p className="text-gray-300 text-xs mt-1">Mulai dengan membuat permintaan baru</p>
                  <Link href="/permintaan/baru" className="btn-primary mt-4 inline-flex">
                    <PlusCircle size={14} />Buat Sekarang
                  </Link>
                </td></tr>
              ) : (
                permintaan.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="table-td">
                      <p className="font-semibold text-gray-900 text-sm">{p.namaAcara}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.jurusan}</p>
                    </td>
                    <td className="table-td whitespace-nowrap">
                      <p className="text-sm text-gray-700">{formatTanggal(p.tanggal)}</p>
                      <p className="text-xs text-gray-400">{p.jamMulai} – {p.jamSelesai}</p>
                    </td>
                    <td className="table-td text-sm text-gray-600">{p.ruangan}</td>
                    <td className="table-td">
                      <p className="text-sm font-medium text-gray-800">{p.pemohon.nama}</p>
                    </td>
                    <td className="table-td">
                      <div className="flex flex-wrap gap-1">
                        {p.items.slice(0, 3).map((item) => (
                          <span key={item.id} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                            {item.jenis === "DLL" && item.keterangan ? item.keterangan : JENIS_LABEL[item.jenis]} ×{item.qty}
                          </span>
                        ))}
                        {p.items.length > 3 && (
                          <span className="text-[11px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">+{p.items.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="table-td"><StatusBadge status={p.status} /></td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link href={`/permintaan/${p.id}`}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-100 hover:text-blue-700 transition-colors" title="Detail">
                          <Eye size={15} />
                        </Link>
                        {p.status === "PENDING" && (
                          <Link href={`/permintaan/${p.id}/edit`}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-amber-100 hover:text-amber-700 transition-colors" title="Edit">
                            <Pencil size={15} />
                          </Link>
                        )}
                        {isAdmin && STATUS_NEXT[p.status] && (
                          <button onClick={() => setStatusTarget(p)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                            title={STATUS_NEXT[p.status].label}>
                            <RefreshCw size={15} />
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={() => setDeleteTarget(p)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Hapus">
                            <Trash2 size={15} />
                          </button>
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
          <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} dari {total} permintaan
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Card view — mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-500" size={24} />
            <p className="text-sm text-gray-400 mt-3">Memuat data...</p>
          </div>
        ) : permintaan.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">Belum ada permintaan</p>
            <Link href="/permintaan/baru" className="btn-primary mt-4 inline-flex">
              <PlusCircle size={14} />Buat Sekarang
            </Link>
          </div>
        ) : (
          <>
            {permintaan.map((p) => (
              <div key={p.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{p.namaAcara}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{p.jurusan} · {p.pemohon.nama}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={11} className="text-gray-400 flex-shrink-0" />
                    {formatTanggal(p.tanggal)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 size={11} className="text-gray-400 flex-shrink-0" />
                    {p.jamMulai}–{p.jamSelesai}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                    {p.ruangan}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {p.items.map((item) => (
                    <span key={item.id} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {item.jenis === "DLL" && item.keterangan ? item.keterangan : JENIS_LABEL[item.jenis]} ×{item.qty}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                  <Link href={`/permintaan/${p.id}`} className="btn-secondary py-1.5 px-3 text-xs">
                    <Eye size={13} />Detail
                  </Link>
                  {p.status === "PENDING" && (
                    <Link href={`/permintaan/${p.id}/edit`} className="btn-secondary py-1.5 px-3 text-xs">
                      <Pencil size={13} />Edit
                    </Link>
                  )}
                  {isAdmin && STATUS_NEXT[p.status] && (
                    <button onClick={() => setStatusTarget(p)} className="btn-secondary py-1.5 px-3 text-xs">
                      <RefreshCw size={13} />{STATUS_NEXT[p.status].label}
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-gray-400">{(page - 1) * 10 + 1}–{Math.min(page * 10, total)} dari {total}</p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <ConfirmModal open={!!deleteTarget} title="Hapus Permintaan"
        message={`Yakin hapus "${deleteTarget?.namaAcara}"? Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus" variant="danger" loading={deleteLoading}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmModal open={!!statusTarget} title="Ubah Status"
        message={`Ubah status "${statusTarget?.namaAcara}" menjadi Selesai?`}
        confirmLabel="Ya, Selesaikan" variant="primary" loading={statusLoading}
        onConfirm={handleStatusChange} onCancel={() => setStatusTarget(null)}
      />
    </div>
  );
}
