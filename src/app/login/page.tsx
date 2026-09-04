"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Username dan password wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        window.location.href = "/admin";
      } else {
        setErrorMsg(data.message || "Username atau password salah.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col justify-between items-center p-4 relative overflow-hidden selection:bg-blue-600/30">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Link */}
      <header className="w-full max-w-7xl pt-4 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-blue-400 transition-all duration-200 ease-in-out"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Portofolio
        </Link>
      </header>

      {/* Center Login Card */}
      <main className="w-full max-w-md my-auto z-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl space-y-6">
          
          {/* Header Icon & Title */}
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">
              Portal Login Admin
            </h1>
            <p className="text-xs text-zinc-400">
              Masuk untuk mengelola data proyek portofolio Anda.
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-lg bg-red-950/40 border border-red-500/30 p-3 text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Username Admin
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  id="login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 pl-9 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 pl-9 pr-10 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-70 transition-all duration-200 ease-in-out"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  Masuk ke Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center pb-4 text-[11px] text-zinc-400 z-10">
        © 2026 DepersaDev
      </footer>
    </div>
  );
}
