import { NextResponse } from "next/server";
import { isBackendEnabled } from "@/lib/backend";
import { requireAuth } from "@/lib/auth";
import { matchLifecycleErrorResponse } from "@/lib/api-errors";
import { disputeMatchResult } from "@/lib/match-lifecycle";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isBackendEnabled()) {
    return NextResponse.json({ error: "Demo mode" }, { status: 503 });
  }

  try {
    const user = await requireAuth("PLAYER");
    if (!user.player) {
      return NextResponse.json({ error: "Player profile required" }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    const { id } = await context.params;
    const match = await disputeMatchResult(id, user.player.id, user.id, body.reason);

    return NextResponse.json({
      match: {
        id: match.id,
        number: match.number,
        status: match.status,
      },
    });
  } catch (error) {
    return matchLifecycleErrorResponse(error);
  }
}
