import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/admin"];
const PUBLIC_ONLY_PATHS = ["/login"];

/**
 * Validates JWT token in Next.js Edge Runtime environment.
 * Decodes base64url payload and checks expiration and structure
 * without requiring Node.js 'crypto' module.
 */
function isTokenValid(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Decode base64url payload
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }

    return Boolean(payload.id && payload.username);
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("admin-token")?.value;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isPublicOnly = PUBLIC_ONLY_PATHS.some((path) => pathname.startsWith(path));

  const isValidToken = token ? isTokenValid(token) : false;

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !isValidToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  if (isPublicOnly && isValidToken) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
