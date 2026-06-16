import { TeamsClient } from "@/app/(platform)/teams/teams-client";
import { getPlatformStats, getTeams } from "@/lib/data";

export default async function TeamsPage() {
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
