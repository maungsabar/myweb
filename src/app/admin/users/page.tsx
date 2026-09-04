"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Key, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  RefreshCw,
  Lock,
  User,
  Eye,
  EyeOff
} from "lucide-react";
import { Admin } from "@/types";

interface PopupToast {
  type: "success" | "error";
  title: string;
  message: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<PopupToast | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Active User for Edit/Delete
  const [selectedUser, setSelectedUser] = useState<Admin | null>(null);

  // Add Form State
  const [addForm, setAddForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete State
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Fetch all users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.data || []);
      } else {
        setToast({
          type: "error",
          title: "Gagal Memuat Data",
          message: data.message || "Gagal mengambil daftar user.",
        });
      }
    } catch {
      setToast({
        type: "error",
        title: "Kesalahan Jaringan",
        message: "Tidak dapat terhubung ke server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addForm.username.trim()) {
      setToast({ type: "error", title: "Form Tidak Lengkap", message: "Username tidak boleh kosong." });
      return;
    }

    if (!addForm.password || addForm.password.length < 6) {
      setToast({ type: "error", title: "Password Lemah", message: "Password minimal 6 karakter." });
      return;
    }

    if (addForm.password !== addForm.confirmPassword) {
      setToast({ type: "error", title: "Password Tidak Cocok", message: "Konfirmasi password tidak cocok." });
      return;
    }

    setIsSubmittingAdd(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: addForm.username.trim(),
          password: addForm.password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToast({
          type: "success",
          title: "User Berhasil Ditambahkan",
          message: data.message || `User admin ${addForm.username} berhasil dibuat.`,
        });
        setAddForm({ username: "", password: "", confirmPassword: "" });
        setIsAddModalOpen(false);
        fetchUsers();
      } else {
        setToast({
          type: "error",
          title: "Gagal Menambahkan User",
          message: data.message || "Gagal membuat user admin.",
        });
      }
    } catch {
      setToast({ type: "error", title: "Kesalahan Jaringan", message: "Terjadi kesalahan jaringan." });
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (user: Admin) => {
    setSelectedUser(user);
    setEditForm({ username: user.username, password: "", confirmPassword: "" });
    setIsEditModalOpen(true);
  };

  // Handle Edit User / Change Password
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!editForm.username.trim()) {
      setToast({ type: "error", title: "Form Tidak Lengkap", message: "Username tidak boleh kosong." });
      return;
    }

    if (editForm.password && editForm.password.length < 6) {
      setToast({ type: "error", title: "Password Lemah", message: "Password minimal 6 karakter." });
      return;
    }

    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      setToast({ type: "error", title: "Password Tidak Cocok", message: "Konfirmasi password baru tidak cocok." });
      return;
    }

    setIsSubmittingEdit(true);

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editForm.username.trim(),
          ...(editForm.password ? { password: editForm.password } : {}),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToast({
          type: "success",
          title: "User Berhasil Diperbarui",
          message: data.message || "Data user & password berhasil diubah.",
        });
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        setToast({
          type: "error",
          title: "Gagal Memperbarui",
          message: data.message || "Gagal menyimpan perubahan.",
        });
      }
    } catch {
      setToast({ type: "error", title: "Kesalahan Jaringan", message: "Terjadi kesalahan jaringan." });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (user: Admin) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToast({
          type: "success",
          title: "User Dihapus",
          message: data.message || `User admin ${selectedUser.username} berhasil dihapus.`,
        });
        setIsDeleteModalOpen(false);
        fetchUsers();
      } else {
        setToast({
          type: "error",
          title: "Gagal Menghapus",
          message: data.message || "Tidak dapat menghapus akun admin.",
        });
      }
    } catch {
      setToast({ type: "error", title: "Kesalahan Jaringan", message: "Terjadi kesalahan jaringan." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-blue-400 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard Admin
          </Link>
          <h1 className="text-2xl font-extrabold text-zinc-50 tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-blue-500" />
            Kelola User &amp; Password Admin
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all duration-200 self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          Tambah User Baru
        </button>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold text-zinc-100">Daftar Akun Administrator</h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            Total: {users.length} Akun
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 space-y-2">
            <User className="h-10 w-10 mx-auto text-zinc-600" />
            <p className="text-sm font-medium">Belum ada akun admin terdaftar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 text-[11px] font-mono text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Username Administrator</th>
                  <th className="px-6 py-3.5">Akses Role</th>
                  <th className="px-6 py-3.5 text-right">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-zinc-400">#{user.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-zinc-100 text-sm">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-950/80 border border-blue-500/40 text-blue-300">
                        Super Administrator
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white transition-all text-xs font-medium"
                        >
                          <Key className="h-3.5 w-3.5 text-blue-400" />
                          Edit / Ganti Password
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 text-red-400 hover:text-red-300 transition-all text-xs font-medium"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL 1: TAMBAH USER BARU ──────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <UserPlus className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-50">Tambah User Admin Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-500" />
                  Username Admin <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.username}
                  onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                  placeholder="Contoh: admin_utama"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-blue-500" />
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showAddPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-800 pl-3.5 pr-10 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
                  >
                    {showAddPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-blue-500" />
                  Konfirmasi Password <span className="text-red-400">*</span>
                </label>
                <input
                  type={showAddPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={addForm.confirmPassword}
                  onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                  placeholder="Ulangi password di atas"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20"
                >
                  {isSubmittingAdd ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Buat User Admin"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EDIT USER & GANTI PASSWORD ────────────────────────────── */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-50">Edit User &amp; Password</h3>
                  <p className="text-[11px] text-zinc-400">ID Account: #{selectedUser.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-500" />
                  Username Admin <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="Username..."
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-blue-500" />
                    Password Baru (Opsional)
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">Kosongkan jika tak diubah</span>
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    minLength={6}
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Ketik password baru jika ingin mengubah"
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-800 pl-3.5 pr-10 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
                  >
                    {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {editForm.password && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-blue-500" />
                    Konfirmasi Password Baru <span className="text-red-400">*</span>
                  </label>
                  <input
                    type={showEditPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={editForm.confirmPassword}
                    onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                    placeholder="Ulangi password baru"
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20"
                >
                  {isSubmittingEdit ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Memperbarui...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: KONFIRMASI HAPUS USER ─────────────────────────────────── */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-5 text-center">
            <div className="h-12 w-12 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-zinc-50">Hapus Akun Admin?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun admin{" "}
                <span className="font-bold text-zinc-200">"{selectedUser.username}"</span>? Akses akun ini akan dicabut secara permanen.
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-all shadow-md shadow-red-600/20"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus Akun"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3.5 px-4 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 max-w-md ${
            toast.type === "success"
              ? "bg-zinc-900/95 border-green-500/50 text-green-300 shadow-green-950/40"
              : "bg-zinc-900/95 border-red-500/50 text-red-300 shadow-red-950/40"
          }`}
        >
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              toast.type === "success"
                ? "bg-green-600/20 text-green-400 border border-green-500/30"
                : "bg-red-600/20 text-red-400 border border-red-500/30"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>

          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs font-bold text-zinc-100">{toast.title}</span>
            <span className="text-xs text-zinc-300 leading-tight mt-0.5">{toast.message}</span>
          </div>

          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors ml-auto flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
