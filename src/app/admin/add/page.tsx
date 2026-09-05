"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  PlusCircle, 
  Image as ImageIcon, 
  Globe, 
  Layers, 
  FileText, 
  Heading, 
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  RefreshCw,
  Link2,
  X
} from "lucide-react";

interface PopupToast {
  type: "success" | "error";
  title: string;
  message: string;
}

export default function AddProjectPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    techStack: "",
    projectUrl: "",
    features: "",
  });

  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<PopupToast | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Upload image file to /api/upload
  const handleFileUpload = useCallback(async (file: File) => {
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

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", "project");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: data.data.url }));
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
      setIsUploading(false);
    }
  }, []);

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

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.techStack.trim()) {
      setToast({
        type: "error",
        title: "Data Belum Lengkap",
        message: "Harap isi seluruh kolom wajib (Judul, Deskripsi, dan Tech Stack).",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          imageUrl: formData.imageUrl.trim(),
          techStack: formData.techStack.trim(),
          projectUrl: formData.projectUrl.trim() || null,
          features: formData.features.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToast({
          type: "success",
          title: "Proyek Berhasil Dibuat",
          message: "Proyek baru telah ditambahkan ke portofolio!",
        });
        setTimeout(() => {
          router.push("/admin");
          router.refresh();
        }, 1000);
      } else {
        setToast({
          type: "error",
          title: "Gagal Menyimpan",
          message: data.message || "Gagal menyimpan proyek.",
        });
      }
    } catch {
      setToast({
        type: "error",
        title: "Kesalahan Jaringan",
        message: "Terjadi kesalahan jaringan. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-blue-400 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard Admin
          </Link>
          <h1 className="text-2xl font-extrabold text-zinc-50 tracking-tight flex items-center gap-2.5">
            <PlusCircle className="h-6 w-6 text-blue-500" />
            Tambah Proyek Baru
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8 space-y-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Title */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Heading className="h-3.5 w-3.5 text-blue-500" />
              Judul Proyek <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: E-Commerce Platform Next.js"
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
            />
          </div>

          {/* Row 2: Short Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-blue-500" />
              Deskripsi Singkat Proyek <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Tuliskan 2-3 kalimat penjelasan mengenai fitur utama dan kegunaan proyek..."
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
            />
          </div>

          {/* Row 3: Tech Stack */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-blue-500" />
              Tech Stack / Teknologi <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="techStack"
              required
              value={formData.techStack}
              onChange={handleChange}
              placeholder="Pisahkan dengan koma, contoh: Next.js, React, Tailwind CSS, TypeScript"
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
            />
          </div>

          {/* Row 3.5: Kelebihan & Keunggulan */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
              Kelebihan &amp; Keunggulan (Pisahkan tiap poin dengan baris baru / Enter)
            </label>
            <textarea
              name="features"
              rows={4}
              value={formData.features}
              onChange={handleChange}
              placeholder={"Arsitektur kode modular dan mudah dikembangkan\nAntarmuka responsif untuk semua ukuran layar\nPerforma tinggi dengan optimasi rendering terbaik\nClean code dengan standar TypeScript strict mode"}
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out font-sans"
            />
          </div>

          {/* Row 4: Gambar Proyek (Direct Upload / Custom Link) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
                Gambar Header / Preview Proyek
              </label>

              {/* Toggle Mode Upload / URL Link */}
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

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />

            {uploadMode === "file" ? (
              /* Compact Dropzone / File Picker */
              !formData.imageUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative flex items-center justify-between gap-4 w-full rounded-xl border border-dashed px-4 h-[62px] cursor-pointer transition-all duration-200 ease-in-out
                    ${isDragging
                      ? "border-blue-500 bg-blue-600/10"
                      : "border-zinc-700 bg-zinc-950/60 hover:border-blue-500/50 hover:bg-zinc-900/60"
                    }`}
                >
                  {isUploading ? (
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
                            Drag &amp; drop atau klik untuk pilih file (PNG, JPG, WebP, SVG, maks 4MB)
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-200 transition-colors pointer-events-none"
                      >
                        Pilih File
                      </button>
                    </>
                  )}
                </div>
              ) : (
                /* Uploaded Image Preview & Actions */
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-16 w-24 rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden flex-shrink-0">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-zinc-200 truncate">
                        {formData.imageUrl.split("/").pop()}
                      </span>
                      <span className="text-[11px] text-green-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="h-3 w-3" />
                        Gambar tersambung
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:text-white hover:border-blue-500/50 transition-all disabled:opacity-50"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Ganti
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-950/30 border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/60 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* Custom Link Input */
              <div className="space-y-2">
                <div className="relative">
                  <Link2 className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                {formData.imageUrl && (
                  <div className="h-36 w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview Custom URL"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Row 5: Demo URL */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-500" />
              Tautan Demo / Project URL (Opsional)
            </label>
            <input
              type="url"
              name="projectUrl"
              value={formData.projectUrl}
              onChange={handleChange}
              placeholder="https://demo-proyek.example.com"
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
            />
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:opacity-50 transition-all duration-200 ease-in-out"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Menyimpan Proyek...
                </>
              ) : (
                "Simpan Proyek Baru"
              )}
            </button>
          </div>

        </form>
      </div>

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
