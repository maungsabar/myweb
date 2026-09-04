import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/cv/educations/[id] - Get single education
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
    }

    const education = await prisma.education.findUnique({ where: { id } });
    if (!education) {
      return NextResponse.json({ success: false, message: "Pendidikan tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: education });
  } catch (error) {
    console.error("[GET /api/cv/educations/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data." }, { status: 500 });
  }
}

// PUT /api/cv/educations/[id] - Update education
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
    }

    const body = await request.json();
    const { institution, degree, period, description, order } = body;

    const existing = await prisma.education.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Pendidikan tidak ditemukan." }, { status: 404 });
    }

    const updated = await prisma.education.update({
      where: { id },
      data: {
        ...(institution !== undefined && { institution: String(institution).trim() }),
        ...(degree !== undefined && { degree: String(degree).trim() }),
        ...(period !== undefined && { period: String(period).trim() }),
        ...(description !== undefined && { description: description ? String(description).trim() : null }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/cv/educations/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal me-update pendidikan." }, { status: 500 });
  }
}

// DELETE /api/cv/educations/[id] - Delete education
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
    }

    const existing = await prisma.education.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Pendidikan tidak ditemukan." }, { status: 404 });
    }

    await prisma.education.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Pendidikan berhasil dihapus." });
  } catch (error) {
    console.error("[DELETE /api/cv/educations/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus pendidikan." }, { status: 500 });
  }
}
