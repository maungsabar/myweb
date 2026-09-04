import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface Params {
  params: {
    id: string;
  };
}

// Helper to decode user ID from admin_token JWT cookie
function getLoggedInUserId(request: NextRequest): number | null {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
    return typeof payload.id === "number" ? payload.id : null;
  } catch {
    return null;
  }
}

// GET /api/users/[id] - Get single user details
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
    }

    const user = await prisma.admin.findUnique({
      where: { id },
      select: { id: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("[GET /api/users/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data user." }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update username and/or password
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
    }

    const existing = await prisma.admin.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json();
    const { username, password } = body;

    const updateData: { username?: string; password?: string } = {};

    // Validate username if provided
    if (username !== undefined) {
      const cleanUsername = String(username).trim();
      if (!cleanUsername) {
        return NextResponse.json({ success: false, message: "Username tidak boleh kosong." }, { status: 400 });
      }

      // Check uniqueness if username changed
      if (cleanUsername !== existing.username) {
        const usernameCheck = await prisma.admin.findUnique({ where: { username: cleanUsername } });
        if (usernameCheck) {
          return NextResponse.json(
            { success: false, message: "Username sudah digunakan oleh admin lain." },
            { status: 400 }
          );
        }
      }
      updateData.username = cleanUsername;
    }

    // Hash password if provided
    if (password !== undefined && password !== "") {
      if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json({ success: false, message: "Password minimal 6 karakter." }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(password, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: "Tidak ada data yang diubah." }, { status: 400 });
    }

    const updatedUser = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: { id: true, username: true },
    });

    return NextResponse.json({
      success: true,
      message: `Data user ${updatedUser.username} berhasil diperbarui.`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("[PUT /api/users/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui user." }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete admin user with safeguards
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
    }

    const existing = await prisma.admin.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan." }, { status: 404 });
    }

    // Safeguard 1: Mencegah penghapusan jika hanya ada 1 admin
    const totalAdmins = await prisma.admin.count();
    if (totalAdmins <= 1) {
      return NextResponse.json(
        { success: false, message: "Tidak dapat menghapus admin terakhir. Sistem membutuhkan minimal 1 admin." },
        { status: 400 }
      );
    }

    // Safeguard 2: Mencegah admin menghapus akunnya sendiri yang sedang login
    const currentUserId = getLoggedInUserId(request);
    if (currentUserId === id) {
      return NextResponse.json(
        { success: false, message: "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif." },
        { status: 400 }
      );
    }

    await prisma.admin.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `User admin "${existing.username}" berhasil dihapus.`,
    });
  } catch (error) {
    console.error("[DELETE /api/users/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus user." }, { status: 500 });
  }
}
