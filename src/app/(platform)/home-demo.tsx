"use client";

import { HomeClient } from "@/app/(platform)/home-client";
import { useDemo } from "@/components/bscl/demo-provider";
import { BSCL } from "@/lib/constants";
import { formatMatchScore } from "@/lib/match-display";
import type { RankKey } from "@/lib/constants";

export function HomeDemo() {
  const demo = useDemo();

  const myPlayer = demo.player
    ? { elo: demo.player.elo, wins: demo.player.wins, losses: demo.player.losses }
    : null;

  const topPlayers = demo.leaderboard.slice(0, 5).map((row) => ({
    position: row.position,
    name: row.name,
    rankKey: row.rankKey as RankKey,
    elo: row.elo,
    me: row.me,
  }));

  const recentMatches = demo.myMatches
    .filter((m) => m.status === "CONFIRMED")
    .slice(0, 5)
    .map((m) => {
      const mp = m.players.find((p) => p.playerId === demo.player?.id);
      return {
        id: m.id,
        side: mp?.side ?? "ALPHA",
        eloDelta: mp?.eloDelta ?? null,
        match: {
          number: m.number,
          alphaScore: m.alphaScore ?? null,
          bravoScore: m.bravoScore ?? null,
          teams: [
            { side: "ALPHA", name: m.players.find((p) => p.side === "ALPHA")?.name ?? "Alpha" },
            { side: "BRAVO", name: m.players.find((p) => p.side === "BRAVO")?.name ?? "Bravo" },
          ],
        },
      };
    });

  return (
    <HomeClient
      seasonNumber={BSCL.season.number}
      seasonWeek={BSCL.season.week}
      daysLeft={BSCL.season.daysLeft}
      stats={{
        playerCount: demo.stats.playerCount,
        matchCount: demo.stats.matchCount,
        teamCount: demo.stats.teamCount,
        queueCount: demo.stats.queueCount,
        todayMatches: demo.stats.todayMatches,
      }}
      topPlayers={topPlayers}
      myPlayer={myPlayer}
      recentMatches={recentMatches}
    />
  );
}
