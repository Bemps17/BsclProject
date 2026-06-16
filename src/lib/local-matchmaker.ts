import { PLACEMENT_MATCHES, calculateEloDelta, getRankFromElo } from "@/lib/elo";
import type { LeaderboardEntry } from "@/lib/match-display";
import { canConfirmMatch, PUG_QUEUE_SIZE, type DraftSide } from "@/lib/match";
import { rankKeyToTier, rankTierToKey } from "@/lib/ranks";
import { assignPugTeams, teamAverageElo } from "@/lib/team-balance";
import type { RankKey } from "@/lib/constants";

export type LocalMatchStatus = "DRAFT" | "LIVE" | "SUBMITTED" | "CONFIRMED" | "DISPUTED";

export type LocalMatchPlayer = {
  playerId: string;
  name: string;
  side: "ALPHA" | "BRAVO";
  elo: number;
  eloDelta?: number;
};

export type LocalDraftPick = {
  playerId: string;
  name: string;
  side: DraftSide;
  pickNumber: number;
};

export type LocalMatch = {
  id: string;
  number: number;
  status: LocalMatchStatus;
  captainAlpha: string;
  captainBravo: string;
  alphaIds: string[];
  bravoIds: string[];
  alphaScore?: number;
  bravoScore?: number;
  submittedBy?: string;
  players: LocalMatchPlayer[];
  draftOrder: DraftSide[];
  draftPicks: LocalDraftPick[];
  /** 0 = captains reveal, 1..N = snake picks, N+1 = ready for LIVE */
  draftRevealStep: number;
  createdAt: string;
};

export type LocalBot = {
  id: string;
  name: string;
  initials: string;
  elo: number;
};

/** Demo ELO boost so the local human is always Alpha captain. */
export const DEMO_CAPTAIN_ELO = 9999;

export const LOCAL_BOT_POOL: LocalBot[] = [
  { id: "bot_neo", name: "NeoStrike", initials: "NE", elo: 1120 },
  { id: "bot_shadow", name: "ShadowFK", initials: "SH", elo: 1080 },
  { id: "bot_vortex", name: "VortexEU", initials: "VO", elo: 1240 },
  { id: "bot_ghost", name: "xGhost_BR", initials: "XG", elo: 1180 },
  { id: "bot_frost", name: "FrostLine", initials: "FR", elo: 980 },
  { id: "bot_apex", name: "ApexOne", initials: "AP", elo: 1050 },
  { id: "bot_nova", name: "NovaClutch", initials: "NO", elo: 1150 },
  { id: "bot_rift", name: "RiftKing", initials: "RI", elo: 1020 },
  { id: "bot_blaze", name: "BlazeFox", initials: "BL", elo: 1100 },
];

export function botQueueEntry(bot: LocalBot) {
  return { id: bot.id, name: bot.name, initials: bot.initials };
}

export function resolvePlayerElo(
  playerId: string,
  localPlayer: { id: string; elo: number } | null,
): number {
  if (localPlayer?.id === playerId) return localPlayer.elo;
  const bot = LOCAL_BOT_POOL.find((b) => b.id === playerId);
  return bot?.elo ?? 1000;
}

export function assignmentElo(
  playerId: string,
  localPlayer: { id: string; elo: number } | null,
): number {
  if (localPlayer?.id === playerId) return DEMO_CAPTAIN_ELO;
  return resolvePlayerElo(playerId, localPlayer);
}

export function createMatchFromQueue(
  queue: { id: string; name: string }[],
  matchNumber: number,
  localPlayer: { id: string; elo: number } | null,
): LocalMatch | null {
  if (queue.length < PUG_QUEUE_SIZE) return null;

  const slice = queue.slice(0, PUG_QUEUE_SIZE);
  const draftPlayers = slice.map((entry) => ({
    id: entry.id,
    displayName: entry.name,
    elo: assignmentElo(entry.id, localPlayer),
  }));

  const assignment = assignPugTeams(draftPlayers);
  const sorted = [...draftPlayers].sort((a, b) => b.elo - a.elo || a.id.localeCompare(b.id));
  const pool = sorted.slice(2);

  const draftPicks: LocalDraftPick[] = assignment.draftOrder.map((side, index) => ({
    playerId: pool[index].id,
    name: pool[index].displayName,
    side,
    pickNumber: index + 1,
  }));

  const players: LocalMatchPlayer[] = [
    ...assignment.alphaIds.map((playerId) => {
      const entry = slice.find((q) => q.id === playerId)!;
      return {
        playerId,
        name: entry.name,
        side: "ALPHA" as const,
        elo: resolvePlayerElo(playerId, localPlayer),
      };
    }),
    ...assignment.bravoIds.map((playerId) => {
      const entry = slice.find((q) => q.id === playerId)!;
      return {
        playerId,
        name: entry.name,
        side: "BRAVO" as const,
        elo: resolvePlayerElo(playerId, localPlayer),
      };
    }),
  ];

  return {
    id: `local_match_${Date.now()}`,
    number: matchNumber,
    status: "DRAFT",
    captainAlpha: assignment.captainAlpha,
    captainBravo: assignment.captainBravo,
    alphaIds: assignment.alphaIds,
    bravoIds: assignment.bravoIds,
    draftOrder: assignment.draftOrder,
    draftPicks,
    draftRevealStep: 0,
    players,
    createdAt: new Date().toISOString(),
  };
}

