import { MatchStatus } from "@/generated/prisma/client";

export function formatMatchScore(alpha?: number | null, bravo?: number | null): string {
  if (alpha == null || bravo == null) return "—";
  return `${String(alpha).padStart(2, "0")}–${String(bravo).padStart(2, "0")}`;
}

export function matchStatusVariant(
  status: MatchStatus,
): "green" | "gold" | "muted" | "red" {
  switch (status) {
    case "LIVE":
      return "green";
    case "SUBMITTED":
    case "DRAFT":
      return "gold";
    case "DISPUTED":
      return "red";
    default:
      return "muted";
  }
}

export type LeaderboardEntry = {
  position: number;
  id: string;
  name: string;
  rank: import("@/generated/prisma/client").RankTier;
  rankKey: import("@/lib/constants").RankKey;
  elo: number;
  winRate: number;
  me: boolean;
};
