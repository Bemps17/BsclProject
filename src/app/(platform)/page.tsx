import { HomeClient } from "@/app/(platform)/home-client";
import { BSCL } from "@/lib/constants";
import {
  getCurrentPlayerProfile,
  getLeaderboard,
  getPlatformStats,
} from "@/lib/data";

export default async function HomePage() {
  const [stats, topPlayers, profile] = await Promise.all([
    getPlatformStats(),
    getLeaderboard(5),
    getCurrentPlayerProfile(),
  ]);

  const season = stats.season;
  const seasonNumber = season?.number ?? BSCL.season.number;
  const seasonWeek = season?.week ?? BSCL.season.week;
  const daysLeft = season?.endsAt
    ? Math.max(0, Math.ceil((season.endsAt.getTime() - Date.now()) / 86_400_000))
    : BSCL.season.daysLeft;

  const myPlayer = profile?.player ?? null;
  const recentMatches = profile?.recentMatches ?? [];

  return (
    <HomeClient
      seasonNumber={seasonNumber}
      seasonWeek={seasonWeek}
      daysLeft={daysLeft}
      stats={{
        playerCount: stats.playerCount,
        matchCount: stats.matchCount,
        teamCount: stats.teamCount,
        queueCount: stats.queueCount,
        todayMatches: stats.todayMatches,
      }}
      topPlayers={topPlayers}
      myPlayer={myPlayer}
      recentMatches={recentMatches}
    />
  );
}