/** Total reveal steps: 1 (captains) + draft picks count. */
export function draftRevealTotalSteps(match: LocalMatch): number {
  return 1 + match.draftPicks.length;
}

export function advanceDraftReveal(match: LocalMatch): LocalMatch {
  if (match.status !== "DRAFT") return match;

  const total = draftRevealTotalSteps(match);
  const nextStep = match.draftRevealStep + 1;

  if (nextStep >= total) {
    return { ...match, draftRevealStep: nextStep, status: "LIVE" };
  }

  return { ...match, draftRevealStep: nextStep };
}

export function submitLocalScores(
  match: LocalMatch,
  captainId: string,
  alphaScore: number,
  bravoScore: number,
): LocalMatch {
  if (match.status !== "LIVE") {
    throw new Error("Match is not live");
  }
  if (captainId !== match.captainAlpha && captainId !== match.captainBravo) {
    throw new Error("Only captains can submit scores");
  }
  if (alphaScore === bravoScore) {
    throw new Error("Scores cannot tie");
  }

  return {
    ...match,
    alphaScore,
    bravoScore,
    status: "SUBMITTED",
    submittedBy: captainId,
  };
}

export type LocalPlayerUpdate = {
  elo: number;
  rankKey: RankKey;
  wins: number;
  losses: number;
  peakElo: number;
  eloDelta: number;
};

export function confirmLocalMatch(
  match: LocalMatch,
  confirmerId: string,
  localPlayer: {
    id: string;
    elo: number;
    wins: number;
    losses: number;
    peakElo: number;
  } | null,
): { match: LocalMatch; playerUpdate: LocalPlayerUpdate | null } {
  if (match.status !== "SUBMITTED") {
    throw new Error("Match is not awaiting confirmation");
  }
  if (!match.submittedBy || !canConfirmMatch(match.submittedBy, confirmerId, match.status)) {
    throw new Error("Cannot confirm this match");
  }
  if (match.alphaScore == null || match.bravoScore == null) {
    throw new Error("Scores missing");
  }

  const alphaWon = match.alphaScore > match.bravoScore;
  const alphaAvg = teamAverageElo(match.players.filter((p) => p.side === "ALPHA"));
  const bravoAvg = teamAverageElo(match.players.filter((p) => p.side === "BRAVO"));

  const updatedPlayers = match.players.map((mp) => {
    const onAlpha = mp.side === "ALPHA";
    const won = onAlpha ? alphaWon : !alphaWon;
    const opponentAvg = onAlpha ? bravoAvg : alphaAvg;
    const placementProtection =
      mp.playerId === localPlayer?.id && localPlayer.wins + localPlayer.losses < PLACEMENT_MATCHES;
    const delta = calculateEloDelta(mp.elo, opponentAvg, won, placementProtection);
    return { ...mp, eloDelta: delta };
  });

  let playerUpdate: LocalPlayerUpdate | null = null;
  if (localPlayer) {
    const mp = updatedPlayers.find((p) => p.playerId === localPlayer.id);
    if (mp?.eloDelta != null) {
      const onAlpha = mp.side === "ALPHA";
      const won = onAlpha ? alphaWon : !alphaWon;
      const newElo = localPlayer.elo + mp.eloDelta;
      playerUpdate = {
        elo: newElo,
        rankKey: rankTierToKey(getRankFromElo(newElo)),
        wins: won ? localPlayer.wins + 1 : localPlayer.wins,
        losses: won ? localPlayer.losses : localPlayer.losses + 1,
        peakElo: Math.max(localPlayer.peakElo, newElo),
        eloDelta: mp.eloDelta,
      };
    }
  }

  return {
    match: {
      ...match,
      status: "CONFIRMED",
      players: updatedPlayers,
    },
    playerUpdate,
  };
}

export function resolveSubmitCaptainId(match: LocalMatch, humanId: string): string {
  if (humanId === match.captainAlpha || humanId === match.captainBravo) return humanId;
  return match.captainAlpha;
}

export function buildDemoLeaderboard(
  localPlayer: {
    id: string;
    displayName: string;
    elo: number;
    rankKey: RankKey;
    wins: number;
    losses: number;
  } | null,
): LeaderboardEntry[] {
  const rows: LeaderboardEntry[] = LOCAL_BOT_POOL.map((bot) => ({
    position: 0,
    id: bot.id,
    name: bot.name,
    rank: rankKeyToTier(rankTierToKey(getRankFromElo(bot.elo))),
    rankKey: rankTierToKey(getRankFromElo(bot.elo)),
    elo: bot.elo,
    winRate: 50,
    me: false,
  }));

  if (localPlayer) {
    const total = localPlayer.wins + localPlayer.losses;
    rows.push({
      position: 0,
      id: localPlayer.id,
      name: localPlayer.displayName,
      rank: rankKeyToTier(localPlayer.rankKey),
      rankKey: localPlayer.rankKey,
      elo: localPlayer.elo,
      winRate: total > 0 ? Math.round((localPlayer.wins / total) * 100) : 0,
      me: true,
    });
  }

  return rows.sort((a, b) => b.elo - a.elo).map((row, index) => ({ ...row, position: index + 1 }));
}
