import { cookies } from "next/headers";
import { HomeDemo } from "@/app/(platform)/home-demo";
import { HomeClient } from "@/app/(platform)/home-client";
import { BSCL } from "@/lib/constants";
import { isDemoMode } from "@/lib/backend";
import {
  getCurrentPlayerProfile,
  getLeaderboard,
  getPlatformStats,
} from "@/lib/data";
import { computeSeasonDaysLeft } from "@/lib/season";

export default async function HomePage() {
  const cookieStore = await cookies();
  if (isDemoMode(cookieStore.get("bscl_demo")?.value)) {
    return <HomeDemo />;
  }

  const [stats, topPlayers, profile] = await Promise.all([
    getPlatformStats(),
    getLeaderboard(5),
    getCurrentPlayerProfile(),
  ]);

  const season = stats.season;
  const seasonNumber = season?.number ?? BSCL.season.number;
  const seasonWeek = season?.week ?? BSCL.season.week;
  const referenceTime = new Date();
  const daysLeft = season?.endsAt
    ? computeSeasonDaysLeft(season.endsAt, referenceTime)
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
