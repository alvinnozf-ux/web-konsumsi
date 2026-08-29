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
  ChevronRight,
  ClipboardCheck,
  Menu,
  X,
} from "lucide-react";

const staffNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/permintaan/baru", label: "Buat Permintaan", icon: PlusCircle },
];

const adminItems = [
  { href: "/users", label: "Manajemen User", icon: Users },
];

const approverNavItems = [
  { href: "/persetujuan", label: "Persetujuan", icon: ClipboardCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const isApprover = role === "APPROVER";
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Tutup sidebar saat navigasi
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const mainNavItems = isApprover ? approverNavItems : staffNavItems;

  function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          active
            ? "bg-blue-600 text-white"
            : "text-blue-100 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon size={18} />
        <span>{label}</span>
        {active && <ChevronRight size={14} className="ml-auto" />}
      </Link>
    );
  }

  const SidebarContent = ({ showClose }: { showClose?: boolean }) => (
    <aside className="no-print w-64 min-h-screen flex flex-col" style={{ backgroundColor: "#1e3a5f" }}>
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="Logo SMK Mitra Industri"
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-white/20"
          />
          <div className="min-w-0">
            <p className="text-white font-semibold text-xs leading-tight">SMK Mitra Industri</p>
            <p className="text-blue-300 text-xs leading-tight">MM2100 &amp; 03</p>
          </div>
          {showClose && (
            <button
              onClick={() => setOpen(false)}
              className="ml-auto text-blue-300 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">Menu</p>
        {mainNavItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
        {isAdmin && (
          <>
            <p className="px-3 pt-4 pb-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">Admin</p>
            {adminItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </>
        )}
        {isApprover && (
          <div className="mt-4 mx-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-blue-300">
              Anda login sebagai <span className="font-semibold text-white">Approver</span>
            </p>
            <p className="text-xs text-blue-400 mt-0.5">Akses terbatas pada persetujuan permintaan</p>
          </div>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 mb-3">
          <p className="text-white text-sm font-medium truncate">{session?.user?.name}</p>
          <p className="text-blue-300 text-xs truncate">
            {role === "ADMIN" ? "Admin" : role === "APPROVER" ? "Approver" : "Staff"}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-blue-100 hover:bg-red-600/20 hover:text-red-300 transition-colors"
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );

  // Desktop: sidebar permanent
  if (isDesktop) {
    return <SidebarContent />;
  }

  // Mobile: hamburger + slide-in
  return (
    <>
      {/* Tombol hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="no-print fixed top-3 left-3 z-50 bg-[#1e3a5f] text-white p-2 rounded-lg shadow-lg"
        style={{ display: open ? "none" : "flex" }}
      >
        <Menu size={22} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar slide-in */}
      <div
        className="fixed inset-y-0 left-0 z-50 transition-transform duration-300"
        style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}
      >
        <SidebarContent showClose />
      </div>
    </>
  );
}
