import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    
    // 1. Start of today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 2. Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 3. Start of this year
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Fetch summary counts
    const [totalVisitors, todayVisitors, monthVisitors, yearVisitors] = await Promise.all([
      prisma.visitorLog.count(),
      prisma.visitorLog.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.visitorLog.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.visitorLog.count({ where: { createdAt: { gte: startOfYear } } }),
    ]);

    // Fetch all logs for client-side/query aggregation
    const allLogs = await prisma.visitorLog.findMany({
      orderBy: { createdAt: "desc" },
    });

    // 4. Monthly Stats (past 12 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const monthlyMap = new Map<string, { label: string; year: number; monthIndex: number; count: number }>();

    // Initialize past 12 months with 0
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const key = `${year}-${monthIndex}`;
      const label = `${monthNames[monthIndex]} ${year}`;
      monthlyMap.set(key, { label, year, monthIndex, count: 0 });
    }

    // Populate counts
    allLogs.forEach((log) => {
      const logDate = new Date(log.createdAt);
      const key = `${logDate.getFullYear()}-${logDate.getMonth()}`;
      if (monthlyMap.has(key)) {
        monthlyMap.get(key)!.count++;
      }
    });

    const monthlyStats = Array.from(monthlyMap.values());

    // 5. Yearly Stats
    const yearlyMap = new Map<number, number>();
    allLogs.forEach((log) => {
      const year = new Date(log.createdAt).getFullYear();
      yearlyMap.set(year, (yearlyMap.get(year) || 0) + 1);
    });

    const yearlyStats = Array.from(yearlyMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year);

    // 6. Location Stats (Group by Country & City)
    const locationMap = new Map<string, { country: string; city: string; count: number }>();
    allLogs.forEach((log) => {
      const key = `${log.country} - ${log.city}`;
      if (!locationMap.has(key)) {
        locationMap.set(key, { country: log.country, city: log.city, count: 0 });
      }
      locationMap.get(key)!.count++;
    });

    const locationStats = Array.from(locationMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map((item) => ({
        ...item,
        percentage: totalVisitors > 0 ? Math.round((item.count / totalVisitors) * 100) : 0,
      }));

    // 7. Recent 10 Visitor Logs
    const recentLogs = allLogs.slice(0, 10).map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalVisitors,
        todayVisitors,
        monthVisitors,
        yearVisitors,
        monthlyStats,
        yearlyStats,
        locationStats,
        recentLogs,
      },
    });
  } catch (error) {
    console.error("[GET /api/analytics] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data analitik pengunjung." },
      { status: 500 }
    );
  }
}
