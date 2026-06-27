import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/app/lib/jwt";

const protectedRoutes: Record<string, string[]> = {
  "/admin": ["admin"],
  "/lecturer": ["lecturer"],
  "/student": ["student"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/login") {
    return NextResponse.next();
  }

  const routeRole = Object.entries(protectedRoutes).find(([prefix]) =>
    pathname.startsWith(prefix)
  );

  if (!routeRole) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = await verifyAccessToken(accessToken);
  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  const [_, allowedRoles] = routeRole;
  if (!allowedRoles.includes(payload.role)) {
    if (payload.role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
    if (payload.role === "lecturer") return NextResponse.redirect(new URL("/lecturer", req.url));
    if (payload.role === "student") return NextResponse.redirect(new URL("/student", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/lecturer/:path*", "/student/:path*"],
};
