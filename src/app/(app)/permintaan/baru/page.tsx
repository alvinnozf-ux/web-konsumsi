"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Save, Coffee, UtensilsCrossed, Sandwich, Wind, Droplets, MoreHorizontal, AlertCircle } from "lucide-react";
import Link from "next/link";

type User = { id: string; nama: string };

const JURUSAN_LIST = ["TKR", "Elind", "TSM", "Akuntansi", "Mesin", "Hotel", "TKI", "Listrik"];

const ITEMS_CONFIG = [
  {
    jenis: "SNACK_PAGI",  label: "Snack Pagi",  icon: Sandwich,
    bg: "bg-amber-50",    border: "border-amber-300",
    iconActiveBg: "bg-amber-100", iconActiveColor: "text-amber-600",
    textColor: "text-amber-700",  checkBg: "bg-amber-500",
  },
  {
    jenis: "SNACK_SORE",  label: "Snack Sore",  icon: Sandwich,
    bg: "bg-orange-50",   border: "border-orange-300",
    iconActiveBg: "bg-orange-100", iconActiveColor: "text-orange-600",
    textColor: "text-orange-700", checkBg: "bg-orange-500",
  },
  {
    jenis: "MAKAN_SIANG", label: "Makan Siang", icon: UtensilsCrossed,
    bg: "bg-emerald-50",  border: "border-emerald-300",
    iconActiveBg: "bg-emerald-100", iconActiveColor: "text-emerald-600",
    textColor: "text-emerald-700", checkBg: "bg-emerald-500",
  },
  {
    jenis: "KOPI",        label: "Kopi",        icon: Coffee,
    bg: "bg-stone-50",    border: "border-stone-300",
    iconActiveBg: "bg-stone-100", iconActiveColor: "text-stone-700",
    textColor: "text-stone-700",  checkBg: "bg-stone-600",
  },
  {
    jenis: "AIR_MINERAL", label: "Air Mineral", icon: Droplets,
    bg: "bg-blue-50",     border: "border-blue-300",
    iconActiveBg: "bg-blue-100", iconActiveColor: "text-blue-600",
    textColor: "text-blue-700",   checkBg: "bg-blue-500",
  },
  {
    jenis: "DLL",         label: "Lainnya",     icon: MoreHorizontal,
    bg: "bg-purple-50",   border: "border-purple-300",
    iconActiveBg: "bg-purple-100", iconActiveColor: "text-purple-600",
    textColor: "text-purple-700", checkBg: "bg-purple-500",
  },
];

type ItemForm = { checked: boolean; qty: string; keterangan: string };

function initItems(): Record<string, ItemForm> {
  return Object.fromEntries(
    ITEMS_CONFIG.map((i) => [i.jenis, { checked: false, qty: "", keterangan: "" }])
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
      <AlertCircle size={12} className="flex-shrink-0" />
      {msg}
    </p>
  );
}

