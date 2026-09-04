"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Clock, 
  Terminal, 
  Home, 
  Cpu, 
  Briefcase, 
  FileText, 
  MessageSquare 
} from "lucide-react";

interface NavbarProps {
  siteName?: string;
  roleTitle?: string;
  logoUrl?: string | null;
  isCvActive?: boolean;
}

export function Navbar({ siteName, roleTitle, logoUrl, isCvActive = true }: NavbarProps) {
  const pathname = usePathname();
  const [logoError, setLogoError] = useState(false);
  const [timeString, setTimeString] = useState<string>("");
  const [activeSection, setActiveSection] = useState<string>("home");

  const isNavClickingRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showLogo = logoUrl && !logoError;

  // Real-time clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    isNavClickingRef.current = true;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    // Lock scroll-spy override for 1000ms while smooth scroll completes
    clickTimeoutRef.current = setTimeout(() => {
      isNavClickingRef.current = false;
    }, 1000);
  };

  // Active section scroll-spy observer & pathname tracker
  useEffect(() => {
    if (pathname === "/cv") {
      setActiveSection("cv");
      return;
    }

    const handleScroll = () => {
      if (pathname !== "/") return;

      // Ignore scroll events triggered while smooth scrolling from click
      if (isNavClickingRef.current) return;

      // Near top of page -> always "home"
      if (window.scrollY < 120) {
        setActiveSection("home");
        return;
      }

      // Near bottom of page -> always "contact"
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 80) {
        setActiveSection("contact");
        return;
      }

      const contactSec = document.getElementById("contact");
      const projectsSec = document.getElementById("projects");
      const skillsSec = document.getElementById("skills");

      const triggerPoint = window.innerHeight * 0.45; // 45% down viewport

      if (contactSec && contactSec.getBoundingClientRect().top <= triggerPoint) {
        setActiveSection("contact");
      } else if (projectsSec && projectsSec.getBoundingClientRect().top <= triggerPoint) {
        setActiveSection("projects");
      } else if (skillsSec && skillsSec.getBoundingClientRect().top <= triggerPoint) {
        setActiveSection("skills");
      } else {
        setActiveSection("home");
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, [pathname]);

  const navItems = [
    { id: "home", label: "Beranda", href: "/", icon: <Home className="h-4 w-4" /> },
    { id: "skills", label: "Keahlian", href: "/#skills", icon: <Cpu className="h-4 w-4" /> },
    { id: "projects", label: "Proyek", href: "/#projects", icon: <Briefcase className="h-4 w-4" /> },
    { id: "contact", label: "Kontak", href: "/#contact", icon: <MessageSquare className="h-4 w-4" /> },
    ...(isCvActive ? [{ id: "cv", label: "CV / Resume", href: "/cv", icon: <FileText className="h-4 w-4" /> }] : []),
  ];

  return (
    <>
      {/* ── TOP HEADER NAVBAR (Desktop & Mobile Brand Bar) ── */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-lg transition-all duration-300 ease-in-out">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          
          {/* Brand Logo */}
          <Link
            href="/"
            onClick={() => handleNavClick("home")}
            className="flex items-center gap-2.5 group transition-all duration-200 ease-in-out"
          >
            {/* Logo Image or Fallback Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/30 overflow-hidden group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-200 ease-in-out flex-shrink-0">
              {showLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={siteName || "Logo"}
                  className="w-full h-full object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Terminal className="h-5 w-5 text-blue-500 group-hover:text-white transition-colors duration-200" />
              )}
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg text-zinc-50 tracking-tight flex items-center gap-1">
                {siteName || "DevPortfolio"}{" "}
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse inline-block"></span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wide uppercase">
                {roleTitle || "Senior Engineer"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Pill Style) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-zinc-900/60 border border-zinc-800/80 shadow-inner">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-out flex items-center ${
                    isActive
                      ? "text-blue-400 font-bold"
                      : "text-zinc-300 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  {/* Active Animated Pill & Bottom Indicator */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-blue-500/15 border border-blue-500/40 shadow-[0_0_14px_rgba(59,130,246,0.3)] animate-in fade-in zoom-in-95 duration-200">
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]"></span>
                    </span>
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Real-time Clock Widget */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 text-xs font-mono text-zinc-300 shadow-sm select-none">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>{timeString || "--:--:--"}</span>
            <span className="text-[10px] text-zinc-400 font-sans font-semibold uppercase hidden sm:inline ml-0.5">WIB</span>
          </div>
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAVIGATION BAR (Fixed App Bar for Mobile Devices) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-2 shadow-2xl">
        <nav className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => handleNavClick(item.id)}
                className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "text-blue-400 font-bold"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {/* Active Indicator Bar & Background Pill */}
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-blue-500/15 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.25)] animate-in fade-in zoom-in-95 duration-200">
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]"></span>
                  </span>
                )}

                <span className="relative z-10 transition-transform duration-200">
                  {item.icon}
                </span>

                <span className="relative z-10 text-[10px] leading-none tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
