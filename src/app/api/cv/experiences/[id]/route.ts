import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/cv/experiences/[id] - Get single experience
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
    }

    const experience = await prisma.experience.findUnique({ where: { id } });
    if (!experience) {
      return NextResponse.json({ success: false, message: "Pengalaman tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: experience });
  } catch (error) {
    console.error("[GET /api/cv/experiences/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data." }, { status: 500 });
  }
}

// PUT /api/cv/experiences/[id] - Update experience
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
    }

    const body = await request.json();
    const { company, position, period, location, description, order } = body;

    const existing = await prisma.experience.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Pengalaman tidak ditemukan." }, { status: 404 });
    }

    const updated = await prisma.experience.update({
      where: { id },
      data: {
        ...(company !== undefined && { company: String(company).trim() }),
        ...(position !== undefined && { position: String(position).trim() }),
        ...(period !== undefined && { period: String(period).trim() }),
        ...(location !== undefined && { location: location ? String(location).trim() : null }),
        ...(description !== undefined && { description: String(description).trim() }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/cv/experiences/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal me-update pengalaman." }, { status: 500 });
  }
}

// DELETE /api/cv/experiences/[id] - Delete experience
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
    }

    const existing = await prisma.experience.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Pengalaman tidak ditemukan." }, { status: 404 });
    }

    await prisma.experience.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Pengalaman berhasil dihapus." });
  } catch (error) {
    console.error("[DELETE /api/cv/experiences/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus pengalaman." }, { status: 500 });
  }
}
