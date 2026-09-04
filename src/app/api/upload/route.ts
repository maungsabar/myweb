import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Max file size: 2MB
const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "image/gif"];
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// POST /api/upload - Upload a logo image file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Tidak ada file yang dikirim." },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Format file tidak didukung. Gunakan PNG, JPG, WebP, SVG, atau GIF." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "Ukuran file terlalu besar. Maksimal 2MB." },
        { status: 400 }
      );
    }

    // Generate unique filename using timestamp + original extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const filename = `logo-${Date.now()}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Delete old logo files to keep uploads folder clean
    try {
      const { readdir } = await import("fs/promises");
      const existing = await readdir(UPLOAD_DIR);
      for (const f of existing) {
        if (f.startsWith("logo-") && f !== filename) {
          const oldPath = path.join(UPLOAD_DIR, f);
          if (existsSync(oldPath)) {
            await unlink(oldPath);
          }
        }
      }
    } catch {
      // Non-fatal: if cleanup fails, continue
    }

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL path
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      message: "Logo berhasil diupload.",
      data: { url: publicUrl },
    });
  } catch (error) {
    console.error("[POST /api/upload] Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat mengupload file." },
      { status: 500 }
    );
  }
}

// DELETE /api/upload - Remove the current logo file
export async function DELETE(request: NextRequest) {
  try {
    const { filename } = await request.json();

    if (!filename || typeof filename !== "string") {
      return NextResponse.json(
        { success: false, message: "Nama file tidak valid." },
        { status: 400 }
      );
    }

    // Security: only allow deleting files from uploads folder, no path traversal
    const safeName = path.basename(filename);
    const filepath = path.join(UPLOAD_DIR, safeName);

    if (existsSync(filepath)) {
      await unlink(filepath);
    }

    return NextResponse.json({ success: true, message: "File berhasil dihapus." });
  } catch (error) {
    console.error("[DELETE /api/upload] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus file." },
      { status: 500 }
    );
  }
}
