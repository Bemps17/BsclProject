import { NextResponse } from "next/server";
import { botAuthErrorResponse, matchLifecycleErrorResponse } from "@/lib/api-errors";
import { BotAuthError, requireBotUser } from "@/lib/bot-auth";
import { isBackendEnabled } from "@/lib/backend";
import { disputeMatchResult } from "@/lib/match-lifecycle";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isBackendEnabled()) {
    return NextResponse.json({ error: "Demo mode" }, { status: 503 });
  }

  try {
    const user = await requireBotUser(request);
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
    if (error instanceof BotAuthError) return botAuthErrorResponse(error);
    return matchLifecycleErrorResponse(error);
  }
}
