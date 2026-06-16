import { NextResponse } from "next/server";
import { isBackendEnabled } from "@/lib/backend";
import { requireAuth } from "@/lib/auth";
import { matchLifecycleErrorResponse } from "@/lib/api-errors";
import { submitMatchResult } from "@/lib/match-lifecycle";
import { matchScoreSchema } from "@/lib/validators/match";

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

    const body = await request.json();
    const parsed = matchScoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid scores" },
        { status: 400 },
      );
    }

    const { id } = await context.params;
    const match = await submitMatchResult(id, user.player.id, parsed.data);

    return NextResponse.json({
      match: {
        id: match.id,
        number: match.number,
        status: match.status,
        alphaScore: match.alphaScore,
        bravoScore: match.bravoScore,
      },
    });
  } catch (error) {
    return matchLifecycleErrorResponse(error);
  }
}
