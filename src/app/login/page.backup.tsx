"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username,  setUsername]  = useState("");
  const [password,  setPassword]  = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // fieldError hanya untuk validasi kosong (per-field), bukan salah kredensial
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validasi per-field (kosong)
    const fe: typeof fieldErrors = {};
    if (!username.trim()) fe.username = "Username tidak boleh kosong.";
    if (!password)        fe.password = "Password tidak boleh kosong.";
    if (Object.keys(fe).length > 0) { setFieldErrors(fe); return; }
    setFieldErrors({});

    setLoading(true);
    const res = await signIn("credentials", { username: username.trim(), password, redirect: false });
    setLoading(false);
    // Kredensial salah → tampilkan error umum tanpa mewarnai field
    if (res?.error) setError("Username atau password salah.");
    else { router.push("/dashboard"); router.refresh(); }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* Left — branding panel */}
      <div
        className="md:flex hidden flex-col justify-between w-[44%] p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0a1628 0%, #0f2035 50%, #162d4a 100%)" }}
      >
        {/* Subtle grid bg */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: "#3b82f6" }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <img src="/logo-mm2100.png" alt="SMK MM2100" className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-md" />
            <img src="/logo-03.png" alt="SMK 03" className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-md" />
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-none">SMK Mitra Industri</p>
            <p className="text-white/30 text-[11px] mt-0.5">MM2100 &amp; 03</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-5">
          <div className="space-y-1">
            <h1 className="text-[42px] font-extrabold text-white leading-[1.1] tracking-tight">
              Sistem<br />
              Permintaan<br />
              <span className="text-blue-400">Konsumsi.</span>
            </h1>
            <p className="text-white/40 text-sm leading-relaxed max-w-[260px] mt-3">
              Kelola permintaan konsumsi seluruh jurusan dalam satu tempat.
            </p>
          </div>

          {/* Stats strip */}
          <div className="flex gap-5 pt-2">
            {[
              { num: "8", label: "Jurusan" },
              { num: "3", label: "Role akses" },
              { num: "100+", label: "Pengguna" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-white text-lg font-bold leading-none">{s.num}</p>
                <p className="text-white/35 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-xs">© 2026 SiPeKon</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2.5 mb-8">
            <div className="flex items-center gap-1">
              <img src="/logo-mm2100.png" alt="SMK MM2100" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
              <img src="/logo-03.png" alt="SMK 03" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
            </div>
            <div>
              <p className="text-gray-900 font-bold text-sm leading-none">SMK Mitra Industri</p>
              <p className="text-gray-400 text-xs mt-0.5">Sistem Permintaan Konsumsi</p>
            </div>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Masuk</h2>
            <p className="text-sm text-gray-400 mt-1">Gunakan username &amp; password akun kamu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="username">
                Username
              </label>
              <input
                id="username" type="text" autoComplete="username"
                placeholder="Masukkan username"
                value={username} onChange={(e) => { setUsername(e.target.value); setFieldErrors((p) => ({ ...p, username: undefined })); }}
                disabled={loading}
                className={`input-field ${fieldErrors.username ? "error" : ""}`}
              />
              {fieldErrors.username && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <span className="font-bold">!</span>{fieldErrors.username}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password" type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={password} onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                  disabled={loading}
                  className={`input-field pr-10 ${fieldErrors.password ? "error" : ""}`}
                />
                <button
                  type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <span className="font-bold">!</span>{fieldErrors.password}
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3.5 py-2.5 rounded-xl">
                <span className="font-bold text-red-500">!</span>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-1 text-sm"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" />Memproses...</>
                : "Masuk ke Sistem"
              }
            </button>
          </form>

          <p className="text-center text-gray-300 text-xs mt-8">© 2026 SiPeKon</p>
        </div>
      </div>
    </div>
  );
}
