import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id]
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ success: false, message: "Proyek tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { ...project, createdAt: project.createdAt.toISOString() } });
  } catch (error) {
    console.error(`[GET /api/projects/${id}] Error:`, error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data proyek." }, { status: 500 });
  }
}

// PUT /api/projects/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, description, imageUrl, techStack, projectUrl } = body;

    if (!title || !description || !imageUrl || !techStack) {
      return NextResponse.json(
        { success: false, message: "Field title, description, imageUrl, dan techStack wajib diisi." },
        { status: 400 }
      );
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        title: String(title).trim(),
        description: String(description).trim(),
        imageUrl: String(imageUrl).trim(),
        techStack: String(techStack).trim(),
        projectUrl: projectUrl ? String(projectUrl).trim() : null,
      },
    });

    return NextResponse.json({ success: true, data: { ...updated, createdAt: updated.createdAt.toISOString() } });
  } catch (error) {
    console.error(`[PUT /api/projects/${id}] Error:`, error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui proyek." }, { status: 500 });
  }
}

// DELETE /api/projects/[id]
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
  }

  try {
    await prisma.project.delete({ where: { id: projectId } });
    return NextResponse.json({ success: true, message: "Proyek berhasil dihapus." });
  } catch (error) {
    console.error(`[DELETE /api/projects/${id}] Error:`, error);
    return NextResponse.json({ success: false, message: "Gagal menghapus proyek." }, { status: 500 });
  }
}
