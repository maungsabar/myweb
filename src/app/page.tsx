import React from "react";
import Link from "next/link";
import { 
  Github, 
  ArrowRight, 
  Briefcase, 
  Terminal, 
  MessageSquare,
  PhoneCall
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProjectGrid } from "@/components/ProjectGrid";
import { SkillsSection } from "@/components/SkillsSection";
import { ContactCard } from "@/components/ContactCard";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollReveal } from "@/components/ScrollReveal";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Ensure fresh data on every request
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch data directly from MySQL database at server-side render time
  const settings = await prisma.websiteSetting.findFirst();
  const rawProjects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
  const rawSkills = await prisma.skill.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });

  const projects = rawProjects.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  const skills = rawSkills.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  const siteName = settings?.siteName || "DevPortfolio";
  const roleTitle = settings?.roleTitle || "Full Stack Developer";
  const heroTitle = settings?.heroTitle || "Membangun Solusi Digital Modern, Cepat & Presisi.";
  const heroSubtitle = settings?.heroSubtitle || "Saya seorang Senior Full Stack Developer yang berfokus pada pengembangan aplikasi web performa tinggi.";
  const contactEmail = settings?.contactEmail || "developer@example.com";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col justify-between selection:bg-blue-600/30">
      {/* Header Navigation - Server Rendered */}
      <Navbar
        siteName={settings?.siteName}
        roleTitle={settings?.roleTitle}
        logoUrl={settings?.logoUrl}
        isCvActive={settings?.isCvActive}
      />

      <main className="flex-1">
        {/* HERO SECTION - Server Rendered */}
        <section id="home" className="relative overflow-hidden pt-16 sm:pt-20 pb-20 sm:pb-24 border-b border-zinc-800/60 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
              
              {/* Status Badge */}
              <ScrollReveal direction="down" delay={100} duration={600}>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 border border-blue-500/30 px-3.5 py-1 text-xs font-semibold text-blue-400 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Tersedia untuk proyek &amp; kolaborasi baru
                </div>
              </ScrollReveal>

              {/* Main Headline */}
              <ScrollReveal direction="up" delay={200} duration={700}>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-50 leading-tight">
                  {heroTitle}
                </h1>
              </ScrollReveal>

              {/* Subheadline Description */}
              <ScrollReveal direction="up" delay={350} duration={700}>
                <p className="text-sm sm:text-lg text-zinc-400 leading-relaxed font-normal">
                  {heroSubtitle}
                </p>
              </ScrollReveal>

              {/* Social Links & CTA */}
              <ScrollReveal direction="up" delay={450} duration={700}>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                  <a
                    href="#projects"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-95 transition-all duration-200 ease-in-out"
                  >
                    <Briefcase className="h-4 w-4" />
                    Lihat Hasil Karya
                  </a>

                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-900/90 border border-zinc-800 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white hover:border-blue-500/40 hover:bg-zinc-800 transition-all duration-200 ease-in-out backdrop-blur-sm"
                  >
                    Hubungi Saya
                    <ArrowRight className="h-4 w-4 text-blue-400" />
                  </a>
                </div>
              </ScrollReveal>

              {/* External Social Profiles */}
              <ScrollReveal direction="up" delay={550} duration={700}>
                <div className="pt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-zinc-400 border-t border-zinc-800/80 w-full max-w-md text-xs font-medium">
                  {settings?.githubUrl && (
                    <a
                      href={settings.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-blue-400 transition-all duration-200 ease-in-out"
                    >
                      <Github className="h-3.5 w-3.5" />
                      GitHub
                    </a>
                  )}

                  {settings?.discordUrl && (
                    <>
                      <span className="text-zinc-700 hidden sm:inline">•</span>
                      <a
                        href={settings.discordUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-blue-400 transition-all duration-200 ease-in-out"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                        Discord
                      </a>
                    </>
                  )}

                  {settings?.whatsappUrl && (
                    <>
                      <span className="text-zinc-700 hidden sm:inline">•</span>
                      <a
                        href={settings.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-blue-400 transition-all duration-200 ease-in-out"
                      >
                        <PhoneCall className="h-3.5 w-3.5 text-green-400" />
                        WhatsApp
                      </a>
                    </>
                  )}
                </div>
              </ScrollReveal>

            </div>
          </div>
        </section>

        {/* DYNAMIC KEAHLIAN SECTION WITH SCROLL REVEAL */}
        <ScrollReveal direction="up" delay={100} duration={800}>
          <SkillsSection initialSkills={skills} />
        </ScrollReveal>

        {/* PROJECTS GRID SECTION WITH SCROLL REVEAL */}
        <ScrollReveal direction="up" delay={150} duration={800}>
          <ProjectGrid initialProjects={projects} />
        </ScrollReveal>

        {/* CONTACT SECTION WITH SCROLL REVEAL */}
        <ScrollReveal direction="up" delay={150} duration={800}>
          <section id="contact" className="py-16 sm:py-20 border-t border-zinc-800/80 bg-zinc-900/30">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-400">
                      Mari Terhubung
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-50 tracking-tight">
                      Punya ide proyek atau tawaran kerja sama?
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      Saya selalu terbuka untuk mendiskusikan peluang baru, proyek web modern, atau diskusi teknis seputar full-stack development. Silakan hubungi saya kapan saja.
                    </p>
                  </div>

                  {/* Contact Card Box - Client Component for copy email button */}
                  <ContactCard
                    contactEmail={contactEmail}
                    discordUrl={settings?.discordUrl}
                    whatsappUrl={settings?.whatsappUrl}
                  />
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>

      {/* FOOTER - Server Rendered */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 text-xs text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2026 {siteName}.</p>
        </div>
      </footer>

      {/* Floating Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
