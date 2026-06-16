"use client";

import Link from "next/link";
import { useDemoOptional } from "@/components/bscl/demo-provider";
import { useT } from "@/components/bscl/locale-provider";
import { StatCell } from "@/components/bscl/ui";

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
        <StatCell label={t.home.queue} value={stats.queueCount} sub={t.common.active} subClassName="text-[#22C55E]" />
        <StatCell label={t.home.myElo} value={player.elo} valueClassName="text-[#0066FF]" sub={t.home.localGuest} />
        <StatCell label={t.home.winRate} value={`${winRate}%`} sub={t.home.demoProfile} />
        <StatCell label={t.home.today} value={stats.todayMatches} sub={t.common.matches} />
      </div>
      <Link
        href="/demo"
        className="block rounded-lg border border-[rgba(245,158,11,.35)] bg-[rgba(245,158,11,.08)] px-3 py-2 text-center text-xs font-semibold text-[#F59E0B]"
      >
        {t.demo.openHub} →
      </Link>
    </>
  );
}
