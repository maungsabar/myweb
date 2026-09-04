"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown, UserCheck } from "lucide-react";

export function AdminHeader() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string>("DevPortfolio");
  const [logoError, setLogoError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        // Fallback silently
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore network error, still redirect
    }
    window.location.href = "/login";
  };

  // Close dropdown if user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showLogo = logoUrl && !logoError;

  return (
    <header className="h-16 flex-shrink-0 border-b border-zinc-800 bg-zinc-900 px-6 flex items-center justify-between z-40">
      {/* Title / Status */}
      <div className="flex items-center gap-3">
        {showLogo && (
          <div className="h-7 w-7 rounded-md overflow-hidden bg-blue-600/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt={siteName}
              className="w-full h-full object-contain"
              onError={() => setLogoError(true)}
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-zinc-200 tracking-wide">
            Dashboard Manajemen Proyek — <span className="text-blue-400 font-bold">{siteName}</span>
          </span>
        </div>
      </div>

      {/* Right side: Clickable Administrator Profile Badge with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-blue-500/40 transition-all duration-200 ease-in-out cursor-pointer group"
          aria-expanded={isDropdownOpen}
          aria-label="Menu Administrator"
        >
          <div className="h-7 w-7 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center font-bold text-[11px] text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all overflow-hidden">
            {showLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Admin Logo"
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              "AD"
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-zinc-200 leading-tight group-hover:text-white">
              Administrator
            </span>
            <span className="text-[10px] text-zinc-400 font-mono leading-none">
              admin@portfolio.local
            </span>
          </div>
          <ChevronDown
            className={`h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180 text-blue-400" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu Popover */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header info inside dropdown */}
            <div className="px-3 py-2 border-b border-zinc-800 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <UserCheck className="h-3.5 w-3.5 text-blue-400" />
                Sesi Login Aktif
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                Role: Super Administrator
              </p>
            </div>

            {/* Hidden Logout Button Revealed On Click */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 ease-in-out cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Keluar Sesi (Logout)
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
