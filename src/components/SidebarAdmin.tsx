"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, Globe, ShieldCheck, Settings, FileText, Users, FolderKanban, Cpu } from "lucide-react";

export function SidebarAdmin() {
  const pathname = usePathname();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string>("DevPortfolio");
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          if (data.data.logoUrl) setLogoUrl(data.data.logoUrl);
          if (data.data.siteName) setSiteName(data.data.siteName);
        }
      } catch {
        // Fallback silently if offline/error
      }
    };

    fetchSettings();
  }, []);

  const navItems = [
    {
      name: "Dashboard Utama",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Daftar Proyek",
      href: "/admin/projects",
      icon: FolderKanban,
      exact: false,
    },
    {
      name: "Kelola Keahlian",
      href: "/admin/skills",
      icon: Cpu,
      exact: false,
    },
    {
      name: "Kelola CV / Resume",
      href: "/admin/cv",
      icon: FileText,
      exact: false,
    },
    {
      name: "Kelola User Admin",
      href: "/admin/users",
      icon: Users,
      exact: false,
    },
    {
      name: "Pengaturan Website",
      href: "/admin/settings",
      icon: Settings,
      exact: false,
    },
  ];

  const showLogo = logoUrl && !logoError;

  return (
    <aside className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col justify-between h-full transition-all duration-200 ease-in-out">
      <div>
        {/* Sidebar Header - Displays uploaded Website Logo & Brand Name */}
        <div className="h-16 px-5 border-b border-zinc-800 flex items-center gap-3 flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/30 overflow-hidden flex-shrink-0">
            {showLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={siteName || "Logo Website"}
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <ShieldCheck className="h-5 w-5 text-blue-500" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="font-bold text-sm text-zinc-50 tracking-tight truncate">
              {siteName || "DevPortfolio"}
            </h2>
            <span className="text-[10px] text-blue-400 font-mono font-medium tracking-wide uppercase">
              Admin Console
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ease-in-out ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-zinc-400"}`} />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
            Pintasan &amp; Akses
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-all duration-200 ease-in-out"
          >
            <Globe className="h-4 w-4 text-zinc-400" />
            Lihat Web Portofolio
          </Link>
          <Link
            href="/cv"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-all duration-200 ease-in-out"
          >
            <FileText className="h-4 w-4 text-zinc-400" />
            Lihat Halaman CV ↗
          </Link>
        </nav>
      </div>
    </aside>
  );
}
