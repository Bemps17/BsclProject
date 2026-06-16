import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  DEMO_COOKIE,
  hasPlatformAccess,
} from "@/lib/backend";

function getSessionCookie(request: NextRequest, name: string): string | undefined {
  return request.cookies.get(name)?.value;
}

function isPublicPath(pathname: string): boolean {
  if (pathname === "/login") return true;
  if (pathname.startsWith("/api/")) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const demoCookie = request.cookies.get(DEMO_COOKIE)?.value;
  const allowed = hasPlatformAccess({
    demoCookie,
    getSessionCookie: (name) => getSessionCookie(request, name),
  });

  if (!allowed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
