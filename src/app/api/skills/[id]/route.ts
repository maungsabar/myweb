import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/skills/[id] - Get single skill
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
    }

    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) {
      return NextResponse.json({ success: false, message: "Keahlian tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: skill });
  } catch (error) {
    console.error("[GET /api/skills/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data keahlian." }, { status: 500 });
  }
}

// PUT /api/skills/[id] - Update skill by ID
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
    }

    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Keahlian tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json();
    const { name, category, iconName, order } = body;

    const updated = await prisma.skill.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(category !== undefined && { category: String(category).trim() }),
        ...(iconName !== undefined && { iconName: iconName ? String(iconName).trim() : null }),
        ...(order !== undefined && { order: Number(order) || 0 }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data keahlian berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("[PUT /api/skills/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui keahlian." }, { status: 500 });
  }
}

// DELETE /api/skills/[id] - Delete skill by ID
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
    }

    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Keahlian tidak ditemukan." }, { status: 404 });
    }

    await prisma.skill.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Keahlian "${existing.name}" berhasil dihapus.`,
    });
  } catch (error) {
    console.error("[DELETE /api/skills/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus keahlian." }, { status: 500 });
  }
}
