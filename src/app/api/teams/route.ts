import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const teams = await prisma.team.findMany({
    orderBy: { wins: "desc" },
    include: {
      captain: { select: { displayName: true } },
      _count: { select: { members: true } },
    },
  });

  return NextResponse.json(
    teams.map((t) => ({
      id: t.id,
      name: t.name,
      tag: t.tag,
      logoUrl: t.logoUrl,
      members: t._count.members,
      wins: t.wins,
      losses: t.losses,
      winRate:
        t.wins + t.losses > 0
          ? Math.round((t.wins / (t.wins + t.losses)) * 100)
          : 0,
      recruiting: t.recruiting,
      captain: t.captain.displayName,
    })),
  );
}
