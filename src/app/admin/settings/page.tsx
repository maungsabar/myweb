"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Settings, 
  Layout, 
  Share2, 
  Github, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Heading,
  FileText,
  BadgeCheck,
  UserCheck,
  MessageSquare,
  PhoneCall,
  Globe,
  ImageIcon,
  Upload,
  Trash2,
  Terminal,
  RefreshCw,
  X
} from "lucide-react";

interface SettingsForm {
  siteName: string;
  ownerName: string;
  roleTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  githubUrl: string;
  discordUrl: string;
  whatsappUrl: string;
  logoUrl: string;
}

interface PopupToast {
  type: "success" | "error";
  title: string;
  message: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsForm>({
    siteName: "",
    ownerName: "",
    roleTitle: "",
    heroTitle: "",
    heroSubtitle: "",
    contactEmail: "",
    githubUrl: "",
    discordUrl: "",
    whatsappUrl: "",
    logoUrl: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<PopupToast | null>(null);
  const [uploadError, setUploadError] = useState("");

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Logo state
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (res.ok && data.success) {
          const s = data.data;
          setSettings({
            siteName: s.siteName || "",
            ownerName: s.ownerName || "",
            roleTitle: s.roleTitle || "",
            heroTitle: s.heroTitle || "",
            heroSubtitle: s.heroSubtitle || "",
            contactEmail: s.contactEmail || "",
            githubUrl: s.githubUrl || "",
            discordUrl: s.discordUrl || "",
            whatsappUrl: s.whatsappUrl || "",
            logoUrl: s.logoUrl || "",
          });
          if (s.logoUrl) setLogoPreview(s.logoUrl);
        } else {
          setToast({
            type: "error",
            title: "Gagal Memuat Data",
            message: "Gagal memuat pengaturan dari server."
          });
        }
      } catch {
        setToast({
          type: "error",
          title: "Kesalahan Koneksi",
          message: "Tidak dapat terhubung ke server."
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  // Upload file to server
  const uploadFile = useCallback(async (file: File) => {
    setUploadError("");

    // Client-side validation
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Format tidak didukung. Gunakan PNG, JPG, WebP, SVG, atau GIF.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Ukuran file terlalu besar. Maksimal 2MB.");
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Update settings with the server URL
        setSettings((prev) => ({ ...prev, logoUrl: data.data.url }));
        setLogoPreview(data.data.url);
        URL.revokeObjectURL(objectUrl);
        setToast({
          type: "success",
          title: "Logo Berhasil Diupload",
          message: "File logo baru telah berhasil diunggah."
        });
      } else {
        setUploadError(data.message || "Upload gagal.");
        setLogoPreview(settings.logoUrl); // revert preview
        URL.revokeObjectURL(objectUrl);
      }
    } catch {
      setUploadError("Gagal terhubung ke server upload.");
      setLogoPreview(settings.logoUrl);
    } finally {
      setIsUploading(false);
    }
  }, [settings.logoUrl]);

  // File input change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  // Remove logo
  const handleRemoveLogo = async () => {
    if (settings.logoUrl) {
      // Try to delete old file from server
      const filename = settings.logoUrl.split("/").pop();
      if (filename) {
        try {
          await fetch("/api/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename }),
          });
        } catch {
          // Non-fatal
        }
      }
    }
    setSettings((prev) => ({ ...prev, logoUrl: "" }));
    setLogoPreview("");
    setUploadError("");
    setToast({
      type: "success",
      title: "Logo Dihapus",
      message: "Logo kustom berhasil dihapus. Kembali ke icon default."
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!settings.siteName.trim() || !settings.heroTitle.trim() || !settings.heroSubtitle.trim() || !settings.contactEmail.trim()) {
      setToast({
        type: "error",
        title: "Gagal Menyimpan",
        message: "Harap isi Nama Website, Judul Utama, Deskripsi Hero, dan Email Kontak."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToast({
          type: "success",
          title: "Berhasil Disimpan",
          message: "Pengaturan website & social media berhasil diperbarui!"
        });
      } else {
        setToast({
          type: "error",
          title: "Gagal Menyimpan",
          message: data.message || "Gagal menyimpan pengaturan."
        });
      }
    } catch {
      setToast({
        type: "error",
        title: "Kesalahan Jaringan",
        message: "Terjadi kesalahan jaringan. Silakan coba lagi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb & Title */}
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
            <Settings className="h-6 w-6 text-blue-500" />
            Pengaturan Website &amp; Social Media
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── SECTION 1: LOGO WEBSITE ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-50">Logo Website</h2>
              <p className="text-xs text-zinc-400">Upload logo langsung dari komputer Anda. Format: PNG, JPG, WebP, SVG, GIF. Maks 2MB.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">

            {/* ── Preview ── */}
            <div className="flex-shrink-0 space-y-2">
              <p className="text-xs font-semibold text-zinc-300">Preview di Navbar</p>

              {/* Mini Navbar Simulation (Height matched to h-[62px]) */}
              <div className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 h-[62px] flex items-center gap-3 w-64">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/30 overflow-hidden flex-shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="w-full h-full object-contain"
                      onError={() => setLogoPreview("")}
                    />
                  ) : (
                    <Terminal className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm text-zinc-50 truncate flex items-center gap-1">
                    {settings.siteName || "DevPortfolio"}
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase truncate">
                    {settings.roleTitle || "Senior Engineer"}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div>
                {logoPreview ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Logo kustom aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500">
                    <Terminal className="h-3 w-3" />
                    Menggunakan icon default
                  </span>
                )}
              </div>
            </div>

            {/* ── Upload Area ── */}
            <div className="flex-1 w-full space-y-2">
              <p className="text-xs font-semibold text-zinc-300">Pilih &amp; Upload Logo</p>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />

              {!logoPreview ? (
                /* Compact Drop Zone (Height matched to h-[62px]) */
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
                      <p className="text-xs font-semibold text-blue-400">Mengupload logo...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                          <Upload className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0 text-left">
                          <p className="text-xs font-semibold text-zinc-200">
                            Upload File Logo
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">
                            Drag &amp; drop atau klik untuk pilih file (PNG, JPG, WebP, SVG, maks 2MB)
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
                /* Logo Uploaded State (Height matched to h-[62px]) */
                <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 h-[62px]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden flex items-center justify-center flex-shrink-0 p-0.5">
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-full h-full object-contain"
                        onError={() => setLogoPreview("")}
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 truncate">
                        {settings.logoUrl ? settings.logoUrl.split("/").pop() : "Logo kustom"}
                      </p>
                      <p className="text-[10px] text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Berhasil diupload
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:text-white hover:border-blue-500/50 transition-all duration-200 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      Ganti
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      disabled={isUploading}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-950/30 border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/60 transition-all duration-200 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-950/40 border border-red-500/30 p-3 text-xs text-red-300">
                  <AlertCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                  {uploadError}
                </div>
              )}

              {/* Note */}
              <p className="text-[11px] text-zinc-500">
                Gambar tersimpan di server portofolio Anda. Gunakan logo transparan (PNG/SVG) untuk hasil terbaik.
                File lama akan otomatis dihapus saat upload logo baru.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: IDENTITAS & HERO ─────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <Layout className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-50">Identitas Website &amp; Section Hero</h2>
              <p className="text-xs text-zinc-400">Atur nama website, kalimat pembuka halaman, dan informasi profil.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-blue-500" />
                Nama Website / Brand <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="siteName"
                required
                value={settings.siteName}
                onChange={handleChange}
                placeholder="Contoh: DevPortfolio / Portofolio Saya"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                Nama Pemilik Portfolio
              </label>
              <input
                type="text"
                name="ownerName"
                value={settings.ownerName}
                onChange={handleChange}
                placeholder="Contoh: John Doe"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                Gelar / Peran Spesialisasi (Navbar Subtag)
              </label>
              <input
                type="text"
                name="roleTitle"
                value={settings.roleTitle}
                onChange={handleChange}
                placeholder="Contoh: Senior Engineer / Full Stack Developer"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Heading className="h-3.5 w-3.5 text-blue-500" />
                Judul Utama Hero (Headline) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="heroTitle"
                required
                value={settings.heroTitle}
                onChange={handleChange}
                placeholder="Contoh: Membangun Solusi Digital Modern, Cepat & Presisi."
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-blue-500" />
                Deskripsi Singkat Hero (Sub-headline) <span className="text-red-400">*</span>
              </label>
              <textarea
                name="heroSubtitle"
                required
                rows={3}
                value={settings.heroSubtitle}
                onChange={handleChange}
                placeholder="Penjelasan latar belakang keahlian Anda..."
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
              />
            </div>
          </div>
        </div>

        {/* ── SECTION 3: MEDIA SOSIAL & KONTAK ────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-50">Tautan Media Sosial &amp; Kontak Publik</h2>
              <p className="text-xs text-zinc-400">Tautan ini tampil di Hero section, Kontak section, dan Footer website.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-500" />
                Email Kontak Utama <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="contactEmail"
                required
                value={settings.contactEmail}
                onChange={handleChange}
                placeholder="developer@example.com"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Github className="h-3.5 w-3.5 text-blue-500" />
                URL Profil GitHub
              </label>
              <input
                type="url"
                name="githubUrl"
                value={settings.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                URL Profil / Server Discord
              </label>
              <input
                type="url"
                name="discordUrl"
                value={settings.discordUrl}
                onChange={handleChange}
                placeholder="https://discord.gg/username"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-blue-500" />
                Nomor / Link WhatsApp (wa.me)
              </label>
              <input
                type="url"
                name="whatsappUrl"
                value={settings.whatsappUrl}
                onChange={handleChange}
                placeholder="https://wa.me/6281234567890"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-95 disabled:opacity-50 transition-all duration-200 ease-in-out"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan Pengaturan"
            )}
          </button>
        </div>

      </form>

      {/* Floating Popup Notification Toast */}
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
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </div>

          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs font-bold text-zinc-100">
              {toast.title}
            </span>
            <span className="text-xs text-zinc-300 leading-tight mt-0.5">
              {toast.message}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors ml-auto flex-shrink-0"
            aria-label="Tutup notifikasi"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
