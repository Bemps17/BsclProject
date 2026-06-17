import { NextResponse } from "next/server";
import { botAuthErrorResponse } from "@/lib/api-errors";
import { requireBotUser } from "@/lib/bot-auth";
import { isBackendEnabled } from "@/lib/backend";
import { getQueueState, joinQueue, leaveQueue } from "@/lib/queue-service";

export async function GET(request: Request) {
  if (!isBackendEnabled()) {
    return NextResponse.json({ error: "Demo mode" }, { status: 503 });
  }

  try {
    await requireBotUser(request);
    return NextResponse.json(await getQueueState());
  } catch (error) {
    return botAuthErrorResponse(error);
  }
}

export async function POST(request: Request) {
  if (!isBackendEnabled()) {
    return NextResponse.json({ error: "Demo mode" }, { status: 503 });
  }

  try {
    const user = await requireBotUser(request);
    if (!user.player) {
      return NextResponse.json({ error: "Player profile required" }, { status: 400 });
    }

    return NextResponse.json(await joinQueue(user.player.id));
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_IN_QUEUE") {
      return NextResponse.json({ error: "Already in queue" }, { status: 409 });
    }
    return botAuthErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  if (!isBackendEnabled()) {
    return NextResponse.json({ error: "Demo mode" }, { status: 503 });
  }

  try {
    const user = await requireBotUser(request);
    if (!user.player) {
      return NextResponse.json({ error: "Player profile required" }, { status: 400 });
    }

    return NextResponse.json(await leaveQueue(user.player.id));
  } catch (error) {
    return botAuthErrorResponse(error);
  }
}
