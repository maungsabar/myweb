"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Cpu, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RefreshCw,
  Search,
  Code,
  Network,
  Shield,
  Database,
  Server,
  Globe,
  Wrench,
  Sparkles,
  Layers,
  Settings2
} from "lucide-react";
import { Skill, SkillCategory } from "@/types";

interface PopupToast {
  type: "success" | "error";
  title: string;
  message: string;
}

const ICON_PRESETS = [
  { label: "Code", value: "Code", Icon: Code },
  { label: "Network", value: "Network", Icon: Network },
  { label: "Security", value: "Shield", Icon: Shield },
  { label: "Database", value: "Database", Icon: Database },
  { label: "Server", value: "Server", Icon: Server },
  { label: "Hardware", value: "Cpu", Icon: Cpu },
  { label: "Web", value: "Globe", Icon: Globe },
  { label: "Tools", value: "Wrench", Icon: Wrench },
];

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [toast, setToast] = useState<PopupToast | null>(null);

  // Skill Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Skill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Skill Category Management Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatOrder, setNewCatOrder] = useState(0);
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [deleteCatCandidate, setDeleteCatCandidate] = useState<SkillCategory | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: "",
    category: "Programming & Web Development",
    iconName: "Code",
    order: 0,
  });

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Load Skills & Categories from API
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resSkills, resCats] = await Promise.all([
        fetch("/api/skills"),
        fetch("/api/skill-categories"),
      ]);

      const dataSkills = await resSkills.json();
      const dataCats = await resCats.json();

      if (resSkills.ok && dataSkills.success) {
        setSkills(dataSkills.data || []);
      }
      if (resCats.ok && dataCats.success) {
        setCategories(dataCats.data || []);
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Add Skill Modal
  const openAddModal = () => {
    setEditingSkillId(null);
    const defaultCat = categories.length > 0 ? categories[0].name : "Programming & Web Development";
    setForm({
      name: "",
      category: defaultCat,
      iconName: "Code",
      order: skills.length + 1,
    });
    setIsModalOpen(true);
  };

  // Open Edit Skill Modal
  const openEditModal = (skill: Skill) => {
    setEditingSkillId(skill.id);
    setForm({
      name: skill.name,
      category: skill.category,
      iconName: skill.iconName || "Code",
      order: skill.order,
    });
    setIsModalOpen(true);
  };

  // Submit Skill Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setToast({ type: "error", title: "Form Belum Lengkap", message: "Nama keahlian wajib diisi." });
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingSkillId ? `/api/skills/${editingSkillId}` : "/api/skills";
      const method = editingSkillId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category.trim(),
          iconName: form.iconName,
          order: Number(form.order) || 0,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToast({
          type: "success",
          title: editingSkillId ? "Keahlian Diperbarui" : "Keahlian Ditambahkan",
          message: editingSkillId
            ? `Keahlian "${form.name}" berhasil diperbarui.`
            : `Keahlian baru "${form.name}" berhasil ditambahkan!`,
        });
        setIsModalOpen(false);
        loadData();
      } else {
        setToast({
          type: "error",
          title: "Gagal Menyimpan",
          message: data.message || "Gagal menyimpan keahlian.",
        });
      }
    } catch {
      setToast({ type: "error", title: "Kesalahan Jaringan", message: "Terjadi kesalahan sistem." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Skill
  const handleDeleteSkill = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/skills/${deleteCandidate.id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        setToast({
          type: "success",
          title: "Keahlian Dihapus",
          message: `Keahlian "${deleteCandidate.name}" berhasil dihapus.`,
        });
        setDeleteCandidate(null);
        loadData();
      } else {
        setToast({
          type: "error",
          title: "Gagal Menghapus",
          message: data.message || "Gagal menghapus keahlian.",
        });
      }
    } catch {
      setToast({ type: "error", title: "Kesalahan Jaringan", message: "Gagal terhubung ke server." });
    } finally {
      setIsDeleting(false);
    }
  };

  // Category Form Submit (Add / Edit Category)
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setToast({ type: "error", title: "Form Belum Lengkap", message: "Nama kategori wajib diisi." });
      return;
    }

    setIsSubmittingCat(true);

    try {
      const url = editingCategoryId ? `/api/skill-categories/${editingCategoryId}` : "/api/skill-categories";
      const method = editingCategoryId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          order: Number(newCatOrder) || 0,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToast({
          type: "success",
          title: editingCategoryId ? "Kategori Diperbarui" : "Kategori Ditambahkan",
          message: data.message || "Berhasil menyimpan kategori keahlian.",
        });
        setEditingCategoryId(null);
        setNewCatName("");
        setNewCatOrder(categories.length + 1);
        loadData();
      } else {
        setToast({
          type: "error",
          title: "Gagal Menyimpan Kategori",
          message: data.message || "Gagal menyimpan kategori.",
        });
      }
    } catch {
      setToast({ type: "error", title: "Kesalahan Jaringan", message: "Terjadi kesalahan sistem." });
    } finally {
      setIsSubmittingCat(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat: SkillCategory) => {
    try {
      const res = await fetch(`/api/skill-categories/${cat.id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        setToast({
          type: "success",
          title: "Kategori Dihapus",
          message: data.message || `Kategori "${cat.name}" berhasil dihapus.`,
        });
        setDeleteCatCandidate(null);
        loadData();
      } else {
        setToast({
          type: "error",
          title: "Gagal Menghapus Kategori",
          message: data.message || "Gagal menghapus kategori.",
        });
      }
    } catch {
      setToast({ type: "error", title: "Kesalahan Jaringan", message: "Gagal terhubung ke server." });
    }
  };

  // Extract category names for filter tabs
  const categoryNamesList = ["All", ...categories.map((c) => c.name)];

  // Filter skills
  const filteredSkills = skills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === "All" || s.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const renderIcon = (iconName?: string | null) => {
    switch (iconName) {
      case "Network":
        return <Network className="h-4 w-4 text-cyan-400" />;
      case "Shield":
        return <Shield className="h-4 w-4 text-green-400" />;
      case "Database":
        return <Database className="h-4 w-4 text-yellow-400" />;
      case "Server":
        return <Server className="h-4 w-4 text-purple-400" />;
      case "Cpu":
        return <Cpu className="h-4 w-4 text-orange-400" />;
      case "Globe":
        return <Globe className="h-4 w-4 text-teal-400" />;
      case "Wrench":
        return <Wrench className="h-4 w-4 text-rose-400" />;
      default:
        return <Code className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-blue-400 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard Utama
          </Link>
          <h1 className="text-2xl font-extrabold text-zinc-50 tracking-tight flex items-center gap-2.5">
            <Cpu className="h-6 w-6 text-blue-500" />
            Kelola Keahlian &amp; Kategori
          </h1>
          <p className="text-xs text-zinc-400">
            Kelola daftar keahlian teknis dan atur kategori dinamis sesuai kebutuhan Anda.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Kelola Kategori Button */}
          <button
            type="button"
            onClick={() => {
              setEditingCategoryId(null);
              setNewCatName("");
              setNewCatOrder(categories.length + 1);
              setIsCategoryModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all"
          >
            <Layers className="h-4 w-4 text-blue-400" />
            Kelola Kategori
          </button>

          {/* Tambah Keahlian Button */}
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah Keahlian Baru
          </button>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-xl space-y-0">
        
        {/* Controls Bar: Category Filters & Search */}
        <div className="p-4 border-b border-zinc-800 space-y-3 bg-zinc-950/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto p-1 max-w-full">
              {categoryNamesList.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    selectedCategoryFilter === cat
                      ? "bg-blue-600 text-white font-bold border border-blue-400/50 shadow-md shadow-blue-600/30"
                      : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {cat === "All" ? "Semua Kategori" : cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 flex-shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari keahlian atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table / Grid Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 space-y-2">
            <Sparkles className="h-10 w-10 mx-auto text-zinc-600" />
            <p className="text-sm font-medium">Belum ada keahlian yang cocok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-3.5 px-6">Ikon</th>
                  <th className="py-3.5 px-6">Nama Keahlian</th>
                  <th className="py-3.5 px-6">Kategori</th>
                  <th className="py-3.5 px-6">Urutan</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {filteredSkills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="h-9 w-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                        {renderIcon(skill.iconName)}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-zinc-100 text-sm">
                      {skill.name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-950/60 border border-blue-500/30 text-blue-300">
                        {skill.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-zinc-400">
                      #{skill.order}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(skill)}
                          className="p-1.5 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 transition-colors"
                          title="Edit Keahlian"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(skill)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 transition-colors"
                          title="Hapus Keahlian"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* ── MODAL POPUP: FORM TAMBAH / EDIT KEAHLIAN ──────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            
            {/* Modal Header (Fixed at top) */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                  {editingSkillId ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-50 leading-tight">
                    {editingSkillId ? `Edit Keahlian #${editingSkillId}` : "Tambah Keahlian Baru"}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {editingSkillId ? "Perbarui nama, kategori, atau ikon keahlian" : "Tambahkan keahlian baru ke dalam sistem"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                aria-label="Tutup Modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Field 1: Nama Keahlian */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                  Nama Keahlian <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Cisco Networking, MikroTik, Next.js, Docker"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Field 2: Kategori Keahlian (Dynamic Dropdown) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-blue-500" />
                    Kategori Keahlian <span className="text-red-400">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsCategoryModalOpen(true);
                    }}
                    className="text-[11px] font-semibold text-blue-400 hover:underline flex items-center gap-1"
                  >
                    + Kelola Kategori
                  </button>
                </div>

                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <option value="Programming & Web Development">Programming &amp; Web Development</option>
                  )}
                </select>
              </div>

              {/* Field 3: Pilih Ikon */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-200">
                  Ikon / Simbol Visual
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_PRESETS.map(({ label, value, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, iconName: value })}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        form.iconName === value
                          ? "bg-blue-600/20 border-blue-500 text-blue-300 font-bold"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[10px]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 4: Urutan Tampilan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200">
                  Urutan Tampilan (Order Index)
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
                  placeholder="0"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>

              {/* Sticky Modal Footer */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3 sticky bottom-0 bg-zinc-900 z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : editingSkillId ? (
                    "Simpan Perubahan"
                  ) : (
                    "Tambah Keahlian"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── MODAL POPUP: KELOLA KATEGORI KEAHLIAN (DINAMIS) ────────────────── */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-50 leading-tight">
                    Pengaturan Kategori Keahlian Dinamis
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Tambah, ubah, atau hapus kategori keahlian yang muncul pada website.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                aria-label="Tutup Modal Kategori"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Form Input Category */}
              <form onSubmit={handleCategorySubmit} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-blue-500" />
                  {editingCategoryId ? "Edit Kategori" : "Tambah Kategori Baru"}
                </h4>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Nama Kategori (misal: Cybersecurity, Cloud, Networking)"
                    className="flex-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />

                  <input
                    type="number"
                    value={newCatOrder}
                    onChange={(e) => setNewCatOrder(parseInt(e.target.value, 10) || 0)}
                    placeholder="Urutan"
                    className="w-20 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 font-mono focus:border-blue-500 focus:outline-none transition-all"
                  />

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {editingCategoryId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryId(null);
                          setNewCatName("");
                          setNewCatOrder(categories.length + 1);
                        }}
                        className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors"
                      >
                        Batal
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingCat}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white disabled:opacity-50 transition-all shadow-md shadow-blue-600/20 flex-shrink-0"
                    >
                      {isSubmittingCat ? "Menyimpan..." : editingCategoryId ? "Update" : "Tambah"}
                    </button>
                  </div>
                </div>
              </form>

              {/* Existing Categories Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-200 flex items-center justify-between">
                  <span>Daftar Kategori Terdaftar</span>
                  <span className="text-[11px] text-zinc-400 font-normal">Total: {categories.length} Kategori</span>
                </h4>

                <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono uppercase text-zinc-400">
                      <tr>
                        <th className="py-2.5 px-4">Nama Kategori</th>
                        <th className="py-2.5 px-4">Urutan</th>
                        <th className="py-2.5 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-sans">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-zinc-900/60 transition-colors">
                          <td className="py-3 px-4 font-semibold text-zinc-100">
                            {cat.name}
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-400">
                            #{cat.order}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategoryId(cat.id);
                                  setNewCatName(cat.name);
                                  setNewCatOrder(cat.order);
                                }}
                                className="p-1 rounded bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                                title="Edit Kategori"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteCatCandidate(cat)}
                                className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                                title="Hapus Kategori"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end z-10">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
              >
                Selesai
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {deleteCatCandidate && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl text-center">
            <div className="h-11 w-11 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-50">Hapus Kategori?</h3>
              <p className="text-xs text-zinc-400">
                Apakah Anda yakin ingin menghapus kategori <span className="font-bold text-zinc-200">"{deleteCatCandidate.name}"</span>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setDeleteCatCandidate(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCategory(deleteCatCandidate)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-all shadow-md shadow-red-600/20"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Skill Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl text-center">
            <div className="h-11 w-11 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-50">Hapus Keahlian?</h3>
              <p className="text-xs text-zinc-400">
                Apakah Anda yakin ingin menghapus keahlian <span className="font-bold text-zinc-200">"{deleteCandidate.name}"</span>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteSkill}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-all shadow-md shadow-red-600/20"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus"
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
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors ml-auto flex-shrink-0 text-xs font-bold"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
