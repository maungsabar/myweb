import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/projects - Fetch all projects (ordered by newest first)
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Convert techStack string to array for API consistency
    const formatted = projects.map((p) => ({
      ...p,
      techStack: p.techStack,
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("[GET /api/projects] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data proyek." },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, techStack, projectUrl, features } = body;

    if (!title || !description || !techStack) {
      return NextResponse.json(
        { success: false, message: "Field title, description, dan techStack wajib diisi." },
        { status: 400 }
      );
    }

    const defaultImage = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop";
    const finalImageUrl = imageUrl && String(imageUrl).trim() ? String(imageUrl).trim() : defaultImage;

    const project = await prisma.project.create({
      data: {
        title: String(title).trim(),
        description: String(description).trim(),
        imageUrl: finalImageUrl,
        techStack: String(techStack).trim(),
        projectUrl: projectUrl ? String(projectUrl).trim() : null,
        features: features ? String(features).trim() : null,
      },
    });

    return NextResponse.json(
      { success: true, data: { ...project, createdAt: project.createdAt.toISOString() } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/projects] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat proyek baru." },
      { status: 500 }
    );
  }
}
