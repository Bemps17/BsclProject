import { RankTier } from "@/generated/prisma/client";
import type { RankKey } from "@/lib/constants";

const TIER_TO_KEY: Record<RankTier, RankKey> = {
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
  PLATINUM: "plat",
  DIAMOND: "diamond",
  ELITE: "elite",
};

const KEY_TO_TIER: Record<RankKey, RankTier> = {
  bronze: "BRONZE",
  silver: "SILVER",
  gold: "GOLD",
  plat: "PLATINUM",
  diamond: "DIAMOND",
  elite: "ELITE",
};

export function rankTierToKey(tier: RankTier): RankKey {
  return TIER_TO_KEY[tier];
}

export function rankKeyToTier(key: RankKey): RankTier {
  return KEY_TO_TIER[key];
}

export function playerInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "??";
  const parts = trimmed.split(/[\s_]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}
