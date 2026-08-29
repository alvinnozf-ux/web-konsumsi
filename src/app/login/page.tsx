"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nama.trim()) return setError("Nama tidak boleh kosong.");
    if (!password) return setError("Password tidak boleh kosong.");

    setLoading(true);
    const res = await signIn("credentials", {
      nama: nama.trim(),
      password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      setError("Nama atau password salah. Silakan coba lagi.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full overflow-hidden shadow-lg mb-4 border-4 border-white/20">
            <img src="/logo.jpg" alt="Logo SMK Mitra Industri" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold text-white leading-tight">SMK Mitra Industri</h1>
          <p className="text-blue-300 text-sm mt-1">MM2100 &amp; 03</p>
          <p className="text-blue-400 text-xs mt-1">Sistem Permintaan Konsumsi</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Masuk ke Sistem</h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Nama */}
            <div>
              <label className="label" htmlFor="nama">Nama Pengguna</label>
              <input
                id="nama"
                type="text"
                autoComplete="username"
                placeholder="Masukkan nama lengkap"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className={`input-field ${error ? "error" : ""}`}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input-field pr-10 ${error ? "error" : ""}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-blue-400 text-xs mt-6">
          © 2026 Sistem Permintaan Konsumsi
        </p>
      </div>
    </div>
  );
}
