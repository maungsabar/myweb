import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/users - Fetch all admin users (without password hashes)
export async function GET() {
  try {
    const users = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("[GET /api/users] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar user." },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new admin user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        { success: false, message: "Username wajib diisi." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password minimal 6 karakter." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();

    // Check if username already exists
    const existing = await prisma.admin.findUnique({
      where: { username: cleanUsername },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Username sudah digunakan oleh admin lain." },
        { status: 400 }
      );
    }

    // Hash password with bcrypt (salt rounds: 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.admin.create({
      data: {
        username: cleanUsername,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `User admin ${newUser.username} berhasil dibuat.`,
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/users] Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat menambahkan user admin." },
      { status: 500 }
    );
  }
}
