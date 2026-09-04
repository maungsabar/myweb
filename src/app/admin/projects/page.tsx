"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  FolderKanban, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  ServerCrash,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  X,
  Upload,
  Image as ImageIcon,
  Heading,
  FileText,
  Layers,
  Link2
} from "lucide-react";
import { Project } from "@/types";

interface PopupToast {
  type: "success" | "error";
  title: string;
  message: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [deleteCandidate, setDeleteCandidate] = useState<Project | null>(null);
  const [toast, setToast] = useState<PopupToast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // ── MODAL POPUP STATES FOR ADD & EDIT ──
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);

  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    techStack: "",
    projectUrl: "",
  });

  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.data || []);
      } else {
        setFetchError("Gagal memuat data proyek dari server.");
      }
    } catch {
      setFetchError("Tidak dapat terhubung ke server. Pastikan database aktif.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset to page 1 when search or entriesPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  // Open Modal for Creating New Project
  const openAddModal = () => {
    setEditingProjectId(null);
    setProjectForm({
      title: "",
      description: "",
      imageUrl: "",
      techStack: "",
      projectUrl: "",
    });
    setUploadMode("file");
    setIsProjectModalOpen(true);
  };

  // Open Modal for Editing Existing Project
  const openEditModal = (project: Project) => {
    setEditingProjectId(project.id);
    setProjectForm({
      title: project.title,
      description: project.description,
      imageUrl: project.imageUrl,
      techStack: project.techStack,
      projectUrl: project.projectUrl || "",
    });
    setUploadMode("file");
    setIsProjectModalOpen(true);
  };

  // Direct Image File Upload to /api/upload
  const handleFileUpload = async (file: File) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setToast({
        type: "error",
        title: "Format Tidak Didukung",
        message: "Gunakan gambar berformat PNG, JPG, WebP, SVG, atau GIF.",
      });
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setToast({
        type: "error",
        title: "Ukuran Terlalu Besar",
        message: "Ukuran file gambar maksimal 4MB.",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setProjectForm((prev) => ({ ...prev, imageUrl: data.data.url }));
        setToast({
          type: "success",
          title: "Gambar Berhasil Diupload",
          message: "File gambar proyek berhasil diunggah.",
        });
      } else {
        setToast({
          type: "error",
          title: "Upload Gagal",
          message: data.message || "Gagal mengunggah file gambar.",
        });
      }
    } catch {
      setToast({
        type: "error",
        title: "Kesalahan Jaringan",
        message: "Tidak dapat terhubung ke server upload.",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  // Submit Add or Edit Project Form
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectForm.title.trim() || !projectForm.description.trim() || !projectForm.techStack.trim()) {
      setToast({
        type: "error",
        title: "Data Belum Lengkap",
        message: "Harap isi seluruh kolom wajib (Judul, Deskripsi, dan Tech Stack).",
      });
      return;
    }

    setIsSubmittingProject(true);

    try {
      const url = editingProjectId ? `/api/projects/${editingProjectId}` : "/api/projects";
      const method = editingProjectId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectForm.title.trim(),
          description: projectForm.description.trim(),
          imageUrl: projectForm.imageUrl.trim() || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
          techStack: projectForm.techStack.trim(),
          projectUrl: projectForm.projectUrl.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToast({
          type: "success",
          title: editingProjectId ? "Proyek Diperbarui" : "Proyek Dibuat",
          message: editingProjectId
            ? `Perubahan proyek "${projectForm.title}" berhasil disimpan.`
            : `Proyek baru "${projectForm.title}" telah ditambahkan!`,
        });
        setIsProjectModalOpen(false);
        loadData();
      } else {
        setToast({
          type: "error",
          title: "Gagal Menyimpan",
          message: data.message || "Gagal menyimpan data proyek.",
        });
      }
    } catch {
      setToast({
        type: "error",
        title: "Kesalahan Jaringan",
        message: "Terjadi kesalahan jaringan. Silakan coba lagi.",
      });
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/projects/${deleteCandidate.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToast({
          type: "success",
          title: "Proyek Dihapus",
          message: `Proyek "${deleteCandidate.title}" berhasil dihapus.`,
        });
        await loadData();
      } else {
        setToast({
          type: "error",
          title: "Gagal Menghapus",
          message: data.message || "Gagal menghapus proyek.",
        });
      }
    } catch {
      setToast({
        type: "error",
        title: "Kesalahan Jaringan",
        message: "Terjadi kesalahan jaringan saat menghapus proyek.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteCandidate(null);
    }
  };

  // Filter projects by search query
  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.techStack.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculation
  const totalEntries = filteredProjects.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Header & Breadcrumbs */}
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
            <FolderKanban className="h-6 w-6 text-blue-500" />
            Daftar Proyek Portofolio
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all disabled:opacity-50"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {/* Trigger Popup Modal for Add Project */}
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4" />
            Tambah Proyek Baru
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900">
          <ServerCrash className="h-10 w-10 text-zinc-600" />
          <p className="text-sm font-semibold text-zinc-300">{fetchError}</p>
          <button onClick={loadData} className="text-xs text-blue-400 hover:underline">
            Coba Muat Ulang
          </button>
        </div>
      )}

      {/* Projects Table Card */}
      {!fetchError && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-xl">
          
          {/* Controls Bar: Show Entries & Search Filter */}
          <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/40">
            
            {/* Show entries selector */}
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <ListFilter className="h-4 w-4 text-blue-400" />
              <span>Tampilkan</span>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>proyek per halaman</span>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari judul, deskripsi, atau tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

          </div>

          {/* Table Content */}
          {isLoading ? (
            <div className="p-16 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">Info Proyek</th>
                    <th className="py-3.5 px-4">Tech Stack</th>
                    <th className="py-3.5 px-4">Tautan Demo</th>
                    <th className="py-3.5 px-4">Tanggal Buat</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {currentProjects.length > 0 ? (
                    currentProjects.map((project) => {
                      const techList = project.techStack
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean);

                      const formattedDate = new Date(project.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });

                      return (
                        <tr key={project.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-4 px-4 font-mono font-medium text-blue-400">
                            #{project.id}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={project.imageUrl}
                                alt={project.title}
                                className="h-10 w-14 rounded-md object-cover border border-zinc-800 bg-zinc-950 flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=200&auto=format&fit=crop";
                                }}
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-zinc-100 text-xs truncate max-w-[220px]">
                                  {project.title}
                                </span>
                                <span className="text-[11px] text-zinc-400 truncate max-w-[240px]">
                                  {project.description}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {techList.slice(0, 3).map((t, idx) => (
                                <span
                                  key={idx}
                                  className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300"
                                >
                                  {t}
                                </span>
                              ))}
                              {techList.length > 3 && (
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  +{techList.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono">
                            {project.projectUrl ? (
                              <a
                                href={project.projectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-400 hover:underline text-[11px]"
                              >
                                <Globe className="h-3 w-3" />
                                Live Demo ↗
                              </a>
                            ) : (
                              <span className="text-zinc-500 text-[11px] italic">Tidak Ada</span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-mono text-zinc-400 text-[11px]">
                            {formattedDate}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/projects/${project.id}`}
                                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
                                title="Lihat Detail Publik"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Link>

                              {/* Trigger Popup Modal for Edit Project */}
                              <button
                                type="button"
                                onClick={() => openEditModal(project)}
                                className="p-1.5 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 transition-colors"
                                title="Edit Data Proyek"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteCandidate(project)}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 transition-colors"
                                title="Hapus Proyek"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500">
                        {searchQuery
                          ? "Tidak ada proyek yang cocok dengan kata kunci pencarian."
                          : "Belum ada proyek terdaftar. Klik \"Tambah Proyek Baru\" di atas untuk memulai."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Bar: Pagination Controls */}
          {!isLoading && totalEntries > 0 && (
            <div className="px-5 py-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950/40">
              <div className="text-xs text-zinc-400 font-mono">
                Menampilkan <span className="text-zinc-100 font-bold">{startIndex + 1}</span> -{" "}
                <span className="text-zinc-100 font-bold">{endIndex}</span> dari{" "}
                <span className="text-blue-400 font-bold">{totalEntries}</span> proyek
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-semibold text-zinc-200 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </button>

                <div className="flex items-center gap-1 px-2 font-mono text-xs text-zinc-300">
                  <span className="text-blue-400 font-bold">{currentPage}</span> / {totalPages}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-semibold text-zinc-200 transition-colors"
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── MODAL POPUP: FORM TAMBAH / EDIT PROYEK ────────────────────────── */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            
            {/* Modal Header (Fixed at top) */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                  {editingProjectId ? <Edit3 className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-50 leading-tight">
                    {editingProjectId ? `Edit Data Proyek #${editingProjectId}` : "Tambah Proyek Baru"}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {editingProjectId ? "Perbarui informasi dan tampilan proyek Anda" : "Isi rincian proyek portofolio baru Anda"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                aria-label="Tutup Popup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form with Scrollable Body */}
            <form onSubmit={handleSaveProject} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Field 1: Judul Proyek */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Heading className="h-3.5 w-3.5 text-blue-500" />
                  Judul Proyek <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="Contoh: E-Commerce Platform Next.js"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Field 2: Deskripsi Singkat */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  Deskripsi Singkat Proyek <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Tuliskan 2-3 kalimat penjelasan mengenai fitur utama proyek..."
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Field 3: Tech Stack */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-blue-500" />
                  Tech Stack / Teknologi <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectForm.techStack}
                  onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                  placeholder="Pisahkan dengan koma, contoh: Next.js, React, Tailwind CSS, TypeScript"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Field 4: Gambar Proyek (Direct Upload / Custom Link) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
                    Gambar Header / Preview Proyek
                  </label>

                  <div className="flex items-center rounded-lg bg-zinc-950 border border-zinc-800 p-0.5 text-[11px] font-medium">
                    <button
                      type="button"
                      onClick={() => setUploadMode("file")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        uploadMode === "file"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode("url")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        uploadMode === "url"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Link URL
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {uploadMode === "file" ? (
                  !projectForm.imageUrl ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative flex items-center justify-between gap-4 w-full rounded-xl border border-dashed px-4 h-[60px] cursor-pointer transition-all duration-200 ease-in-out
                        ${isDragging
                          ? "border-blue-500 bg-blue-600/10"
                          : "border-zinc-700 bg-zinc-950/60 hover:border-blue-500/50 hover:bg-zinc-900/60"
                        }`}
                    >
                      {isUploadingImage ? (
                        <div className="flex items-center gap-3">
                          <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
                          <p className="text-xs font-semibold text-blue-400">Mengupload gambar...</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                              <Upload className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col min-w-0 text-left">
                              <p className="text-xs font-semibold text-zinc-200">
                                Upload File Gambar Proyek
                              </p>
                              <p className="text-[11px] text-zinc-400 truncate">
                                Drag &amp; drop atau klik file (PNG, JPG, WebP, SVG, maks 4MB)
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-medium text-zinc-200 pointer-events-none"
                          >
                            Pilih File
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-14 w-20 rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden flex-shrink-0">
                          <img
                            src={projectForm.imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => setProjectForm((prev) => ({ ...prev, imageUrl: "" }))}
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-zinc-200 truncate">
                            {projectForm.imageUrl.split("/").pop()}
                          </span>
                          <span className="text-[11px] text-green-400 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="h-3 w-3" />
                            Gambar tersambung
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-200 hover:text-white transition-all disabled:opacity-50"
                        >
                          Ganti
                        </button>
                        <button
                          type="button"
                          onClick={() => setProjectForm({ ...projectForm, imageUrl: "" })}
                          className="px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-500/30 text-xs font-medium text-red-400 hover:text-red-300 transition-all"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Link2 className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                      <input
                        type="url"
                        value={projectForm.imageUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Field 5: Demo URL (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-blue-500" />
                  Tautan Demo / Project URL (Opsional)
                </label>
                <input
                  type="url"
                  value={projectForm.projectUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, projectUrl: e.target.value })}
                  placeholder="https://demo-proyek.example.com"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Modal Sticky Footer */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3 sticky bottom-0 bg-zinc-900 z-10">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingProject || isUploadingImage}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:opacity-50 transition-all"
                >
                  {isSubmittingProject ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : editingProjectId ? (
                    "Simpan Perubahan"
                  ) : (
                    "Simpan Proyek Baru"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-50">Konfirmasi Hapus Proyek</h3>
                <p className="text-xs text-zinc-400">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              Apakah Anda yakin ingin menghapus proyek <span className="font-bold text-white">&quot;{deleteCandidate.title}&quot;</span> (ID #{deleteCandidate.id})?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors disabled:opacity-50"
              >
                Batal
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus Proyek"
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
            {toast.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
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
