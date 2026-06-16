import { snakeDraftOrder, type DraftSide, PUG_QUEUE_SIZE } from "@/lib/match";

export type DraftPlayer = {
  id: string;
  elo: number;
  displayName: string;
};

export type PugTeamAssignment = {
  captainAlpha: string;
  captainBravo: string;
  alphaIds: string[];
  bravoIds: string[];
  draftOrder: DraftSide[];
};

/** Top two ELO players captain; remaining eight auto-assigned via snake draft. */
export function assignPugTeams(players: DraftPlayer[]): PugTeamAssignment {
  if (players.length !== PUG_QUEUE_SIZE) {
    throw new Error(`Expected ${PUG_QUEUE_SIZE} players, got ${players.length}`);
  }

  const sorted = [...players].sort((a, b) => b.elo - a.elo || a.id.localeCompare(b.id));
  const captainAlpha = sorted[0].id;
  const captainBravo = sorted[1].id;
  const pool = sorted.slice(2);

  const draftOrder = snakeDraftOrder(8);
  const alphaIds = [captainAlpha];
  const bravoIds = [captainBravo];

  draftOrder.forEach((side, index) => {
    const player = pool[index];
    if (side === "ALPHA") alphaIds.push(player.id);
    else bravoIds.push(player.id);
  });

  return { captainAlpha, captainBravo, alphaIds, bravoIds, draftOrder };
}

export function teamAverageElo(players: { elo: number }[]): number {
  if (players.length === 0) return 0;
  return Math.round(players.reduce((sum, p) => sum + p.elo, 0) / players.length);
}
