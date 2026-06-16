import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const entries = await prisma.queueEntry.findMany({
    where: { status: "WAITING" },
    orderBy: { joinedAt: "asc" },
    include: {
      player: {
        include: { user: { select: { username: true, avatar: true } } },
      },
    },
  });

  return NextResponse.json({
    count: entries.length,
    needed: Math.max(0, 10 - entries.length),
    players: entries.map((e) => ({
      id: e.playerId,
      name: e.player.displayName,
      initials: e.player.displayName.slice(0, 2).toUpperCase(),
      joinedAt: e.joinedAt,
    })),
  });
}

export async function POST() {
  const { requireAuth } = await import("@/lib/auth");
  try {
    const user = await requireAuth("PLAYER");
    if (!user.player) {
      return NextResponse.json({ error: "Player profile required" }, { status: 400 });
    }

    const existing = await prisma.queueEntry.findFirst({
      where: {
        playerId: user.player.id,
        status: "WAITING",
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already in queue" }, { status: 409 });
    }

    const entry = await prisma.queueEntry.create({
      data: {
        playerId: user.player.id,
        status: "WAITING",
      },
    });

    const count = await prisma.queueEntry.count({ where: { status: "WAITING" } });

    return NextResponse.json({ entry, count, ready: count >= 10 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}

export async function DELETE() {
  const { requireAuth } = await import("@/lib/auth");
  try {
    const user = await requireAuth("PLAYER");
    if (!user.player) {
      return NextResponse.json({ error: "Player profile required" }, { status: 400 });
    }

    await prisma.queueEntry.updateMany({
      where: {
        playerId: user.player.id,
        status: "WAITING",
      },
      data: { status: "LEFT", leftAt: new Date() },
    });

    const count = await prisma.queueEntry.count({ where: { status: "WAITING" } });
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
