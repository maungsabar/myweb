import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: {
    id: string;
  };
}

// PUT /api/skill-categories/[id] - Update category by ID
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
    }

    const existing = await prisma.skillCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Kategori tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json();
    const { name, order } = body;

    let updatedName = existing.name;
    if (name && typeof name === "string" && name.trim()) {
      updatedName = name.trim();
      
      // Check if duplicate with another category
      const duplicate = await prisma.skillCategory.findFirst({
        where: {
          name: updatedName,
          NOT: { id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: `Kategori "${updatedName}" sudah digunakan.` },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.skillCategory.update({
      where: { id },
      data: {
        name: updatedName,
        ...(order !== undefined && { order: Number(order) || 0 }),
      },
    });

    // Cascade update category name in skills table if category name changed!
    if (existing.name !== updatedName) {
      await prisma.skill.updateMany({
        where: { category: existing.name },
        data: { category: updatedName },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Kategori keahlian berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("[PUT /api/skill-categories/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui kategori." }, { status: 500 });
  }
}

// DELETE /api/skill-categories/[id] - Delete category by ID
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
    }

    const existing = await prisma.skillCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Kategori tidak ditemukan." }, { status: 404 });
    }

    // Check if any skills are using this category
    const skillsCount = await prisma.skill.count({
      where: { category: existing.name },
    });

    if (skillsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Tidak dapat menghapus kategori "${existing.name}" karena masih ada ${skillsCount} keahlian yang terdaftar di dalamnya. Hapus atau pindahkan keahlian tersebut terlebih dahulu.`,
        },
        { status: 400 }
      );
    }

    await prisma.skillCategory.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Kategori "${existing.name}" berhasil dihapus.`,
    });
  } catch (error) {
    console.error("[DELETE /api/skill-categories/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus kategori." }, { status: 500 });
  }
}
