import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cv/educations - Fetch all education entries
export async function GET() {
  try {
    const educations = await prisma.education.findMany({
      orderBy: [{ order: "asc" }, { id: "desc" }],
    });
    return NextResponse.json({ success: true, data: educations });
  } catch (error) {
    console.error("[GET /api/cv/educations] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data pendidikan." },
      { status: 500 }
    );
  }
}

// POST /api/cv/educations - Create new education entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { institution, degree, period, description, order } = body;

    if (!institution || !degree || !period) {
      return NextResponse.json(
        { success: false, message: "Nama instansi/universitas, gelar/jurusan, dan periode wajib diisi." },
        { status: 400 }
      );
    }

    const newEducation = await prisma.education.create({
      data: {
        institution: String(institution).trim(),
        degree: String(degree).trim(),
        period: String(period).trim(),
        description: description ? String(description).trim() : null,
        order: typeof order === "number" ? order : 0,
      },
    });

    return NextResponse.json({ success: true, data: newEducation }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/cv/educations] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan pendidikan." },
      { status: 500 }
    );
  }
}
