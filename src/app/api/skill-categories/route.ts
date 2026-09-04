import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/skill-categories - Get all skill categories ordered by order ASC, id ASC
export async function GET() {
  try {
    const categories = await prisma.skillCategory.findMany({
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("[GET /api/skill-categories] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data kategori keahlian." },
      { status: 500 }
    );
  }
}

// POST /api/skill-categories - Create a new skill category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, order } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama kategori keahlian wajib diisi." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check duplicate name
    const existing = await prisma.skillCategory.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Kategori "${trimmedName}" sudah ada.` },
        { status: 400 }
      );
    }

    const newCategory = await prisma.skillCategory.create({
      data: {
        name: trimmedName,
        order: typeof order === "number" ? order : 0,
      },
    });

    return NextResponse.json(
      { success: true, message: "Kategori keahlian berhasil ditambahkan.", data: newCategory },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/skill-categories] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan kategori keahlian baru." },
      { status: 500 }
    );
  }
}
