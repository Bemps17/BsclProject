import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/backend";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    httpOnly: true,
  });
  return NextResponse.json({ ok: true });
}
