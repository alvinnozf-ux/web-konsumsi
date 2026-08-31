"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const fe: typeof fieldErrors = {};
    if (!username.trim()) fe.username = "Username tidak boleh kosong.";
    if (!password) fe.password = "Password tidak boleh kosong.";
    if (Object.keys(fe).length > 0) { setFieldErrors(fe); return; }
    setFieldErrors({});
    setLoading(true);
    const res = await signIn("credentials", { username: username.trim(), password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Username atau password salah.");
    else { router.push("/dashboard"); router.refresh(); }
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-end justify-center pb-10"
      style={{ background: "#f5f0e8" }}
    >
      {/* ── Top decorative navy area ── */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "55%",
          background: "linear-gradient(160deg, #0a1628 0%, #0f2035 50%, #1e3a6e 100%)",
          borderBottomLeftRadius: "36px",
          borderBottomRightRadius: "36px",
        }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            borderBottomLeftRadius: "36px",
            borderBottomRightRadius: "36px",
          }}
        />

        {/* Floating decorative shapes */}
        {/* Moon besar kanan atas */}
        <div
          className="absolute top-8 right-10 w-9 h-9 rounded-full"
          style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", opacity: 0.85 }}
        />
        {/* Moon kecil */}
        <div
          className="absolute top-16 right-[72px] w-4 h-4 rounded-full"
          style={{ background: "#fcd34d", opacity: 0.5 }}
        />
        {/* Red diamond kiri */}
        <div
          className="absolute top-10 left-14 w-3 h-3 rotate-45"
          style={{ background: "#f87171", opacity: 0.7 }}
        />
        {/* Plus sign */}
        <div
          className="absolute top-[72px] left-[38%] text-white/20 text-xl font-light select-none"
        >+</div>
        {/* Blob glow kiri */}
        <div
          className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl"
          style={{ background: "#3b82f6", opacity: 0.07 }}
        />
        {/* Blob glow kanan */}
        <div
          className="absolute top-4 right-1/3 w-24 h-24 rounded-full blur-2xl"
          style={{ background: "#818cf8", opacity: 0.08 }}
        />

        {/* Logo + nama app */}
        <div className="absolute top-10 left-0 right-0 flex flex-col items-center gap-2.5">
          <div className="flex items-center gap-2">
            <img
              src="/logo-mm2100.png" alt="MM2100"
              className="w-11 h-11 rounded-full object-cover shadow-lg"
              style={{ border: "2px solid rgba(255,255,255,0.2)" }}
            />
            <img
              src="/logo-03.png" alt="03"
              className="w-11 h-11 rounded-full object-cover shadow-lg"
              style={{ border: "2px solid rgba(255,255,255,0.2)" }}
            />
          </div>
          <p className="text-white font-bold text-base tracking-wide">SiPeKon</p>
          <p className="text-white/40 text-xs">SMK Mitra Industri MM2100 &amp; 03</p>
        </div>
      </div>

      {/* ── Floating white card ── */}
      <div className="relative z-10 w-full px-4" style={{ maxWidth: "420px" }}>
        <div
          className="bg-white rounded-3xl px-7 pt-8 pb-8"
          style={{
            boxShadow: "0 24px 64px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <h2 className="text-[26px] font-extrabold text-gray-900 tracking-tight mb-1">
            Masuk
          </h2>
          <p className="text-sm text-gray-400 mb-7">
            Gunakan username &amp; password akun kamu
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username */}
            <div>
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setFieldErrors((p) => ({ ...p, username: undefined }));
                }}
                disabled={loading}
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none py-2.5 transition-colors"
                style={{
                  borderBottom: `1.5px solid ${fieldErrors.username ? "#f87171" : "#e5e7eb"}`,
                }}
                onFocus={(e) => {
                  if (!fieldErrors.username) e.target.style.borderBottomColor = "#3b82f6";
                }}
                onBlur={(e) => {
                  if (!fieldErrors.username) e.target.style.borderBottomColor = "#e5e7eb";
                }}
              />
              {fieldErrors.username && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((p) => ({ ...p, password: undefined }));
                  }}
                  disabled={loading}
                  className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none py-2.5 pr-8 transition-colors"
                  style={{
                    borderBottom: `1.5px solid ${fieldErrors.password ? "#f87171" : "#e5e7eb"}`,
                  }}
                  onFocus={(e) => {
                    if (!fieldErrors.password) e.target.style.borderBottomColor = "#3b82f6";
                  }}
                  onBlur={(e) => {
                    if (!fieldErrors.password) e.target.style.borderBottomColor = "#e5e7eb";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs px-3.5 py-2.5 rounded-xl">
                <span className="font-bold">!</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full text-white text-sm font-bold tracking-wide transition-all duration-150 hover:opacity-90 active:scale-[.98] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #2a4a8a 0%, #0f2035 100%)",
                  boxShadow: "0 6px 20px rgba(15,32,53,0.35)",
                }}
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" />Memproses...</>
                ) : (
                  "Masuk"
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-5">© 2026 SiPeKon</p>
      </div>
    </div>
  );
}
