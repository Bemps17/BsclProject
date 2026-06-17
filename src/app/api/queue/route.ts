import { NextResponse } from "next/server";
import { isBackendEnabled } from "@/lib/backend";
import { getQueueState, joinQueue, leaveQueue } from "@/lib/queue-service";

export async function GET() {
  if (!isBackendEnabled()) {
    return NextResponse.json({ count: 0, needed: 10, players: [] });
  }
  return NextResponse.json(await getQueueState());
}

export async function POST() {
  if (!isBackendEnabled()) {
    return NextResponse.json({ error: "Demo mode" }, { status: 503 });
  }
  const { requireAuth } = await import("@/lib/auth");
  try {
    const user = await requireAuth("PLAYER");
    if (!user.player) {
      return NextResponse.json({ error: "Player profile required" }, { status: 400 });
    }

    return NextResponse.json(await joinQueue(user.player.id));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }
    if (msg === "ALREADY_IN_QUEUE") {
      return NextResponse.json({ error: "Already in queue" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}

export async function DELETE() {
  if (!isBackendEnabled()) {
    return NextResponse.json({ error: "Demo mode" }, { status: 503 });
  }
  const { requireAuth } = await import("@/lib/auth");
  try {
    const user = await requireAuth("PLAYER");
    if (!user.player) {
      return NextResponse.json({ error: "Player profile required" }, { status: 400 });
    }

    return NextResponse.json(await leaveQueue(user.player.id));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
