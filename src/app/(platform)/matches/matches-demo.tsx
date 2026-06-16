"use client";

import { MatchStatus } from "@/generated/prisma/client";
import { useDemo } from "@/components/bscl/demo-provider";
import { MatchesClient } from "@/app/(platform)/matches/matches-client";
import { formatMatchScore } from "@/lib/match-display";

export function MatchesDemo() {
  const demo = useDemo();

  return (
    <MatchesClient
      seasonLabel="Demo"
      matches={demo.matches.map((m) => {
        const alphaWon =
          m.alphaScore != null && m.bravoScore != null && m.alphaScore > m.bravoScore;
        const scoreLabel =
          m.status === "LIVE" ? "LIVE" : formatMatchScore(m.alphaScore ?? null, m.bravoScore ?? null);

        return {
          id: m.id,
          number: m.number,
          alphaName: "Alpha",
          bravoName: "Bravo",
          alphaScore: m.alphaScore ?? null,
          bravoScore: m.bravoScore ?? null,
          status: m.status as MatchStatus,
          scoreLabel,
          alphaWon,
        };
      })}
    />
  );
}
