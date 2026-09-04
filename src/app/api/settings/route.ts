import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/settings - Fetch website settings (always returns the single row)
export async function GET() {
  try {
    let settings = await prisma.websiteSetting.findFirst();

    if (!settings) {
      settings = await prisma.websiteSetting.create({ data: {} });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("[GET /api/settings] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil pengaturan." },
      { status: 500 }
    );
  }
}

// Shared handler for updating website settings (supports both POST & PUT for Nginx/Proxy compatibility)
async function handleUpdateSettings(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      siteName,
      ownerName,
      roleTitle,
      heroTitle,
      heroSubtitle,
      contactEmail,
      githubUrl,
      discordUrl,
      whatsappUrl,
      logoUrl,
      resumePdfUrl,
      aboutMe,
      isCvActive,
    } = body;

    let settings = await prisma.websiteSetting.findFirst();

    if (!settings) {
      settings = await prisma.websiteSetting.create({ data: {} });
    }

    const updated = await prisma.websiteSetting.update({
      where: { id: settings.id },
      data: {
        ...(siteName !== undefined && { siteName: String(siteName).trim() }),
        ...(ownerName !== undefined && { ownerName: String(ownerName).trim() }),
        ...(roleTitle !== undefined && { roleTitle: String(roleTitle).trim() }),
        ...(heroTitle !== undefined && { heroTitle: String(heroTitle).trim() }),
        ...(heroSubtitle !== undefined && { heroSubtitle: String(heroSubtitle).trim() }),
        ...(contactEmail !== undefined && { contactEmail: String(contactEmail).trim() }),
        ...(githubUrl !== undefined && { githubUrl: String(githubUrl).trim() }),
        ...(discordUrl !== undefined && { discordUrl: String(discordUrl).trim() }),
        ...(whatsappUrl !== undefined && { whatsappUrl: String(whatsappUrl).trim() }),
        ...(logoUrl !== undefined && {
          logoUrl: logoUrl === "" ? null : String(logoUrl).trim(),
        }),
        ...(resumePdfUrl !== undefined && {
          resumePdfUrl: resumePdfUrl === "" ? null : String(resumePdfUrl).trim(),
        }),
        ...(aboutMe !== undefined && {
          aboutMe: aboutMe === "" ? null : String(aboutMe).trim(),
        }),
        ...(isCvActive !== undefined && { isCvActive: Boolean(isCvActive) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[UPDATE /api/settings] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan pengaturan." },
      { status: 500 }
    );
  }
}

// POST /api/settings - Update website settings (compatible with LXC/Nginx strict proxies)
export async function POST(request: NextRequest) {
  return handleUpdateSettings(request);
}

// PUT /api/settings - Update website settings
export async function PUT(request: NextRequest) {
  return handleUpdateSettings(request);
}
