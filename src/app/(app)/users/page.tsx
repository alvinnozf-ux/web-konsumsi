"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Loader2, X, Save, Users, Search } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";

type User = {
  id: string;
  username: string;
  nama: string;
  role: "ADMIN" | "STAFF" | "APPROVER";
  createdAt: string;
  _count?: { permintaan: number };
};

type FormData = {
  username: string;
  nama: string;
  role: "ADMIN" | "STAFF" | "APPROVER";
  password: string;
};

const emptyForm: FormData = { username: "", nama: "", role: "STAFF", password: "" };

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users,         setUsers]         = useState<User[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [formOpen,      setFormOpen]      = useState(false);
  const [editTarget,    setEditTarget]    = useState<User | null>(null);
  const [formData,      setFormData]      = useState<FormData>(emptyForm);
  const [formErrors,    setFormErrors]    = useState<Record<string, string>>({});
  const [saving,        setSaving]        = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      toast.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function openCreateForm() {
    setEditTarget(null);
    setFormData(emptyForm);
    setFormErrors({});
    setFormOpen(true);
  }

  function openEditForm(user: User) {
    setEditTarget(user);
    setFormData({ username: user.username, nama: user.nama, role: user.role, password: "" });
    setFormErrors({});
    setFormOpen(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!formData.username.trim()) e.username = "Username wajib diisi";
    else if (!/^[a-z0-9_.]+$/.test(formData.username)) e.username = "Hanya huruf kecil, angka, titik, underscore";
    if (!formData.nama.trim()) e.nama = "Nama wajib diisi";
    if (!editTarget && !formData.password) e.password = "Password wajib diisi untuk user baru";
    if (formData.password && formData.password.length < 6) e.password = "Password minimal 6 karakter";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const payload: Record<string, string> = {
      username: formData.username.trim(),
      nama:     formData.nama.trim(),
      role:     formData.role,
    };
    if (formData.password) payload.password = formData.password;
    try {
      const url    = editTarget ? `/api/users/${editTarget.id}` : "/api/users";
      const method = editTarget ? "PATCH" : "POST";
      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan");
      toast.success(editTarget ? "User berhasil diperbarui" : "User berhasil dibuat");
      setFormOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res  = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menghapus");
      toast.success("User berhasil dihapus");
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  const formatDate = (str: string) =>
    new Date(str).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  const roleLabel = (role: string) => ({ ADMIN: "Admin", APPROVER: "Approver", STAFF: "Staff" }[role] ?? role);

  const roleBadge = (role: string) => {
    if (role === "ADMIN")    return { wrap: "bg-amber-50 text-amber-700 border border-amber-200/80", dot: "bg-amber-500" };
    if (role === "APPROVER") return { wrap: "bg-sky-50 text-sky-700 border border-sky-200/80", dot: "bg-sky-500" };
    return { wrap: "bg-gray-50 text-gray-700 border border-gray-200/80", dot: "bg-gray-400" };
  };

  if (status === "loading") return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-600" size={28} />
    </div>
  );

  // Filter client-side (semua user sudah diload sekaligus)
  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.nama.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users size={20} className="text-blue-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manajemen User</h1>
            <p className="text-sm text-gray-500">
              {search ? `${filteredUsers.length} dari ${users.length}` : `${users.length}`} user terdaftar
            </p>
          </div>
        </div>
        <button onClick={openCreateForm} className="btn-primary">
          <Plus size={16} />Tambah User
        </button>
      </div>

      {/* Search bar */}
      <div className="card p-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, username, atau role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tabel — desktop */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="table-th">Nama</th>
                <th className="table-th">Username</th>
                <th className="table-th">Role</th>
                <th className="table-th">Permintaan</th>
                <th className="table-th">Bergabung</th>
                <th className="table-th text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <Loader2 className="animate-spin mx-auto text-blue-600" size={28} />
                </td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <Search size={28} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400 text-sm font-medium">Tidak ada user ditemukan</p>
                  <p className="text-gray-300 text-xs mt-1">Coba ubah kata kunci pencarian</p>
                </td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.id === session?.user?.id ? "bg-blue-50/50" : ""}`}>
                  <td className="table-td font-medium">
                    {user.nama}
                    {user.id === session?.user?.id && <span className="ml-2 text-xs text-blue-600 font-normal">(Anda)</span>}
                  </td>
                  <td className="table-td">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{user.username}</span>
                  </td>
                  <td className="table-td">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${roleBadge(user.role).wrap}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${roleBadge(user.role).dot}`} />
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className="table-td text-gray-600">{user._count?.permintaan ?? 0}</td>
                  <td className="table-td text-gray-500 text-xs">{formatDate(user.createdAt)}</td>
                  <td className="table-td">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditForm(user)}
                        className="p-1.5 rounded-md text-gray-500 hover:bg-yellow-50 hover:text-yellow-700 transition-colors" title="Edit">
                        <Pencil size={15} />
                      </button>
                      {user.id !== session?.user?.id && (
                        <button onClick={() => setDeleteTarget(user)}
                          className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Hapus">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card view — mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-16 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={28} /></div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center">
            <Search size={28} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm font-medium">Tidak ada user ditemukan</p>
            <p className="text-gray-300 text-xs mt-1">Coba ubah kata kunci pencarian</p>
          </div>
        ) : filteredUsers.map((user) => (
          <div key={user.id} className={`card p-4 space-y-2 ${user.id === session?.user?.id ? "border-blue-200" : ""}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {user.nama}
                  {user.id === session?.user?.id && <span className="ml-1 text-xs text-blue-600">(Anda)</span>}
                </p>
                <p className="text-xs font-mono text-gray-400 mt-0.5">@{user.username}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${roleBadge(user.role).wrap}`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${roleBadge(user.role).dot}`} />
                {roleLabel(user.role)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">{user._count?.permintaan ?? 0} permintaan · {formatDate(user.createdAt)}</p>
              <div className="flex gap-2">
                <button onClick={() => openEditForm(user)} className="btn-secondary py-1.5 px-3 text-xs">
                  <Pencil size={13} />Edit
                </button>
                {user.id !== session?.user?.id && (
                  <button onClick={() => setDeleteTarget(user)} className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFormOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {editTarget ? "Edit User" : "Tambah User Baru"}
              </h2>
              <button onClick={() => setFormOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">

              {/* Username */}
              <div>
                <label className="label" htmlFor="f-username">Username</label>
                <input
                  id="f-username" type="text" placeholder="contoh: budi.santoso"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, username: e.target.value.toLowerCase() }));
                    setFormErrors((p) => { const n = { ...p }; delete n.username; return n; });
                  }}
                  className={`input-field font-mono ${formErrors.username ? "error" : ""}`}
                  autoComplete="off"
                />
                <p className="text-[11px] text-gray-400 mt-1">Huruf kecil, angka, titik, underscore. Dipakai untuk login.</p>
                {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
              </div>

              {/* Nama */}
              <div>
                <label className="label" htmlFor="f-nama">Nama Lengkap</label>
                <input
                  id="f-nama" type="text" placeholder="Masukkan nama lengkap"
                  value={formData.nama}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, nama: e.target.value }));
                    setFormErrors((p) => { const n = { ...p }; delete n.nama; return n; });
                  }}
                  className={`input-field ${formErrors.nama ? "error" : ""}`}
                />
                {formErrors.nama && <p className="text-red-500 text-xs mt-1">{formErrors.nama}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="label" htmlFor="f-role">Role</label>
                <select id="f-role" value={formData.role}
                  onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value as FormData["role"] }))}
                  className="input-field">
                  <option value="STAFF">Staff</option>
                  <option value="APPROVER">Approver</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="label" htmlFor="f-password">
                  {editTarget ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
                </label>
                <input
                  id="f-password" type="password" placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, password: e.target.value }));
                    setFormErrors((p) => { const n = { ...p }; delete n.password; return n; });
                  }}
                  className={`input-field ${formErrors.password ? "error" : ""}`}
                  autoComplete="new-password"
                />
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setFormOpen(false)} className="btn-secondary">Batal</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving
                  ? <><Loader2 size={14} className="animate-spin" />Menyimpan...</>
                  : <><Save size={14} />{editTarget ? "Simpan Perubahan" : "Buat User"}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus User"
        message={`Yakin ingin menghapus "${deleteTarget?.nama}" (@${deleteTarget?.username})? Permintaan yang dibuat oleh user ini akan tetap ada.`}
        confirmLabel="Hapus"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
