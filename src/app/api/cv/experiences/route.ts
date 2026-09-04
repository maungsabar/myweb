import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cv/experiences - Fetch all work experience entries
export async function GET() {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: [{ order: "asc" }, { id: "desc" }],
    });
    return NextResponse.json({ success: true, data: experiences });
  } catch (error) {
    console.error("[GET /api/cv/experiences] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data pengalaman kerja." },
      { status: 500 }
    );
  }
}

// POST /api/cv/experiences - Create new work experience entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, position, period, location, description, order } = body;

    if (!company || !position || !period || !description) {
      return NextResponse.json(
        { success: false, message: "Nama perusahaan, posisi, periode, dan deskripsi wajib diisi." },
        { status: 400 }
      );
    }

    const newExperience = await prisma.experience.create({
      data: {
        company: String(company).trim(),
        position: String(position).trim(),
        period: String(period).trim(),
        location: location ? String(location).trim() : null,
        description: String(description).trim(),
        order: typeof order === "number" ? order : 0,
      },
    });

    return NextResponse.json({ success: true, data: newExperience }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/cv/experiences] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan pengalaman kerja." },
      { status: 500 }
    );
  }
}
