"use client";

import { useState } from "react";
import { Button, Card, EmptyState, RankBadge, StatCell, TableScroll } from "@/components/bscl/ui";
import { useLocale, useT } from "@/components/bscl/locale-provider";
import type { LeaderboardEntry } from "@/lib/match-display";
import { type RankKey } from "@/lib/constants";
import { formatCount } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type LbTab = "all" | RankKey;

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
  const t = useT();
  const { locale } = useLocale();
  const [tab, setTab] = useState<LbTab>("all");

  const TABS: { key: LbTab; label: string }[] = [
    { key: "all", label: t.rankings.all },
    { key: "elite", label: t.rankings.elite },
    { key: "diamond", label: t.rankings.diamond },
    { key: "plat", label: t.rankings.plat },
    { key: "gold", label: t.rankings.gold },
  ];

  const rows =
    tab === "all"
      ? initialLeaderboard
      : initialLeaderboard.filter((p) => p.rankKey === tab);

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label={t.rankings.players} value={formatCount(stats.playerCount, locale)} />
        <StatCell label={t.rankings.topElo} value={stats.topElo || "—"} valueClassName="text-primary" />
        <StatCell label={t.rankings.yourElo} value={stats.yourElo ?? "—"} />
        <StatCell label={t.rankings.yourRank} value={stats.yourRank ? `#${stats.yourRank}` : "—"} />
      </div>

      <div className="flex rounded-lg border border-border bg-secondary p-0.5">
        {TABS.map((item) => (
          <Button
            key={item.key}
            type="button"
            variant={tab === item.key ? "default" : "ghost"}
            size="sm"
            onClick={() => setTab(item.key)}
            className={cn(
              "flex-1",
              tab === item.key && "shadow-[0_0_10px_color-mix(in_oklch,var(--primary),transparent_72%)]",
            )}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <Card>
        {rows.length === 0 ? (
          <EmptyState message={t.rankings.emptyBracket} />
        ) : (
          <TableScroll minWidth={520}>
            <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-2.5 py-2">#</th>
                <th className="px-2.5 py-2">{t.common.player}</th>
                <th className="px-2.5 py-2">{t.common.rank}</th>
                <th className="px-2.5 py-2">{t.common.elo}</th>
                <th className="px-2.5 py-2">{t.rankings.winPct}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className={p.me ? "bg-primary/6" : ""}>
                  <td className={`border-b border-border px-2.5 py-2.5 font-bold ${p.position === 1 ? "text-chart-3" : "text-muted-foreground"}`}>
                    {p.position}
                  </td>
                  <td className={`border-b border-border px-2.5 py-2.5 ${p.me ? "font-bold text-primary" : ""}`}>
                    {p.name}
                    {p.me ? " ★" : ""}
                  </td>
                  <td className="border-b border-border px-2.5 py-2.5">
                    <RankBadge rank={p.rankKey} />
                  </td>
                  <td className={`border-b border-border px-2.5 py-2.5 font-[family-name:var(--font-jetbrains)] font-bold ${p.me ? "text-primary" : ""}`}>
                    {p.elo}
                  </td>
                  <td
                    className={cn(
                      "border-b border-border px-2.5 py-2.5",
                      p.winRate >= 60 && "text-chart-2",
                      p.winRate < 48 && p.winRate > 0 && "text-destructive",
                    )}
                  >
                    {p.winRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </TableScroll>
        )}
      </Card>
    </>
  );
}
