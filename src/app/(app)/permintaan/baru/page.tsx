"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

type User = { id: string; nama: string };

const JURUSAN_LIST = ["TKR", "Elind", "TSM", "Akuntansi", "Mesin", "Hotel", "TKI", "Listrik"];

const ITEMS_CONFIG = [
  { jenis: "SNACK_PAGI",  label: "Snack Pagi" },
  { jenis: "SNACK_SORE",  label: "Snack Sore" },
  { jenis: "MAKAN_SIANG", label: "Makan Siang" },
  { jenis: "KOPI",        label: "Kopi" },
  { jenis: "AIR_MINERAL", label: "Air Mineral" },
  { jenis: "DLL",         label: "Dll" },
];

type ItemForm = { checked: boolean; qty: string; keterangan: string };

function initItems(): Record<string, ItemForm> {
  return Object.fromEntries(
    ITEMS_CONFIG.map((i) => [i.jenis, { checked: false, qty: "", keterangan: "" }])
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
  const [tanggal,    setTanggal]    = useState("");
  const [jamMulai,   setJamMulai]   = useState("08:00");
  const [jamSelesai, setJamSelesai] = useState("10:00");
  const [ruangan,    setRuangan]    = useState("");
  const [pemohonId,  setPemohonId]  = useState("");
  const [catatan,    setCatatan]    = useState("");
  const [items,      setItems]      = useState<Record<string, ItemForm>>(initItems());

  useEffect(() => {
    if (session?.user?.id && !isAdmin) setPemohonId(session.user.id);
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
    if (!ruangan.trim())    e.ruangan    = "Ruangan wajib diisi";
    if (!pemohonId)         e.pemohonId  = "Pemohon wajib dipilih";

    const checked = ITEMS_CONFIG.filter((c) => items[c.jenis].checked);
    if (checked.length === 0) {
      e.items = "Pilih minimal 1 item konsumsi";
    } else {
      checked.forEach((c) => {
        if (!items[c.jenis].qty || Number(items[c.jenis].qty) < 1)
          e[`qty_${c.jenis}`] = `Qty ${c.label} wajib diisi`;
        if (c.jenis === "DLL" && !items[c.jenis].keterangan.trim())
          e.keterangan_DLL = "Keterangan dll wajib diisi";
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
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="btn-secondary p-2"><ArrowLeft size={16} /></Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Buat Permintaan Baru</h1>
          <p className="text-sm text-gray-500">Isi form untuk mengajukan permintaan konsumsi</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="card p-6 space-y-5">

          {/* Nama Acara */}
          <div>
            <label className="label" htmlFor="namaAcara">Nama Acara <span className="text-red-500">*</span></label>
            <input id="namaAcara" type="text" placeholder="Contoh: Rapat Koordinasi Bulanan"
              value={namaAcara}
              onChange={(e) => { setNamaAcara(e.target.value); clearError("namaAcara"); }}
              className={`input-field ${errors.namaAcara ? "error" : ""}`}
            />
            {errors.namaAcara && <p className="text-red-500 text-xs mt-1">{errors.namaAcara}</p>}
          </div>

          {/* Tanggal */}
          <div>
            <label className="label" htmlFor="tanggal">Tanggal Dibutuhkan <span className="text-red-500">*</span></label>
            <input id="tanggal" type="date" value={tanggal}
              onChange={(e) => { setTanggal(e.target.value); clearError("tanggal"); }}
              className={`input-field ${errors.tanggal ? "error" : ""}`}
            />
            {errors.tanggal && <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>}
          </div>

          {/* Jam */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="jamMulai">Jam Mulai <span className="text-red-500">*</span></label>
              <input id="jamMulai" type="time" value={jamMulai}
                onChange={(e) => { setJamMulai(e.target.value); clearError("jamMulai"); }}
                className={`input-field ${errors.jamMulai ? "error" : ""}`}
              />
              {errors.jamMulai && <p className="text-red-500 text-xs mt-1">{errors.jamMulai}</p>}
            </div>
            <div>
              <label className="label" htmlFor="jamSelesai">Jam Selesai <span className="text-red-500">*</span></label>
              <input id="jamSelesai" type="time" value={jamSelesai}
                onChange={(e) => { setJamSelesai(e.target.value); clearError("jamSelesai"); }}
                className={`input-field ${errors.jamSelesai ? "error" : ""}`}
              />
              {errors.jamSelesai && <p className="text-red-500 text-xs mt-1">{errors.jamSelesai}</p>}
            </div>
          </div>

          {/* Ruangan */}
          <div>
            <label className="label" htmlFor="ruangan">Ruangan <span className="text-red-500">*</span></label>
            <input id="ruangan" type="text" placeholder="Contoh: Aula Utama, Ruang Rapat Lt.2"
              value={ruangan}
              onChange={(e) => { setRuangan(e.target.value); clearError("ruangan"); }}
              className={`input-field ${errors.ruangan ? "error" : ""}`}
            />
            {errors.ruangan && <p className="text-red-500 text-xs mt-1">{errors.ruangan}</p>}
          </div>

          {/* Pemohon */}
          <div>
            <label className="label" htmlFor="pemohon">Pemohon <span className="text-red-500">*</span></label>
            {isAdmin ? (
              <select id="pemohon" value={pemohonId}
                onChange={(e) => { setPemohonId(e.target.value); clearError("pemohonId"); }}
                className={`input-field ${errors.pemohonId ? "error" : ""}`}
              >
                <option value="">— Pilih Pemohon —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.nama}</option>
                ))}
              </select>
            ) : (
              <input type="text" value={session?.user?.name ?? ""} disabled className="input-field bg-gray-50 text-gray-500" />
            )}
            {errors.pemohonId && <p className="text-red-500 text-xs mt-1">{errors.pemohonId}</p>}
          </div>

          {/* Jurusan */}
          <div>
            <label className="label" htmlFor="jurusan">Jurusan <span className="text-red-500">*</span></label>
            <select id="jurusan" value={jurusan}
              onChange={(e) => { setJurusan(e.target.value); clearError("jurusan"); }}
              className={`input-field ${errors.jurusan ? "error" : ""}`}
            >
              <option value="">— Pilih Jurusan —</option>
              {JURUSAN_LIST.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
            {errors.jurusan && <p className="text-red-500 text-xs mt-1">{errors.jurusan}</p>}
          </div>

          {/* Items */}
          <div>
            <label className="label">Item Konsumsi <span className="text-red-500">*</span></label>
            <div className="space-y-2 rounded-lg border border-gray-200 p-4 bg-gray-50">
              {ITEMS_CONFIG.map((cfg) => {
                const item = items[cfg.jenis];
                return (
                  <div key={cfg.jenis} className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id={`check_${cfg.jenis}`} checked={item.checked}
                        onChange={() => toggleItem(cfg.jenis)}
                        className="w-4 h-4 accent-blue-700 cursor-pointer flex-shrink-0"
                      />
                      <label htmlFor={`check_${cfg.jenis}`}
                        className={`text-sm flex-1 cursor-pointer select-none ${item.checked ? "text-gray-900 font-medium" : "text-gray-500"}`}
                      >
                        {cfg.label}
                      </label>
                      <div className="w-24">
                        <input type="number" min={1} placeholder="Qty" value={item.qty}
                          disabled={!item.checked}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "");
                            setItems((p) => ({ ...p, [cfg.jenis]: { ...p[cfg.jenis], qty: v } }));
                            clearError(`qty_${cfg.jenis}`);
                          }}
                          className={`input-field text-center py-1.5 ${!item.checked ? "opacity-40" : ""} ${errors[`qty_${cfg.jenis}`] ? "error" : ""}`}
                        />
                      </div>
                    </div>
                    {cfg.jenis === "DLL" && item.checked && (
                      <div className="ml-7">
                        <input type="text" placeholder="Sebutkan (contoh: Tisu, Sedotan...)"
                          value={item.keterangan}
                          onChange={(e) => {
                            setItems((p) => ({ ...p, DLL: { ...p.DLL, keterangan: e.target.value } }));
                            clearError("keterangan_DLL");
                          }}
                          className={`input-field text-sm ${errors.keterangan_DLL ? "error" : ""}`}
                        />
                        {errors.keterangan_DLL && <p className="text-red-500 text-xs mt-1">{errors.keterangan_DLL}</p>}
                      </div>
                    )}
                    {item.checked && errors[`qty_${cfg.jenis}`] && (
                      <p className="text-red-500 text-xs ml-7">{errors[`qty_${cfg.jenis}`]}</p>
                    )}
                  </div>
                );
              })}
            </div>
            {errors.items && <p className="text-red-500 text-xs mt-1">{errors.items}</p>}
          </div>

          {/* Catatan */}
          <div>
            <label className="label" htmlFor="catatan">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
            <textarea id="catatan" rows={3} placeholder="Tambahkan catatan khusus jika ada..."
              value={catatan} onChange={(e) => setCatatan(e.target.value)}
              className="input-field resize-none" maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{catatan.length}/500</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
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
