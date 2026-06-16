"use client";

import { useDemo } from "@/components/bscl/demo-provider";
import { RankingsClient } from "@/app/(platform)/rankings/rankings-client";

export function RankingsDemo() {
  const demo = useDemo();
  const topElo = demo.leaderboard[0]?.elo ?? 0;
  const me = demo.leaderboard.find((row) => row.me);

  return (
    <RankingsClient
      initialLeaderboard={demo.leaderboard}
      stats={{
        playerCount: demo.stats.playerCount,
        topElo,
        yourElo: me?.elo ?? null,
        yourRank: me?.position ?? null,
      }}
    />
  );
}
