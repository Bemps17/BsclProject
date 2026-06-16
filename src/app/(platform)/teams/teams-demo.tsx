"use client";

import { useState } from "react";
import { TeamsClient } from "@/app/(platform)/teams/teams-client";
import { useDemo } from "@/components/bscl/demo-provider";

export function TeamsDemo() {
  const demo = useDemo();
  const [error, setError] = useState<string | null>(null);

  function handleError(err: unknown) {
    setError(err instanceof Error ? err.message : "Action failed");
  }

  return (
    <TeamsClient
      teamCount={demo.teams.length}
      teams={demo.teams.map((team) => ({
        id: team.id,
        tag: team.tag,
        name: team.name,
        wins: team.wins,
        losses: team.losses,
        recruiting: team.recruiting,
        captainName: team.captainName,
        memberCount: team.memberIds.length,
      }))}
      interactive
      myTeamId={demo.playerTeamId}
      onCreateTeam={(tag, name) => {
        setError(null);
        try {
          demo.createTeam(tag, name);
        } catch (err) {
          handleError(err);
        }
      }}
      onJoinTeam={(teamId) => {
        setError(null);
        try {
          demo.joinTeam(teamId);
        } catch (err) {
          handleError(err);
        }
      }}
      error={error}
    />
  );
}
