import { RankTier } from "@/generated/prisma/client";

export const STARTING_ELO = 1000;
export const PLACEMENT_MATCHES = 5;
export const K_FACTOR = 32;

export const RANK_THRESHOLDS: Record<RankTier, number> = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 1200,
  PLATINUM: 1400,
  DIAMOND: 1600,
  ELITE: 1800,
};

export function getRankFromElo(elo: number): RankTier {
  if (elo >= RANK_THRESHOLDS.ELITE) return "ELITE";
  if (elo >= RANK_THRESHOLDS.DIAMOND) return "DIAMOND";
  if (elo >= RANK_THRESHOLDS.PLATINUM) return "PLATINUM";
  if (elo >= RANK_THRESHOLDS.GOLD) return "GOLD";
  if (elo >= RANK_THRESHOLDS.SILVER) return "SILVER";
  return "BRONZE";
}

export function expectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + 10 ** ((opponentElo - playerElo) / 400));
}

export function calculateEloDelta(
  playerElo: number,
  opponentAvgElo: number,
  won: boolean,
  placementProtection = false,
): number {
  const expected = expectedScore(playerElo, opponentAvgElo);
  const actual = won ? 1 : 0;
  let delta = Math.round(K_FACTOR * (actual - expected));

  if (placementProtection && delta < 0) {
    delta = Math.floor(delta / 2);
  }

  return delta;
}

export function softResetElo(currentElo: number): number {
  const reset = STARTING_ELO + Math.round((currentElo - STARTING_ELO) * 0.5);
  return Math.max(STARTING_ELO, reset);
}

export const RANK_LABELS: Record<RankTier, string> = {
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
  DIAMOND: "Diamond",
  ELITE: "Elite",
};
