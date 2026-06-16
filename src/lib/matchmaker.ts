import { PUG_QUEUE_SIZE } from "@/lib/match";
import { assignPugTeams } from "@/lib/team-balance";
import { prisma } from "@/lib/prisma";

export type CreatedMatchSummary = {
  matchId: string;
  matchNumber: number;
};

/** Pop the oldest waiting queue entries and create a LIVE 5v5 match. */
export async function tryCreateMatchFromQueue(): Promise<CreatedMatchSummary | null> {
  return prisma.$transaction(async (tx) => {
    const entries = await tx.queueEntry.findMany({
      where: { status: "WAITING" },
      orderBy: { joinedAt: "asc" },
      take: PUG_QUEUE_SIZE,
      include: { player: true },
    });

    if (entries.length < PUG_QUEUE_SIZE) return null;

    const assignment = assignPugTeams(
      entries.map((e) => ({
        id: e.player.id,
        elo: e.player.elo,
        displayName: e.player.displayName,
      })),
    );

    const season = await tx.season.findFirst({
      where: { active: true },
      orderBy: { number: "desc" },
    });

    const match = await tx.match.create({
      data: {
        seasonId: season?.id,
        status: "LIVE",
        captainAlpha: assignment.captainAlpha,
        captainBravo: assignment.captainBravo,
        draftOrder: assignment.draftOrder,
        teams: {
          create: [
            { side: "ALPHA", name: "Alpha" },
            { side: "BRAVO", name: "Bravo" },
          ],
        },
        players: {
          create: [
            ...assignment.alphaIds.map((playerId) => ({ playerId, side: "ALPHA" })),
            ...assignment.bravoIds.map((playerId) => ({ playerId, side: "BRAVO" })),
          ],
        },
      },
    });

    await tx.queueEntry.updateMany({
      where: { id: { in: entries.map((e) => e.id) } },
      data: { status: "MATCH_CREATED" },
    });

    return { matchId: match.id, matchNumber: match.number };
  });
}

/** Drain the queue while 10+ players are waiting. */
export async function processQueueMatchmaking(): Promise<CreatedMatchSummary[]> {
  const created: CreatedMatchSummary[] = [];
  for (;;) {
    const match = await tryCreateMatchFromQueue();
    if (!match) break;
    created.push(match);
  }
  return created;
}
