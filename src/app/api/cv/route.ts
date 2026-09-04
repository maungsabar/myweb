import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cv - Fetch public CV data (settings, experiences, educations)
export async function GET() {
  try {
    const [settings, experiences, educations] = await Promise.all([
      prisma.websiteSetting.findFirst(),
      prisma.experience.findMany({
        orderBy: [{ order: "asc" }, { id: "desc" }],
      }),
      prisma.education.findMany({
        orderBy: [{ order: "asc" }, { id: "desc" }],
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        settings,
        experiences,
        educations,
      },
    });
  } catch (error) {
    console.error("[GET /api/cv] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data CV." },
      { status: 500 }
    );
  }
}
