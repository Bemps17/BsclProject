"use client";

import { useState } from "react";
import { TournamentsClient, type TournamentRow } from "@/app/(platform)/tournaments/tournaments-client";
import { useDemo } from "@/components/bscl/demo-provider";
import type { LocalTournament } from "@/lib/local-demo-data";

function mapTournament(t: LocalTournament): TournamentRow {
  const statusKey =
    t.status === "OPEN"
      ? "statusOpen"
      : t.status === "CHECK_IN"
        ? "statusCheckIn"
        : "statusEnded";
  const variant =
    t.status === "OPEN" ? "green" : t.status === "CHECK_IN" ? "gold" : "muted";
  const ctaKey =
    t.status === "OPEN" ? "register" : t.status === "CHECK_IN" ? "bracket" : "results";

  return {
    id: t.id,
    icon: t.icon,
    name: t.name,
    meta: t.meta,
    statusKey,
    variant,
    prize: t.prize,
    date: t.date,
    ctaKey,
    primary: t.primary,
    dim: t.dim,
    registered: t.registered,
  };
}

export function TournamentsDemo() {
  const demo = useDemo();
  const [error, setError] = useState<string | null>(null);

  return (
    <TournamentsClient
      tournaments={demo.tournaments.map(mapTournament)}
      interactive
      onRegister={(id) => {
        setError(null);
        try {
          demo.registerTournament(id);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Registration failed");
        }
      }}
      error={error}
    />
  );
}
