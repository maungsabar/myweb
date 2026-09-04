import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Edit3, 
  FileText
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  const [project, settings] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.websiteSetting.findFirst(),
  ]);

  if (!project) {
    notFound();
  }

  const techStackList = project.techStack
    ? project.techStack.split(",").map((tech) => tech.trim()).filter(Boolean)
    : [];

  const formattedDate = new Date(project.createdAt).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col justify-between">
      <Navbar siteName={settings?.siteName} roleTitle={settings?.roleTitle} />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-blue-400 transition-all duration-200 ease-in-out"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Daftar Proyek
            </Link>

            <Link
              href={`/admin/edit/${project.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-blue-500/40 transition-all duration-200 ease-in-out"
            >
              <Edit3 className="h-3.5 w-3.5 text-blue-400" />
              Edit Proyek ini (Admin)
            </Link>
          </div>

          {/* Project Title Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-blue-600/10 border border-blue-500/30 px-3 py-1 text-xs font-mono font-semibold text-blue-400">
                Proyek #{project.id}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                {formattedDate}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-50 tracking-tight">
              {project.title}
            </h1>

            <p className="text-base text-zinc-400 leading-relaxed max-w-3xl">
              {project.description}
            </p>
          </div>

          {/* Main Hero Image */}
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-[400px] object-cover object-center"
            />
          </div>

          {/* Live Action Bar */}
          {project.projectUrl && (
            <div className="flex flex-wrap items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all duration-200 ease-in-out"
              >
                <ExternalLink className="h-4 w-4" />
                Kunjungi Live Demo
              </a>
            </div>
          )}

          {/* Detailed Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            
            {/* Left 2 columns: Description */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Overview */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Ringkasan Proyek
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Tech badges detail */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  Kelebihan &amp; Keunggulan
                </h3>
                <ul className="space-y-2.5">
                  {[
                    "Arsitektur kode modular dan mudah dikembangkan",
                    "Antarmuka responsif untuk semua ukuran layar",
                    "Performa tinggi dengan optimasi rendering terbaik",
                    "Clean code dengan standar TypeScript strict mode",
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-zinc-300">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right 1 column: Tech Stack Sidebar */}
            <div className="space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-500" />
                  Teknologi Digunakan
                </h3>
                <div className="flex flex-wrap gap-2">
                  {techStackList.map((tech, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1 text-xs font-mono font-medium text-blue-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-3">
                <h4 className="text-xs font-bold text-zinc-200">Informasi Proyek</h4>
                <div className="text-xs space-y-2 text-zinc-400">
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span>ID Proyek</span>
                    <span className="font-mono text-zinc-200">#{project.id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span>Tanggal Dibuat</span>
                    <span className="text-zinc-200">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span>Status</span>
                    <span className="text-green-400 font-semibold">Aktif</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Demo URL</span>
                    <span className={project.projectUrl ? "text-blue-400 font-semibold" : "text-zinc-500 italic"}>
                      {project.projectUrl ? "Tersedia" : "Tidak Ada"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      <footer className="border-t border-zinc-800 bg-zinc-950 py-6 text-center text-xs text-zinc-400">
        © 2026 {settings?.siteName || "DevPortfolio"}. Proyek #{project.id} — {project.title}
      </footer>
    </div>
  );
}
