"use client";

import { useState } from "react";
import { Card, EmptyState, RankBadge, StatCell } from "@/components/bscl/ui";
import type { LeaderboardEntry } from "@/lib/match-display";
import { type RankKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LbTab = "all" | RankKey;

const TABS: { key: LbTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "elite", label: "Elite" },
  { key: "diamond", label: "Diamond" },
  { key: "plat", label: "Plat" },
  { key: "gold", label: "Gold" },
];

function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

export function RankingsClient({
  initialLeaderboard,
  stats,
}: {
  initialLeaderboard: LeaderboardEntry[];
  stats: {
    playerCount: number;
    topElo: number;
    yourElo: number | null;
    yourRank: number | null;
  };
}) {
  const [tab, setTab] = useState<LbTab>("all");

  const rows =
    tab === "all"
      ? initialLeaderboard
      : initialLeaderboard.filter((p) => p.rankKey === tab);

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label="Players" value={formatCount(stats.playerCount)} />
        <StatCell label="Top ELO" value={stats.topElo || "—"} valueClassName="text-[#0066FF]" />
        <StatCell label="Your ELO" value={stats.yourElo ?? "—"} />
        <StatCell label="Your Rank" value={stats.yourRank ? `#${stats.yourRank}` : "—"} />
      </div>

      <div className="flex rounded-lg border border-[#1E2D45] bg-[#162032] p-0.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-md px-1 py-1.5 text-xs font-semibold transition-all",
              tab === t.key
                ? "bg-[#0066FF] text-white shadow-[0_0_10px_rgba(0,102,255,.28)]"
                : "text-[#6B7280]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {rows.length === 0 ? (
          <EmptyState message="No players in this rank bracket yet." />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#1E2D45] text-left text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                <th className="px-2.5 py-2">#</th>
                <th className="px-2.5 py-2">Player</th>
                <th className="px-2.5 py-2">Rank</th>
                <th className="px-2.5 py-2">ELO</th>
                <th className="px-2.5 py-2">W%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className={p.me ? "bg-[rgba(0,102,255,.06)]" : ""}>
                  <td className={`border-b border-[#1E2D45] px-2.5 py-2.5 font-bold ${p.position === 1 ? "text-[#F59E0B]" : "text-[#6B7280]"}`}>
                    {p.position}
                  </td>
                  <td className={`border-b border-[#1E2D45] px-2.5 py-2.5 ${p.me ? "font-bold text-[#0066FF]" : ""}`}>
                    {p.name}
                    {p.me ? " ★" : ""}
                  </td>
                  <td className="border-b border-[#1E2D45] px-2.5 py-2.5">
                    <RankBadge rank={p.rankKey} />
                  </td>
                  <td className={`border-b border-[#1E2D45] px-2.5 py-2.5 font-[family-name:var(--font-jetbrains)] font-bold ${p.me ? "text-[#0066FF]" : ""}`}>
                    {p.elo}
                  </td>
                  <td
                    className={cn(
                      "border-b border-[#1E2D45] px-2.5 py-2.5",
                      p.winRate >= 60 && "text-[#22C55E]",
                      p.winRate < 48 && p.winRate > 0 && "text-[#EF4444]",
                    )}
                  >
                    {p.winRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
