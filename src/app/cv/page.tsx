import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { 
  Briefcase, 
  GraduationCap, 
  Download, 
  Mail, 
  Github, 
  MessageSquare, 
  PhoneCall, 
  Calendar, 
  MapPin, 
  User, 
  Code2, 
  ArrowLeft,
  Award
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Fresh data on every request

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.websiteSetting.findFirst();
    const siteName = settings?.siteName || "DevPortfolio";
    const ownerName = settings?.ownerName || "Developer";
    const logoUrl = settings?.logoUrl;

    return {
      title: `Curriculum Vitae (CV) - ${ownerName} | ${siteName}`,
      description: `Curriculum Vitae dan Riwayat Pengalaman ${ownerName}`,
      icons: logoUrl
        ? {
            icon: logoUrl,
            shortcut: logoUrl,
            apple: logoUrl,
          }
        : undefined,
    };
  } catch {
    return {
      title: "Curriculum Vitae (CV) | DevPortfolio",
    };
  }
}

export default async function CvPublicPage() {
  const [settings, experiences, educations] = await Promise.all([
    prisma.websiteSetting.findFirst(),
    prisma.experience.findMany({
      orderBy: [{ order: "asc" }, { id: "desc" }],
    }),
    prisma.education.findMany({
      orderBy: [{ order: "asc" }, { id: "desc" }],
    }),
  ]);

  const siteName = settings?.siteName || "DevPortfolio";
  const ownerName = settings?.ownerName || "John Doe";
  const roleTitle = settings?.roleTitle || "Senior Full Stack Developer";
  const contactEmail = settings?.contactEmail || "developer@example.com";
  const isCvActive = settings?.isCvActive ?? true;

  if (!isCvActive) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col justify-between selection:bg-blue-600/30">
        <Navbar
          siteName={settings?.siteName}
          roleTitle={settings?.roleTitle}
          logoUrl={settings?.logoUrl}
          isCvActive={false}
        />

        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="max-w-md w-full text-center space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl">
            <div className="h-16 w-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mx-auto text-zinc-400">
              <User className="h-8 w-8 text-zinc-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-zinc-100">Halaman CV Sedang Non-Aktif</h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Halaman Curriculum Vitae saat ini dinonaktifkan oleh pemilik website. Silakan kembali ke beranda.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </main>

        <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 text-xs text-zinc-400 text-center">
          <p>© 2026 {siteName}. Curriculum Vitae — {ownerName}</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col justify-between selection:bg-blue-600/30">
      {/* Navbar */}
      <Navbar
        siteName={settings?.siteName}
        roleTitle={settings?.roleTitle}
        logoUrl={settings?.logoUrl}
        isCvActive={isCvActive}
      />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>

            {settings?.resumePdfUrl && (
              <a
                href={settings.resumePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all duration-200"
              >
                <Download className="h-4 w-4" />
                Unduh CV (PDF)
              </a>
            )}
          </div>

          {/* CV HEADER CARD */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-400">
                  <User className="h-3.5 w-3.5" />
                  Curriculum Vitae / Resume
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-50 tracking-tight">
                  {ownerName}
                </h1>
                <p className="text-base text-blue-400 font-medium">
                  {roleTitle}
                </p>
              </div>

              {/* Action Contact Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {contactEmail && (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-300 hover:text-blue-400 hover:border-blue-500/40 transition-all"
                  >
                    <Mail className="h-3.5 w-3.5 text-blue-500" />
                    <span>{contactEmail}</span>
                  </a>
                )}
                {settings?.githubUrl && (
                  <a
                    href={settings.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-300 hover:text-blue-400 hover:border-blue-500/40 transition-all"
                  >
                    <Github className="h-3.5 w-3.5 text-zinc-400" />
                    <span>GitHub</span>
                  </a>
                )}
                {settings?.whatsappUrl && (
                  <a
                    href={settings.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-300 hover:text-green-400 hover:border-green-500/40 transition-all"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-green-400" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {settings?.discordUrl && (
                  <a
                    href={settings.discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-300 hover:text-indigo-400 hover:border-indigo-500/40 transition-all"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Discord</span>
                  </a>
                )}
              </div>
            </div>

            {/* About Me / Ringkasan Profil */}
            {settings?.aboutMe && (
              <div className="pt-4 border-t border-zinc-800/80 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Ringkasan Profil</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {settings.aboutMe}
                </p>
              </div>
            )}
          </section>

          {/* WORK EXPERIENCE SECTION */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-50">Pengalaman Kerja</h2>
                <p className="text-xs text-zinc-400">Riwayat karir &amp; kontribusi profesional</p>
              </div>
            </div>

            {experiences.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 sm:before:left-4 before:w-0.5 before:bg-zinc-800">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-9 sm:pl-10 space-y-2 group">
                    {/* Timeline dot */}
                    <div className="absolute left-1.5 sm:left-2 top-1.5 h-4 w-4 rounded-full bg-zinc-950 border-2 border-blue-500 group-hover:scale-125 group-hover:bg-blue-500 transition-all duration-200" />

                    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3 hover:border-zinc-700 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-zinc-100">{exp.position}</h3>
                          <p className="text-xs font-semibold text-blue-400">{exp.company}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-400">
                          <span className="inline-flex items-center gap-1 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md">
                            <Calendar className="h-3 w-3 text-blue-400" />
                            {exp.period}
                          </span>
                          {exp.location && (
                            <span className="inline-flex items-center gap-1 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md">
                              <MapPin className="h-3 w-3 text-zinc-400" />
                              {exp.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center text-xs text-zinc-400">
                Belum ada data pengalaman kerja yang ditambahkan.
              </div>
            )}
          </section>

          {/* EDUCATION SECTION */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-50">Riwayat Pendidikan</h2>
                <p className="text-xs text-zinc-400">Latar belakang akademis &amp; studi</p>
              </div>
            </div>

            {educations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {educations.map((edu) => (
                  <div key={edu.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2 hover:border-zinc-700 transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-semibold text-blue-400 bg-blue-600/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                        {edu.period}
                      </span>
                      <Award className="h-4 w-4 text-zinc-500" />
                    </div>

                    <h3 className="text-sm font-bold text-zinc-100">{edu.degree}</h3>
                    <p className="text-xs font-semibold text-zinc-400">{edu.institution}</p>

                    {edu.description && (
                      <p className="text-xs text-zinc-400 pt-1 leading-relaxed border-t border-zinc-800/60 mt-2">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center text-xs text-zinc-400">
                Belum ada data pendidikan yang ditambahkan.
              </div>
            )}
          </section>

          {/* TECH STACK & SKILLS SUMMARY */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-50">Keahlian &amp; Spesialisasi</h2>
                <p className="text-xs text-zinc-400">Teknologi &amp; instrumen pengembangan</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
              {["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Express.js", "Python", "Prisma ORM", "MySQL", "PostgreSQL", "Docker", "Git / GitHub", "REST API", "GraphQL"].map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:border-blue-500/40 hover:text-blue-400 transition-all"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 text-xs text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2026 {siteName}. Curriculum Vitae — {ownerName}</p>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  );
}
