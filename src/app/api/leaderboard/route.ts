import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RANK_LABELS } from "@/lib/elo";

export async function GET() {
  const players = await prisma.player.findMany({
    orderBy: { elo: "desc" },
    take: 100,
    include: {
      user: { select: { username: true, avatar: true } },
    },
  });

  return NextResponse.json(
    players.map((p, i) => ({
      position: i + 1,
      id: p.id,
      name: p.displayName,
      username: p.user.username,
      avatar: p.user.avatar,
      rank: p.rank,
      rankLabel: RANK_LABELS[p.rank],
      elo: p.elo,
      wins: p.wins,
      losses: p.losses,
      winRate:
        p.wins + p.losses > 0
          ? Math.round((p.wins / (p.wins + p.losses)) * 100)
          : 0,
    })),
  );
}
