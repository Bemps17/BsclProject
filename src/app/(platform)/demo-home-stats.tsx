"use client";

import { useDemoOptional } from "@/components/bscl/demo-provider";
import { useT } from "@/components/bscl/locale-provider";
import { StatCell } from "@/components/bscl/ui";

export function DemoHomeStats() {
  const demo = useDemoOptional();
  const t = useT();
  if (!demo?.player) return null;

  const { player } = demo;
  const total = player.wins + player.losses;
  const winRate = total > 0 ? Math.round((player.wins / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-2">
      <StatCell label={t.home.myElo} value={player.elo} valueClassName="text-[#0066FF]" sub={t.home.localGuest} />
      <StatCell label={t.home.winRate} value={`${winRate}%`} sub={t.home.demoProfile} />
    </div>
  );
}
