import { NextResponse } from "next/server";
import { botAuthErrorResponse } from "@/lib/api-errors";
import { requireBotUser } from "@/lib/bot-auth";
import { getActiveMatchForPlayer } from "@/lib/bot-match";
import { isBackendEnabled } from "@/lib/backend";

export async function GET(request: Request) {
  if (!isBackendEnabled()) {
    return NextResponse.json({ error: "Demo mode" }, { status: 503 });
  }

  try {
    const user = await requireBotUser(request);
    if (!user.player) {
      return NextResponse.json({ error: "Player profile required" }, { status: 400 });
    }

    const match = await getActiveMatchForPlayer(user.player.id);
    return NextResponse.json({ match });
  } catch (error) {
    return botAuthErrorResponse(error);
  }
}
