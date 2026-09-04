import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-this";

// POST /api/auth/login - Authenticate admin and return JWT
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    // Find admin by username
    const admin = await prisma.admin.findUnique({
      where: { username: String(username).trim() },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Username atau password salah." },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(String(password), admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Username atau password salah." },
        { status: 401 }
      );
    }

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token as HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
      data: { username: admin.username },
    });

    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/login] Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
