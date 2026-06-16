import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/backend";

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
  return NextResponse.json({ ok: true });
}
