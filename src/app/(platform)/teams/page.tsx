import { cookies } from "next/headers";
import { TeamsClient } from "@/app/(platform)/teams/teams-client";
import { TeamsDemo } from "@/app/(platform)/teams/teams-demo";
import { isDemoMode } from "@/lib/backend";
import { getPlatformStats, getTeams } from "@/lib/data";

export default async function TeamsPage() {
  const cookieStore = await cookies();
  if (isDemoMode(cookieStore.get("bscl_demo")?.value)) {
    return <TeamsDemo />;
  }

  const [teams, stats] = await Promise.all([getTeams(), getPlatformStats()]);

  return (
    <TeamsClient
      teamCount={stats.teamCount}
      teams={teams.map((team) => ({
        id: team.id,
        tag: team.tag,
        name: team.name,
        wins: team.wins,
        losses: team.losses,
        recruiting: team.recruiting,
        captainName: team.captain.displayName,
        memberCount: team._count.members,
      }))}
    />
  );
}
