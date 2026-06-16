import { RankingsClient } from "@/app/(platform)/rankings/rankings-client";
import { getCurrentPlayerProfile, getLeaderboard, getPlatformStats } from "@/lib/data";

export default async function RankingsPage() {
  const [stats, leaderboard, profile] = await Promise.all([
    getPlatformStats(),
    getLeaderboard(100),
    getCurrentPlayerProfile(),
  ]);

  const topElo = leaderboard[0]?.elo ?? 0;
  const myPlayer = profile?.player;
  const myRank = profile?.rankPosition;

  return (
    <RankingsClient
      initialLeaderboard={leaderboard}
      stats={{
        playerCount: stats.playerCount,
        topElo,
        yourElo: myPlayer?.elo ?? null,
        yourRank: myRank ?? null,
      }}
    />
  );
}
