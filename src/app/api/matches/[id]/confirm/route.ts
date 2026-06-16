import { NextResponse } from "next/server";
import { isBackendEnabled } from "@/lib/backend";
import { requireAuth } from "@/lib/auth";
import { matchLifecycleErrorResponse } from "@/lib/api-errors";
import { confirmMatchResult } from "@/lib/match-lifecycle";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  if (!isBackendEnabled()) {
    return NextResponse.json({ error: "Demo mode" }, { status: 503 });
  }

  try {
    const user = await requireAuth("PLAYER");
    if (!user.player) {
      return NextResponse.json({ error: "Player profile required" }, { status: 400 });
    }

    const { id } = await context.params;
    const result = await confirmMatchResult(id, user.player.id);

    return NextResponse.json({
      match: {
        id: result.match.id,
        number: result.match.number,
        status: result.match.status,
        alphaScore: result.match.alphaScore,
        bravoScore: result.match.bravoScore,
      },
      alreadyConfirmed: result.alreadyConfirmed,
    });
  } catch (error) {
    return matchLifecycleErrorResponse(error);
  }
}
