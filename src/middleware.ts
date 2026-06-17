import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  DEMO_COOKIE,
  hasPlatformAccess,
} from "@/lib/backend";
import { buildContentSecurityPolicy } from "@/lib/csp";

function getSessionCookie(request: NextRequest, name: string): string | undefined {
  return request.cookies.get(name)?.value;
}

function isPublicPath(pathname: string): boolean {
  if (pathname === "/login") return true;
  if (pathname.startsWith("/api/")) return true;
  return false;
}

function withSecurityHeaders(response: NextResponse, pathname: string) {
  if (!pathname.startsWith("/api/")) {
    response.headers.set("Content-Security-Policy", buildContentSecurityPolicy());
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return withSecurityHeaders(NextResponse.next(), pathname);
  }

  const demoCookie = request.cookies.get(DEMO_COOKIE)?.value;
  const allowed = hasPlatformAccess({
    demoCookie,
    getSessionCookie: (name) => getSessionCookie(request, name),
  });

  if (!allowed) {
    return withSecurityHeaders(
      NextResponse.redirect(new URL("/login", request.url)),
      pathname,
    );
  }

  return withSecurityHeaders(NextResponse.next(), pathname);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
