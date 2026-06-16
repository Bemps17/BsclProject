import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const matches = await prisma.match.findMany({
    orderBy: { number: "desc" },
    take: 50,
    include: {
      teams: true,
      players: {
        include: { player: { select: { displayName: true } } },
      },
    },
  });

  return NextResponse.json(
    matches.map((m) => ({
      id: m.id,
      number: m.number,
      status: m.status,
      alphaScore: m.alphaScore,
      bravoScore: m.bravoScore,
      alpha: m.teams.find((t) => t.side === "ALPHA")?.name,
      bravo: m.teams.find((t) => t.side === "BRAVO")?.name,
      createdAt: m.createdAt,
    })),
  );
}
