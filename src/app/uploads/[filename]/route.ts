import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Helper to determine Content-Type header from file extension
function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    case "gif":
      return "image/gif";
    case "ico":
      return "image/x-icon";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

interface RouteParams {
  params: Promise<{ filename: string }>;
}

// GET /uploads/[filename] - Serve uploaded files dynamically from disk (crucial for production LXC/Next.js builds)
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = await params;
    if (!filename) {
      return new NextResponse("Filename is required", { status: 400 });
    }

    // Security: sanitize filename to prevent path traversal
    const safeName = path.basename(filename);
    const filepath = path.join(UPLOAD_DIR, safeName);

    if (!existsSync(filepath)) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const fileBuffer = await readFile(filepath);
    const contentType = getContentType(safeName);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[GET /uploads/[filename]] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
