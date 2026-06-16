"use client";

import Link from "next/link";
import { useDemoOptional } from "@/components/bscl/demo-provider";
import { useT } from "@/components/bscl/locale-provider";
import { Button, StatCell } from "@/components/bscl/ui";

export function DemoHomeStats() {
  const demo = useDemoOptional();
  const t = useT();
  if (!demo?.player) return null;

  const { player, stats } = demo;
  const total = player.wins + player.losses;
  const winRate = total > 0 ? Math.round((player.wins / total) * 100) : 0;

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label={t.home.queue} value={stats.queueCount} sub={t.common.active} subClassName="text-chart-2" />
        <StatCell label={t.home.myElo} value={player.elo} valueClassName="text-primary" sub={t.home.localGuest} />
        <StatCell label={t.home.winRate} value={`${winRate}%`} sub={t.home.demoProfile} />
        <StatCell label={t.home.today} value={stats.todayMatches} sub={t.common.matches} />
      </div>
      <Button variant="outline" className="w-full" render={<Link href="/demo" />}>
        {t.demo.openHub} →
      </Button>
    </>
  );
}
