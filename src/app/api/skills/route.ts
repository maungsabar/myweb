import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/skills - Fetch all skills ordered by order ASC, id ASC
export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });

    return NextResponse.json({ success: true, data: skills });
  } catch (error) {
    console.error("[GET /api/skills] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data keahlian." },
      { status: 500 }
    );
  }
}

// POST /api/skills - Create new skill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, iconName, order } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama keahlian wajib diisi." },
        { status: 400 }
      );
    }

    const newSkill = await prisma.skill.create({
      data: {
        name: name.trim(),
        category: category && typeof category === "string" && category.trim() ? category.trim() : "Programming & Web Development",
        iconName: iconName && typeof iconName === "string" ? iconName.trim() : null,
        order: typeof order === "number" ? order : 0,
      },
    });

    return NextResponse.json(
      { success: true, message: "Keahlian berhasil ditambahkan.", data: newSkill },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/skills] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan keahlian baru." },
      { status: 500 }
    );
  }
}
