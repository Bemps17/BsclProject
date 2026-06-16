"use client";

import { useDemoOptional } from "@/components/bscl/demo-provider";
import { StatCell } from "@/components/bscl/ui";

export function DemoHomeStats() {
  const demo = useDemoOptional();
  if (!demo?.player) return null;

  const { player } = demo;
  const total = player.wins + player.losses;
  const winRate = total > 0 ? Math.round((player.wins / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-2">
      <StatCell label="My ELO" value={player.elo} valueClassName="text-[#0066FF]" sub="Local guest" />
      <StatCell label="Win Rate" value={`${winRate}%`} sub="Demo profile" />
    </div>
  );
}
