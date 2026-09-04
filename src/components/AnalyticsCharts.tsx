"use client";

import React, { useState } from "react";
import { 
  Users, 
  Globe2, 
  Clock, 
  MapPin, 
  Laptop, 
  Smartphone, 
  Tablet, 
  TrendingUp, 
  Calendar,
  Sparkles,
  BarChart3
} from "lucide-react";

export interface MonthlyStat {
  label: string;
  year: number;
  monthIndex: number;
  count: number;
}

export interface YearlyStat {
  year: number;
  count: number;
}

export interface LocationStat {
  country: string;
  city: string;
  count: number;
  percentage: number;
}

export interface VisitorLogItem {
  id: number;
  ip: string | null;
  country: string;
  city: string;
  device: string;
  path: string;
  createdAt: string;
}

interface AnalyticsChartsProps {
  monthlyStats: MonthlyStat[];
  yearlyStats: YearlyStat[];
  locationStats: LocationStat[];
  recentLogs: VisitorLogItem[];
}

export function AnalyticsCharts({
  monthlyStats,
  yearlyStats,
  locationStats,
  recentLogs,
}: AnalyticsChartsProps) {
  const [chartMode, setChartMode] = useState<"monthly" | "yearly">("monthly");
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ label: string; count: number } | null>(null);

  // Active chart data
  const currentChartData = chartMode === "monthly" 
    ? monthlyStats.map((s) => ({ label: s.label, count: s.count }))
    : yearlyStats.map((s) => ({ label: String(s.year), count: s.count }));

  const maxCount = Math.max(...currentChartData.map((d) => d.count), 1);

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-3.5 w-3.5 text-blue-400" />;
      case "tablet":
        return <Tablet className="h-3.5 w-3.5 text-purple-400" />;
      default:
        return <Laptop className="h-3.5 w-3.5 text-green-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── SECTION 1: GRAFIK PENGUNJUNG INTERAKTIF (BULANAN & TAHUNAN) ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-50 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Grafik Tren Pengunjung Web
            </h3>
            <p className="text-xs text-zinc-400">
              Visualisasi jumlah lalu lintas pengunjung berdasarkan akumulasi {chartMode === "monthly" ? "bulan" : "tahun"}.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartMode("monthly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartMode === "monthly"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Per Bulan (12 Bln)
            </button>

            <button
              type="button"
              onClick={() => setChartMode("yearly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartMode === "yearly"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Per Tahun
            </button>
          </div>
        </div>

        {/* Custom SVG Interactive Bar/Area Chart */}
        <div className="relative pt-6 pb-2">
          
          {/* Hover Tooltip display */}
          <div className="h-6 mb-2 flex items-center justify-between text-xs font-mono">
            {hoveredDataPoint ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-300 animate-in fade-in duration-150">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{hoveredDataPoint.label}: <strong className="text-white">{hoveredDataPoint.count} kunjungan</strong></span>
              </div>
            ) : (
              <span className="text-zinc-400 text-[11px]">Sorot grafik untuk melihat rincian angka</span>
            )}
            <span className="text-[11px] text-zinc-400">Maksimal: {maxCount} Kunjungan</span>
          </div>

          {/* Chart Container */}
          <div className="h-56 w-full flex items-end justify-between gap-1.5 sm:gap-3 pt-6 pb-6 px-2 border-b border-zinc-800/80 bg-zinc-950/40 rounded-xl">
            {currentChartData.map((item, idx) => {
              const heightPercent = Math.max((item.count / maxCount) * 100, 6); // Min 6% for visual clarity
              const isHovered = hoveredDataPoint?.label === item.label;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredDataPoint({ label: item.label, count: item.count })}
                  onMouseLeave={() => setHoveredDataPoint(null)}
                >
                  {/* Top Count Badge on Hover */}
                  <div className={`text-[10px] font-mono font-bold mb-1 transition-all ${
                    isHovered ? "text-blue-400 scale-110 opacity-100" : "text-transparent opacity-0"
                  }`}>
                    {item.count}
                  </div>

                  {/* Bar Element */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isHovered
                        ? "bg-gradient-to-t from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-x-105"
                        : "bg-gradient-to-t from-blue-900/60 to-blue-600/80 hover:bg-blue-500"
                    }`}
                  />
                  
                  {/* Label Text below bar */}
                  <span className={`text-[10px] font-mono mt-2 truncate w-full text-center transition-colors ${
                    isHovered ? "text-blue-400 font-bold" : "text-zinc-400"
                  }`}>
                    {chartMode === "monthly" ? item.label.split(" ")[0] : item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SECTION 2: LOKASI PENGUNJUNG & RECENT LOGS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card Lokasi Pengunjung */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-100">Distribusi Lokasi Pengunjung</h4>
                <p className="text-[11px] text-zinc-400">Kota &amp; Negara asal pengunjung terbesar</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {locationStats.length === 0 ? (
              <p className="text-xs text-zinc-400 py-8 text-center">Belum ada data lokasi.</p>
            ) : (
              locationStats.map((loc, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-200 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-blue-400" />
                      {loc.city}, <span className="text-zinc-400 font-normal">{loc.country}</span>
                    </span>
                    <span className="font-mono text-zinc-300 font-bold">
                      {loc.count} <span className="text-[11px] text-zinc-400 font-normal">({loc.percentage}%)</span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-zinc-950 overflow-hidden border border-zinc-800/80">
                    <div
                      style={{ width: `${Math.max(loc.percentage, 5)}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Activity Feed Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  Riwayat Kunjungan Terkini
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                </h4>
                <p className="text-[11px] text-zinc-400">Log aktivitas pengunjung terupdate secara real-time</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-400">
                <tr>
                  <th className="py-2.5 px-3">Lokasi</th>
                  <th className="py-2.5 px-3">Perangkat</th>
                  <th className="py-2.5 px-3">Halaman</th>
                  <th className="py-2.5 px-3 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 font-sans">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-400">
                      Belum ada aktivitas kunjungan.
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log) => {
                    const timeFormatted = new Date(log.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });

                    return (
                      <tr key={log.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-zinc-200">
                          {log.city}, <span className="text-zinc-400 text-[11px]">{log.country}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-300">
                            {getDeviceIcon(log.device)}
                            {log.device}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-blue-400 truncate max-w-[120px]">
                          {log.path}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-zinc-400 text-[11px]">
                          {timeFormatted}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
