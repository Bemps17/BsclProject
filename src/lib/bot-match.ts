import { MatchStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const ACTIVE_MATCH_STATUSES: MatchStatus[] = ["DRAFT", "LIVE", "SUBMITTED"];

export async function getActiveMatchForPlayer(playerId: string) {
  const matchPlayer = await prisma.matchPlayer.findFirst({
    where: {
      playerId,
      match: { status: { in: ACTIVE_MATCH_STATUSES } },
    },
    include: {
      match: {
        select: {
          id: true,
          number: true,
          status: true,
          alphaScore: true,
          bravoScore: true,
          captainAlpha: true,
          captainBravo: true,
        },
      },
    },
    orderBy: { match: { createdAt: "desc" } },
  });

  return matchPlayer?.match ?? null;
}
