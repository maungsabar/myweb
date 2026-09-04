import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const path = body?.path && typeof body.path === "string" ? body.path : "/";

    // Extract Client IP
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    let ip = forwarded ? forwarded.split(",")[0].trim() : realIp || "127.0.0.1";

    // User Agent & Device Detection
    const userAgent = request.headers.get("user-agent") || "";
    let device = "Desktop";
    if (/mobile/i.test(userAgent)) device = "Mobile";
    else if (/tablet|ipad/i.test(userAgent)) device = "Tablet";

    // Localhost IP Geolocation Simulation
    let country = "Indonesia";
    let city = "Jakarta";

    const isLocalhost = ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.");

    if (isLocalhost) {
      const sampleCities = [
        { city: "Jakarta", country: "Indonesia" },
        { city: "Bandung", country: "Indonesia" },
        { city: "Surabaya", country: "Indonesia" },
      ];
      const randomLoc = sampleCities[Math.floor(Math.random() * sampleCities.length)];
      city = randomLoc.city;
      country = randomLoc.country;
    } else {
      // GeoIP Lookup for real public IP
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === "success") {
            if (geoData.country) country = geoData.country;
            if (geoData.city) city = geoData.city;
          }
        }
      } catch {
        // Fallback to default if GeoIP timeout or offline
      }
    }

    // Debouncing: Check if same IP visited same path in last 15 minutes to prevent spamming
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentVisit = await prisma.visitorLog.findFirst({
      where: {
        ip,
        path,
        createdAt: { gte: fifteenMinsAgo },
      },
    });

    if (recentVisit) {
      return NextResponse.json({ success: true, message: "Kunjungan terkini sudah dicatat." });
    }

    // Create New Visitor Log
    await prisma.visitorLog.create({
      data: {
        ip,
        country,
        city,
        device,
        path,
      },
    });

    return NextResponse.json({ success: true, message: "Kunjungan berhasil dicatat." });
  } catch (error) {
    console.error("[POST /api/track-visit] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal mencatat kunjungan." }, { status: 500 });
  }
}
