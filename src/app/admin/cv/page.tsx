"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Download, 
  FileCheck, 
  Calendar, 
  Building, 
  MapPin, 
  X, 
  RefreshCw,
  Award,
  Eye,
  EyeOff
} from "lucide-react";
import { Experience, Education } from "@/types";

interface PopupToast {
  type: "success" | "error";
  title: string;
  message: string;
}

export default function AdminCvPage() {
  const [aboutMe, setAboutMe] = useState("");
  const [resumePdfUrl, setResumePdfUrl] = useState("");
  const [isCvActive, setIsCvActive] = useState(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [toast, setToast] = useState<PopupToast | null>(null);

  // Experience Form State
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<number | null>(null);
  const [expForm, setExpForm] = useState({
    company: "",
    position: "",
    period: "",
    location: "",
    description: "",
  });
  const [isSubmittingExp, setIsSubmittingExp] = useState(false);

  // Education Form State
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [editingEduId, setEditingEduId] = useState<number | null>(null);
  const [eduForm, setEduForm] = useState({
    institution: "",
    degree: "",
    period: "",
    description: "",
  });
  const [isSubmittingEdu, setIsSubmittingEdu] = useState(false);

  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Fetch initial CV data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cv");
      const data = await res.json();
      if (res.ok && data.success) {
        setAboutMe(data.data.settings?.aboutMe || "");
        setResumePdfUrl(data.data.settings?.resumePdfUrl || "");
        setIsCvActive(data.data.settings?.isCvActive ?? true);
        setExperiences(data.data.experiences || []);
        setEducations(data.data.educations || []);
      }
    } catch {
      setToast({
        type: "error",
        title: "Kesalahan Server",
        message: "Gagal memuat data CV dari server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toggle status aktif/non-aktif Halaman CV
  const handleToggleCvActive = async () => {
    const newStatus = !isCvActive;
    setIsTogglingStatus(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCvActive: newStatus }),
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: false, message: `Server Error (${res.status}): Respon server tidak valid.` };
      }

      if (res.ok && data.success) {
        setIsCvActive(newStatus);
        setToast({
          type: "success",
          title: newStatus ? "Halaman CV Diaktifkan" : "Halaman CV Dinonaktifkan",
          message: newStatus
            ? "Halaman CV kini aktif dan dapat diakses publik (/cv)."
            : "Halaman CV kini disembunyikan dari publik.",
        });
      } else {
        setToast({
          type: "error",
          title: "Gagal Mengubah Status",
          message: data.message || `Gagal memperbarui status CV (HTTP ${res.status}).`,
        });
      }
    } catch {
      setToast({
        type: "error",
        title: "Kesalahan Jaringan",
        message: "Tidak dapat terhubung ke server.",
      });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Save General CV Settings (About Me & Resume PDF URL)
  const handleSaveCvSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aboutMe, resumePdfUrl }),
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: false, message: `Server Error (${res.status})` };
      }

      if (res.ok && data.success) {
        setToast({
          type: "success",
          title: "Berhasil Disimpan",
          message: "Ringkasan CV & Link PDF berhasil diperbarui!",
        });
      } else {
        setToast({
          type: "error",
          title: "Gagal Menyimpan",
          message: data.message || "Gagal menyimpan pengaturan CV.",
        });
      }
    } catch {
      setToast({
        type: "error",
        title: "Kesalahan Jaringan",
        message: "Gagal terhubung ke server.",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Upload PDF CV File
  const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setToast({
        type: "error",
        title: "Format Tidak Valid",
        message: "Harap upload file berformat PDF.",
      });
      return;
    }

    setIsUploadingPdf(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResumePdfUrl(data.data.url);
        // Automatically update settings
        await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumePdfUrl: data.data.url }),
        });
        setToast({
          type: "success",
          title: "PDF Berhasil Diupload",
          message: "File CV PDF berhasil diunggah ke server.",
        });
      } else {
        setToast({
          type: "error",
          title: "Upload Gagal",
          message: data.message || "Gagal mengupload file PDF.",
        });
      }
    } catch {
      setToast({
        type: "error",
        title: "Kesalahan Jaringan",
        message: "Gagal mengunggah file ke server.",
      });
    } finally {
      setIsUploadingPdf(false);
      e.target.value = "";
    }
  };

  // ── EXPERIENCE HANDLERS ──────────────────────────────────────────────────

  const openExpModal = (exp?: Experience) => {
    if (exp) {
      setEditingExpId(exp.id);
      setExpForm({
        company: exp.company,
        position: exp.position,
        period: exp.period,
        location: exp.location || "",
        description: exp.description,
      });
    } else {
      setEditingExpId(null);
      setExpForm({ company: "", position: "", period: "", location: "", description: "" });
    }
    setExpModalOpen(true);
  };

  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.company.trim() || !expForm.position.trim() || !expForm.period.trim() || !expForm.description.trim()) {
      setToast({
        type: "error",
        title: "Data Belum Lengkap",
        message: "Harap isi nama perusahaan, posisi, periode, dan deskripsi.",
      });
      return;
    }

    setIsSubmittingExp(true);
    try {
      const url = editingExpId ? `/api/cv/experiences/${editingExpId}` : "/api/cv/experiences";
      const method = editingExpId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToast({
          type: "success",
          title: editingExpId ? "Pengalaman Diperbarui" : "Pengalaman Ditambahkan",
          message: editingExpId ? "Data pengalaman kerja berhasil diubah." : "Pengalaman kerja baru berhasil ditambahkan.",
        });
        setExpModalOpen(false);
        fetchData();
      } else {
        setToast({
          type: "error",
          title: "Gagal Menyimpan",
          message: data.message || "Gagal menyimpan pengalaman.",
        });
      }
    } catch {
      setToast({ type: "error", title: "Kesalahan Jaringan", message: "Gagal menyimpan data." });
    } finally {
      setIsSubmittingExp(false);
    }
  };

  const handleDeleteExp = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengalaman kerja ini?")) return;

    try {
      const res = await fetch(`/api/cv/experiences/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ type: "success", title: "Berhasil Dihapus", message: "Data pengalaman kerja dihapus." });
        fetchData();
      } else {
        setToast({ type: "error", title: "Gagal Menghapus", message: data.message || "Gagal menghapus." });
      }
    } catch {
      setToast({ type: "error", title: "Kesalahan Jaringan", message: "Gagal menghapus data." });
    }
  };

  // ── EDUCATION HANDLERS ───────────────────────────────────────────────────

  const openEduModal = (edu?: Education) => {
    if (edu) {
      setEditingEduId(edu.id);
      setEduForm({
        institution: edu.institution,
        degree: edu.degree,
        period: edu.period,
        description: edu.description || "",
      });
    } else {
      setEditingEduId(null);
      setEduForm({ institution: "", degree: "", period: "", description: "" });
    }
    setEduModalOpen(true);
  };

  const handleSaveEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduForm.institution.trim() || !eduForm.degree.trim() || !eduForm.period.trim()) {
      setToast({
        type: "error",
        title: "Data Belum Lengkap",
        message: "Harap isi nama instansi, gelar/jurusan, dan periode.",
      });
      return;
    }

    setIsSubmittingEdu(true);
    try {
      const url = editingEduId ? `/api/cv/educations/${editingEduId}` : "/api/cv/educations";
      const method = editingEduId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eduForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToast({
          type: "success",
          title: editingEduId ? "Pendidikan Diperbarui" : "Pendidikan Ditambahkan",
          message: editingEduId ? "Data pendidikan berhasil diubah." : "Pendidikan baru berhasil ditambahkan.",
        });
        setEduModalOpen(false);
        fetchData();
      } else {
        setToast({
          type: "error",
          title: "Gagal Menyimpan",
          message: data.message || "Gagal menyimpan pendidikan.",
        });
      }
    } catch {
      setToast({ type: "error", title: "Kesalahan Jaringan", message: "Gagal menyimpan data." });
    } finally {
      setIsSubmittingEdu(false);
    }
  };

  const handleDeleteEdu = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data pendidikan ini?")) return;

    try {
      const res = await fetch(`/api/cv/educations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ type: "success", title: "Berhasil Dihapus", message: "Data pendidikan berhasil dihapus." });
        fetchData();
      } else {
        setToast({ type: "error", title: "Gagal Menghapus", message: data.message || "Gagal menghapus." });
      }
    } catch {
      setToast({ type: "error", title: "Kesalahan Jaringan", message: "Gagal menghapus data." });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb & Title */}
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
            <FileText className="h-6 w-6 text-blue-500" />
            Kelola Curriculum Vitae (CV)
          </h1>
        </div>

        <Link
          href="/cv"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:border-blue-500/40 transition-all self-start sm:self-auto"
        >
          Lihat Halaman CV Publik ↗
        </Link>
      </div>

      {/* ── STATUS TOGGLE CARD ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center border flex-shrink-0 ${
              isCvActive
                ? "bg-green-600/10 border-green-500/30 text-green-400"
                : "bg-red-600/10 border-red-500/30 text-red-400"
            }`}
          >
            {isCvActive ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-bold text-zinc-50">Status Publikasi Halaman CV</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  isCvActive
                    ? "bg-green-950/80 border-green-500/40 text-green-300"
                    : "bg-red-950/80 border-red-500/40 text-red-300"
                }`}
              >
                {isCvActive ? "Aktif" : "Non-Aktif"}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {isCvActive
                ? "Halaman CV aktif &amp; tampil di menu navigasi publik (/cv)."
                : "Halaman CV disembunyikan &amp; tidak dapat diakses oleh umum."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleCvActive}
          disabled={isTogglingStatus}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 shadow-md flex-shrink-0 disabled:opacity-50 ${
            isCvActive
              ? "bg-red-950/40 border-red-500/40 text-red-300 hover:bg-red-900/60"
              : "bg-green-950/40 border-green-500/40 text-green-300 hover:bg-green-900/60"
          }`}
        >
          {isTogglingStatus ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : isCvActive ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          {isCvActive ? "Nonaktifkan Halaman CV" : "Aktifkan Halaman CV"}
        </button>
      </div>

      {/* ── SECTION 1: RINGKASAN PROFIL & FILE PDF CV ────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-50">Ringkasan Profil &amp; Document PDF</h2>
            <p className="text-xs text-zinc-400">Atur deskripsi singkat profil dan unggah file PDF CV yang bisa diunduh pengunjung.</p>
          </div>
        </div>

        <form onSubmit={handleSaveCvSettings} className="space-y-5">
          {/* About Me */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-200">
              Ringkasan Profil (About Me / Executive Summary)
            </label>
            <textarea
              rows={4}
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Tuliskan deskripsi ringkas tentang keahlian, pengalaman, dan fokus karir Anda..."
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Upload PDF File */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-200">
              File CV (Format PDF)
            </label>

            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleUploadPdf}
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={resumePdfUrl}
                onChange={(e) => setResumePdfUrl(e.target.value)}
                placeholder="https://... atau upload file PDF di samping"
                className="flex-1 rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />

              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                disabled={isUploadingPdf}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:text-white hover:border-blue-500/50 transition-all disabled:opacity-50"
              >
                {isUploadingPdf ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                ) : (
                  <Upload className="h-4 w-4 text-blue-400" />
                )}
                {isUploadingPdf ? "Mengupload..." : "Upload File PDF"}
              </button>
            </div>

            {resumePdfUrl && (
              <div className="flex items-center gap-2 text-xs text-green-400 pt-1">
                <FileCheck className="h-4 w-4" />
                <span>PDF tersambung:</span>
                <a
                  href={resumePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-green-300 font-mono text-[11px] truncate max-w-xs"
                >
                  {resumePdfUrl}
                </a>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:opacity-50 transition-all"
            >
              {isSavingSettings ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Ringkasan & Link PDF"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── SECTION 2: PENGALAMAN KERJA ───────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-50">Pengalaman Kerja</h2>
              <p className="text-xs text-zinc-400">Daftar riwayat posisi, perusahaan, dan pencapaian.</p>
            </div>
          </div>

          <button
            onClick={() => openExpModal()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="h-4 w-4" />
            Tambah Pengalaman
          </button>
        </div>

        {/* List Experiences */}
        {experiences.length > 0 ? (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 transition-all"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-100">{exp.position}</h3>
                    <span className="text-xs font-semibold text-blue-400">@ {exp.company}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-blue-400" />
                      {exp.period}
                    </span>
                    {exp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-zinc-400" />
                        {exp.location}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 pt-1 leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start flex-shrink-0">
                  <button
                    onClick={() => openExpModal(exp)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteExp(exp.id)}
                    className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-950/70 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center text-xs text-zinc-400">
            Belum ada data pengalaman kerja. Klik &quot;Tambah Pengalaman&quot; untuk menambahkan.
          </div>
        )}
      </div>

      {/* ── SECTION 3: RIWAYAT PENDIDIKAN ─────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-50">Riwayat Pendidikan</h2>
              <p className="text-xs text-zinc-400">Daftar gelar, institusi, dan periode akademik.</p>
            </div>
          </div>

          <button
            onClick={() => openEduModal()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="h-4 w-4" />
            Tambah Pendidikan
          </button>
        </div>

        {/* List Educations */}
        {educations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {educations.map((edu) => (
              <div
                key={edu.id}
                className="flex items-start justify-between gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 transition-all"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <span className="inline-block text-[10px] font-mono font-semibold text-blue-400 bg-blue-600/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                    {edu.period}
                  </span>
                  <h3 className="text-sm font-bold text-zinc-100">{edu.degree}</h3>
                  <p className="text-xs font-semibold text-zinc-400">{edu.institution}</p>
                  {edu.description && (
                    <p className="text-xs text-zinc-400 pt-1 leading-relaxed border-t border-zinc-800/60 mt-1">
                      {edu.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEduModal(edu)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEdu(edu.id)}
                    className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-950/70 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center text-xs text-zinc-400">
            Belum ada data pendidikan. Klik &quot;Tambah Pendidikan&quot; untuk menambahkan.
          </div>
        )}
      </div>

      {/* ── MODAL FORM EXPERIENCE ────────────────────────────────────────── */}
      {expModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-bold text-zinc-50 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                {editingExpId ? "Edit Pengalaman Kerja" : "Tambah Pengalaman Kerja"}
              </h3>
              <button
                onClick={() => setExpModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200">
                  Nama Perusahaan / Instansi <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={expForm.company}
                  onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                  placeholder="Contoh: PT Teknologi Indonesia / Startup XYZ"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200">
                  Posisi / Jabatan <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={expForm.position}
                  onChange={(e) => setExpForm({ ...expForm, position: e.target.value })}
                  placeholder="Contoh: Senior Frontend Engineer"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-200">
                    Periode Bekerja <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={expForm.period}
                    onChange={(e) => setExpForm({ ...expForm, period: e.target.value })}
                    placeholder="Contoh: Jan 2022 - Sekarang"
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-200">Lokasi (Opsional)</label>
                  <input
                    type="text"
                    value={expForm.location}
                    onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                    placeholder="Contoh: Jakarta, Indonesia (Remote)"
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200">
                  Deskripsi Peran &amp; Pencapaian <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  placeholder="Jelaskan tanggung jawab utama, proyek yang dipimpin, dan teknologi yang digunakan..."
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setExpModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExp}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingExp && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {editingExpId ? "Update Pengalaman" : "Simpan Pengalaman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL FORM EDUCATION ─────────────────────────────────────────── */}
      {eduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-bold text-zinc-50 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                {editingEduId ? "Edit Riwayat Pendidikan" : "Tambah Riwayat Pendidikan"}
              </h3>
              <button
                onClick={() => setEduModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdu} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200">
                  Nama Universits / Instansi <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  placeholder="Contoh: Universitas Indonesia"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200">
                  Gelar / Jurusan <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={eduForm.degree}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  placeholder="Contoh: S1 Teknik Informatika"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200">
                  Periode / Tahun Lulus <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={eduForm.period}
                  onChange={(e) => setEduForm({ ...eduForm, period: e.target.value })}
                  placeholder="Contoh: 2018 - 2022"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-200">Catatan / IPK (Opsional)</label>
                <textarea
                  rows={3}
                  value={eduForm.description}
                  onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })}
                  placeholder="Contoh: Lulus Cumlaude IPK 3.85, Keaktifan organisasi..."
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEduModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdu}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingEdu && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {editingEduId ? "Update Pendidikan" : "Simpan Pendidikan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Popup Toast */}
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