export default function PermintaanBaruPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [users,      setUsers]      = useState<User[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const [namaAcara,  setNamaAcara]  = useState("");
  const [jurusan,    setJurusan]    = useState("");
  const [kampus,     setKampus]     = useState("MM2100");
  const [tanggal,    setTanggal]    = useState("");
  const [jamMulai,   setJamMulai]   = useState("08:00");
  const [jamSelesai, setJamSelesai] = useState("10:00");
  const [ruangan,    setRuangan]    = useState("");
  const [pemohonId,  setPemohonId]  = useState("");
  const [catatan,    setCatatan]    = useState("");
  const [items,      setItems]      = useState<Record<string, ItemForm>>(initItems());

  // Autocomplete state
  const [pemohonQuery,   setPemohonQuery]   = useState("");
  const [pemohonOpen,    setPemohonOpen]    = useState(false);
  const [pemohonName,    setPemohonName]    = useState("");

  useEffect(() => {
    if (session?.user?.id && !isAdmin) {
      setPemohonId(session.user.id);
      setPemohonName(session.user.name ?? "");
      setPemohonQuery(session.user.name ?? "");
    }
  }, [session, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/users").then((r) => r.json()).then(setUsers).catch(() => {});
  }, [isAdmin]);

  function clearError(...keys: string[]) {
    setErrors((p) => { const n = { ...p }; keys.forEach((k) => delete n[k]); return n; });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!namaAcara.trim())  e.namaAcara  = "Nama acara wajib diisi";
    if (!jurusan)           e.jurusan    = "Jurusan wajib dipilih";
    if (!tanggal)           e.tanggal    = "Tanggal wajib diisi";
    if (!jamMulai)          e.jamMulai   = "Jam mulai wajib diisi";
    if (!jamSelesai)        e.jamSelesai = "Jam selesai wajib diisi";
    if (jamMulai && jamSelesai && jamSelesai <= jamMulai)
      e.jamSelesai = "Jam selesai harus lebih besar dari jam mulai";
    if (!ruangan.trim())    e.ruangan    = "Ruangan wajib diisi";
    if (!pemohonId && isAdmin) e.pemohonId = "Pilih pemohon dari daftar yang muncul";

    const checked = ITEMS_CONFIG.filter((c) => items[c.jenis].checked);
    if (checked.length === 0) {
      e.items = "Pilih minimal 1 item konsumsi";
    } else {
      checked.forEach((c) => {
        if (!items[c.jenis].qty || Number(items[c.jenis].qty) < 1)
          e[`qty_${c.jenis}`] = `Qty ${c.label} wajib diisi`;
        if (c.jenis === "DLL" && !items[c.jenis].keterangan.trim())
          e.keterangan_DLL = "Keterangan wajib diisi";
      });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      namaAcara: namaAcara.trim(),
      jurusan,
      kampus,
      tanggal, jamMulai, jamSelesai,
      ruangan: ruangan.trim(),
      pemohonId,
      catatan: catatan.trim() || null,
      items: ITEMS_CONFIG
        .filter((c) => items[c.jenis].checked)
        .map((c) => ({
          jenis: c.jenis,
          qty: Number(items[c.jenis].qty),
          keterangan: c.jenis === "DLL" ? items[c.jenis].keterangan.trim() : null,
        })),
    };

    setLoading(true);
    try {
      const res  = await fetch("/api/permintaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan");
      toast.success("Permintaan berhasil dibuat!");
      window.open("https://coffeeshop.itmivhs.net/", "_blank");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleItem(jenis: string) {
    setItems((prev) => ({ ...prev, [jenis]: { ...prev[jenis], checked: !prev[jenis].checked } }));
    clearError("items", `qty_${jenis}`, `keterangan_${jenis}`);
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="btn-secondary p-2 rounded-xl">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Buat Permintaan</h1>
          <p className="text-sm text-gray-400 mt-0.5">Isi detail kebutuhan konsumsi acara</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Section: Info Acara */}
        <div className="card p-5 space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Info Acara</p>

          <div>
            <FieldLabel required>Nama Acara</FieldLabel>
            <input type="text" placeholder="Contoh: Rapat Koordinasi Bulanan"
              value={namaAcara}
              onChange={(e) => { setNamaAcara(e.target.value); clearError("namaAcara"); }}
              className={`input-field ${errors.namaAcara ? "error" : ""}`}
            />
            <FieldError msg={errors.namaAcara} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Jurusan</FieldLabel>
              <select value={jurusan}
                onChange={(e) => { setJurusan(e.target.value); clearError("jurusan"); }}
                className={`input-field ${errors.jurusan ? "error" : ""}`}
              >
                <option value="">— Pilih Jurusan —</option>
                {JURUSAN_LIST.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
              <FieldError msg={errors.jurusan} />
            </div>
            <div>
              <FieldLabel required>Kampus</FieldLabel>
              <select value={kampus}
                onChange={(e) => setKampus(e.target.value)}
                className="input-field"
              >
                <option value="MM2100">SMK Mitra Industri MM2100</option>
                <option value="03">SMK Mitra Industri 03</option>
              </select>
            </div>
          </div>

          <div>
            <FieldLabel required>Ruangan</FieldLabel>
            <input type="text" placeholder="Contoh: Aula Utama"
              value={ruangan}
              onChange={(e) => { setRuangan(e.target.value); clearError("ruangan"); }}
              className={`input-field ${errors.ruangan ? "error" : ""}`}
            />
            <FieldError msg={errors.ruangan} />
          </div>

          <div>
            <FieldLabel required>Tanggal</FieldLabel>
            <input type="date" value={tanggal}
              onChange={(e) => { setTanggal(e.target.value); clearError("tanggal"); }}
              className={`input-field ${errors.tanggal ? "error" : ""}`}
            />
            <FieldError msg={errors.tanggal} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Jam Mulai</FieldLabel>
              <input type="time" value={jamMulai}
                onChange={(e) => { setJamMulai(e.target.value); clearError("jamMulai"); }}
                className={`input-field ${errors.jamMulai ? "error" : ""}`}
              />
              <FieldError msg={errors.jamMulai} />
            </div>
            <div>
              <FieldLabel required>Jam Selesai</FieldLabel>
              <input type="time" value={jamSelesai}
                onChange={(e) => { setJamSelesai(e.target.value); clearError("jamSelesai"); }}
                className={`input-field ${errors.jamSelesai ? "error" : ""}`}
              />
              <FieldError msg={errors.jamSelesai} />
            </div>
          </div>

          {isAdmin && (
            <div className="relative">
              <FieldLabel required>Pemohon</FieldLabel>
              <input
                type="text"
                placeholder="Ketik nama pemohon..."
                value={pemohonQuery}
                autoComplete="off"
                onChange={(e) => {
                  setPemohonQuery(e.target.value);
                  setPemohonId("");
                  setPemohonName("");
                  setPemohonOpen(true);
                  clearError("pemohonId");
                }}
                onFocus={() => setPemohonOpen(true)}
                onBlur={() => setTimeout(() => setPemohonOpen(false), 150)}
                className={`input-field ${errors.pemohonId ? "error" : ""} ${pemohonName ? "pr-8" : ""}`}
              />
              {/* Clear button */}
              {pemohonName && (
                <button
                  type="button"
                  onClick={() => { setPemohonQuery(""); setPemohonId(""); setPemohonName(""); }}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
              {/* Dropdown suggestion */}
              {pemohonOpen && pemohonQuery.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  {users
                    .filter((u) =>
                      u.nama.toLowerCase().includes(pemohonQuery.toLowerCase())
                    )
                    .slice(0, 6)
                    .map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onMouseDown={() => {
                          setPemohonId(u.id);
                          setPemohonName(u.nama);
                          setPemohonQuery(u.nama);
                          setPemohonOpen(false);
                          clearError("pemohonId");
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                          {u.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-800 font-medium">{u.nama}</span>
                      </button>
                    ))
                  }
                  {users.filter((u) =>
                    u.nama.toLowerCase().includes(pemohonQuery.toLowerCase())
                  ).length === 0 && (
                    <p className="px-3.5 py-3 text-sm text-gray-400 text-center">
                      Tidak ada pengguna ditemukan
                    </p>
                  )}
                </div>
              )}
              {/* Selected indicator */}
              {pemohonName && (
                <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {pemohonName} dipilih
                </p>
              )}
              <FieldError msg={errors.pemohonId} />
            </div>
          )}
        </div>

        {/* Section: Item Konsumsi */}
        <div className="card p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Item Konsumsi</p>
          <p className="text-xs text-gray-400 mb-4">Pilih dan isi jumlah yang dibutuhkan</p>
          <FieldError msg={errors.items} />

          <div className="space-y-2">
            {ITEMS_CONFIG.map((cfg) => {
              const item = items[cfg.jenis];
              const Icon = cfg.icon;
              return (
                <div
                  key={cfg.jenis}
                  className={`rounded-xl border-2 transition-all duration-150 overflow-hidden
                    ${item.checked
                      ? `${cfg.bg} ${cfg.border}`
                      : "bg-white border-gray-100"
                    }`}
                >
                  {/* Toggle row */}
                  <button
                    type="button"
                    onClick={() => toggleItem(cfg.jenis)}
                    className="w-full flex items-center gap-3 p-3.5 text-left active:scale-[.99]"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                      ${item.checked ? cfg.iconActiveBg : "bg-gray-50"}`}>
                      <Icon size={18} className={item.checked ? cfg.iconActiveColor : "text-gray-400"} />
                    </div>
                    <span className={`flex-1 text-sm font-semibold transition-colors
                      ${item.checked ? cfg.textColor : "text-gray-600"}`}>
                      {cfg.label}
                    </span>
                    {/* Checkbox visual */}
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${item.checked
                        ? `${cfg.checkBg} border-transparent`
                        : "border-gray-200 bg-white"
                      }`}>
                      {item.checked && (
                        <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                          <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Expanded input */}
                  {item.checked && (
                    <div className="px-3.5 pb-3.5 space-y-2">
                      <input
                        type="number" min={1} placeholder="Jumlah (qty)"
                        value={item.qty}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "");
                          setItems((p) => ({ ...p, [cfg.jenis]: { ...p[cfg.jenis], qty: v } }));
                          clearError(`qty_${cfg.jenis}`);
                        }}
                        className={`input-field ${errors[`qty_${cfg.jenis}`] ? "error" : ""}`}
                      />
                      {cfg.jenis === "DLL" && (
                        <input
                          type="text" placeholder="Sebutkan (contoh: Tisu, Sedotan...)"
                          value={item.keterangan}
                          onChange={(e) => {
                            setItems((p) => ({ ...p, DLL: { ...p.DLL, keterangan: e.target.value } }));
                            clearError("keterangan_DLL");
                          }}
                          className={`input-field ${errors.keterangan_DLL ? "error" : ""}`}
                        />
                      )}
                      <FieldError msg={errors[`qty_${cfg.jenis}`] ?? (cfg.jenis === "DLL" ? errors.keterangan_DLL : undefined)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Catatan */}
        <div className="card p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Catatan</p>
          <textarea rows={3} placeholder="Tambahkan catatan khusus jika ada..."
            value={catatan} onChange={(e) => setCatatan(e.target.value)}
            className="input-field resize-none" maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1.5 text-right">{catatan.length}/500</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1 pb-6">
          <Link href="/dashboard" className="btn-secondary">Batal</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading
              ? <><Loader2 size={15} className="animate-spin" />Menyimpan...</>
              : <><Save size={15} />Simpan Permintaan</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
