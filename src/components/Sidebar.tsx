"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  LogOut,
  ClipboardCheck,
  Menu,
  X,
  ChevronRight,
  Utensils,
} from "lucide-react";

const staffNavItems = [
  { href: "/dashboard",       label: "Dashboard",       icon: LayoutDashboard },
  { href: "/permintaan/baru", label: "Buat Permintaan", icon: PlusCircle },
];
const adminItems = [
  { href: "/users", label: "Manajemen User", icon: Users },
];
const approverNavItems = [
  { href: "/persetujuan", label: "Persetujuan", icon: ClipboardCheck },
];

const ROLE_CONFIG = {
  ADMIN:    { label: "Admin",    bg: "bg-amber-400/20",  text: "text-amber-300",  dot: "bg-amber-400" },
  APPROVER: { label: "Approver", bg: "bg-sky-400/20",    text: "text-sky-300",    dot: "bg-sky-400" },
  STAFF:    { label: "Staff",    bg: "bg-white/10",      text: "text-blue-200",   dot: "bg-blue-300" },
} as const;

// NavLink dipindah ke luar komponen agar tidak di-recreate setiap render
function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-white shadow-sm"
          : "text-white/60 hover:bg-white-8 hover:text-white"
      }`}
      style={isActive ? { color: "#162d4a" } : undefined}
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
          isActive ? "" : "bg-white/5 group-hover:bg-white/10"
        }`}
        style={isActive ? { backgroundColor: "rgba(22, 45, 74, 0.1)" } : undefined}
      >
        <Icon
          size={15}
          className={isActive ? "" : "text-white/50 group-hover:text-white"}
          style={isActive ? { color: "#162d4a" } : undefined}
        />
      </div>
      <span className="flex-1 text-[13px]">{label}</span>
      {isActive && (
        <ChevronRight size={13} style={{ color: "rgba(22, 45, 74, 0.4)" }} />
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname   = usePathname();
  const { data: session } = useSession();
  const role       = session?.user?.role as keyof typeof ROLE_CONFIG | undefined;
  const isAdmin    = role === "ADMIN";
  const isApprover = role === "APPROVER";
  const [open, setOpen]           = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const mainNavItems = isApprover ? approverNavItems : staffNavItems;
  const roleCfg = ROLE_CONFIG[role ?? "STAFF"];
  const initial = session?.user?.name?.charAt(0)?.toUpperCase() ?? "?";

  function SidebarContent({ onClose }: { onClose?: () => void }) {
    return (
      <aside
        className="no-print w-64 h-full min-h-screen flex flex-col"
        style={{
          background: "linear-gradient(160deg, #0f2035 0%, #162d4a 60%, #1a3354 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="relative flex-shrink-0">
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/15 shadow-lg">
                  <img src="/logo-mm2100.png" alt="MM2100" className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/15 shadow-lg">
                  <img src="/logo-03.png" alt="03" className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#162d4a]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[13px] leading-tight truncate">SMK Mitra Industri</p>
              <p className="text-white/35 text-[11px] leading-tight">MM2100 &amp; 03</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* App name pill */}
          <div
            className="mt-4 flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Utensils size={12} className="text-blue-400 flex-shrink-0" />
            <span className="text-[11px] font-semibold text-white/50 tracking-wide uppercase">SiPeKon</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <p className="px-3 pb-2 pt-1 text-[9px] font-bold text-white/25 uppercase tracking-[0.15em]">
            Navigasi
          </p>
          {mainNavItems.map((item) => (
            <NavLink key={item.href} {...item} isActive={isActive(item.href)} />
          ))}

          {isAdmin && (
            <>
              <p className="px-3 pt-5 pb-2 text-[9px] font-bold text-white/25 uppercase tracking-[0.15em]">
                Admin
              </p>
              {adminItems.map((item) => (
                <NavLink key={item.href} {...item} isActive={isActive(item.href)} />
              ))}
            </>
          )}

          {isApprover && (
            <div
              className="mt-4 mx-1 p-3 rounded-xl"
              style={{
                backgroundColor: "rgba(14, 165, 233, 0.08)",
                border: "1px solid rgba(56, 189, 248, 0.15)",
              }}
            >
              <p className="text-[11px] text-sky-300/80 leading-relaxed">
                Akses terbatas pada halaman <span className="text-sky-300 font-semibold">persetujuan</span>.
              </p>
            </div>
          )}
        </nav>

        {/* User */}
        <div
          className="px-3 py-4"
          style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}
        >
          <div className="flex items-center gap-2.5 px-2 mb-2">
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" }}
            >
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[12px] font-semibold truncate leading-tight">{session?.user?.name}</p>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md mt-0.5 ${roleCfg.bg} ${roleCfg.text}`}
              >
                <span className={`w-1 h-1 rounded-full ${roleCfg.dot}`} />
                {roleCfg.label}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-3 py-2 w-full rounded-xl text-[12px] font-medium text-white/35 hover:text-red-300 transition-all duration-150 mt-1"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    );
  }

  if (isDesktop) return <SidebarContent />;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="no-print fixed top-4 left-4 z-50 p-2 rounded-xl text-white transition-all shadow-lg"
        style={{
          background: "linear-gradient(135deg, #162d4a 0%, #0f2035 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          display: open ? "none" : "flex",
        }}
        aria-label="Buka menu"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className="fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out"
        style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}
      >
        <SidebarContent onClose={() => setOpen(false)} />
      </div>
    </>
  );
}
