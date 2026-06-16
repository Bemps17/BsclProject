"use client";

import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  MatchRow,
  RankBadge,
  StatCell,
  TableScroll,
  Tag,
} from "@/components/bscl/ui";
import { useLocale, useT } from "@/components/bscl/locale-provider";
import { formatCount, interpolate } from "@/lib/i18n";
import { formatMatchScore } from "@/lib/match-display";
import type { RankKey } from "@/lib/constants";

type HomePlayer = {
  elo: number;
  wins: number;
  losses: number;
} | null;

type RecentMatch = {
  id: string;
  side: string;
  eloDelta: number | null;
  match: {
    number: number;
    alphaScore: number | null;
    bravoScore: number | null;
    teams: { side: string; name: string }[];
  };
};

type LeaderboardRow = {
  position: number;
  name: string;
  rankKey: RankKey;
  elo: number;
  me: boolean;
};

export function HomeClient({
  seasonNumber,
  seasonWeek,
  daysLeft,
  stats,
  topPlayers,
  myPlayer,
  recentMatches,
}: {
  seasonNumber: number;
  seasonWeek: number;
  daysLeft: number;
  stats: {
    playerCount: number;
    matchCount: number;
    teamCount: number;
    queueCount: number;
    todayMatches: number;
  };
  topPlayers: LeaderboardRow[];
  myPlayer: HomePlayer;
  recentMatches: RecentMatch[];
}) {
  const t = useT();
  const { locale } = useLocale();

  const myWinRate =
    myPlayer && myPlayer.wins + myPlayer.losses > 0
      ? Math.round((myPlayer.wins / (myPlayer.wins + myPlayer.losses)) * 100)
      : null;

  return (
    <>
      <section className="relative overflow-hidden rounded-[14px] border border-border bg-gradient-to-br from-background via-secondary to-background p-4 sm:p-5 md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-16 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--primary),transparent_86%)_0%,transparent_65%)]" />
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[1.5px] text-primary sm:text-[10px] sm:tracking-[2px]">
          Season {seasonNumber} — Week {seasonWeek} — {t.home.seasonLive}
        </p>
        <h2 className="mb-2.5 font-[family-name:var(--font-rajdhani)] text-[26px] font-bold leading-tight tracking-wide sm:text-[30px] md:text-4xl">
          {t.home.heroLine1}
          <em className="block not-italic text-primary">{t.home.heroLine2}</em>
        </h2>
        <p className="mb-4 max-w-lg text-[13px] leading-relaxed text-muted-foreground">{t.home.heroDesc}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            className="shadow-[0_0_14px_color-mix(in_oklch,var(--primary),transparent_72%)]"
            render={<Link href="/play" />}
          >
            {t.home.joinPug}
          </Button>
          <Button variant="secondary" render={<Link href="/rankings" />}>
            {t.home.leaderboard}
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-0 border-t border-border pt-4 md:grid-cols-4">
          {[
            [formatCount(stats.playerCount, locale), t.home.players],
            [formatCount(stats.matchCount, locale), t.common.matches],
            [formatCount(stats.teamCount, locale), t.home.teams],
            [`S${seasonNumber}`, t.home.season],
          ].map(([n, l]) => (
            <div key={l} className="py-1.5">
              <div className="font-[family-name:var(--font-rajdhani)] text-[22px] font-bold">{n}</div>
              <div className="text-[11px] text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-2.5 rounded-[10px] border border-primary/28 bg-gradient-to-r from-primary/10 to-transparent px-3.5 py-3 sm:flex-row sm:items-center">
        <div className="shrink-0 font-[family-name:var(--font-rajdhani)] text-[22px] font-bold text-primary">
          S{seasonNumber}
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-semibold">
            {interpolate(t.home.seasonWeek, { n: seasonNumber, w: seasonWeek })}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {interpolate(t.home.endsIn, { d: daysLeft })}
          </div>
        </div>
        <Button variant="secondary" size="sm" render={<Link href="/rankings" />}>
          →
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label={t.home.queue} value={stats.queueCount} sub={t.common.active} subClassName="text-chart-2" />
        <StatCell label={t.home.today} value={stats.todayMatches} sub={t.common.matches} />
        <StatCell
          label={t.home.myElo}
          value={myPlayer ? myPlayer.elo : "—"}
          valueClassName={myPlayer ? "text-primary" : undefined}
          sub={myPlayer ? undefined : t.common.signIn}
        />
        <StatCell
          label={t.home.winRate}
          value={myWinRate != null ? `${myWinRate}%` : "—"}
          sub={myPlayer ? t.home.overall : undefined}
        />
      </div>

      <Card>
        <CardHeader
          title={t.home.recentResults}
          action={
            <Button variant="secondary" size="sm" render={<Link href="/matches" />}>
              {t.common.all} →
            </Button>
          }
        />
        {recentMatches.length === 0 ? (
          <EmptyState message={t.home.noMatches} />
        ) : (
          <div className="flex flex-col gap-1.5">
            {recentMatches.map((mp) => {
              const alpha = mp.match.teams.find((team) => team.side === "ALPHA");
              const bravo = mp.match.teams.find((team) => team.side === "BRAVO");
              const onAlpha = mp.side === "ALPHA";
              const won =
                mp.match.alphaScore != null &&
                mp.match.bravoScore != null &&
                (onAlpha
                  ? mp.match.alphaScore > mp.match.bravoScore
                  : mp.match.bravoScore > mp.match.alphaScore);
              return (
                <MatchRow
                  key={mp.id}
                  result={won ? "win" : "loss"}
                  score={formatMatchScore(mp.match.alphaScore, mp.match.bravoScore)}
                  meta={`#M-${String(mp.match.number).padStart(3, "0")} · ${alpha?.name ?? "?"} ${t.common.vs} ${bravo?.name ?? "?"}`}
                  delta={mp.eloDelta ?? undefined}
                />
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title={t.home.topPlayers}
          accent={t.home.weekAccent}
          action={
            <Button variant="secondary" size="sm" render={<Link href="/rankings" />}>
              {t.common.all} →
            </Button>
          }
        />
        {topPlayers.length === 0 ? (
          <EmptyState message={t.home.noLeaderboard} />
        ) : (
          <TableScroll>
            <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-2.5 py-2">#</th>
                <th className="px-2.5 py-2">{t.common.player}</th>
                <th className="px-2.5 py-2">{t.common.rank}</th>
                <th className="px-2.5 py-2">{t.common.elo}</th>
              </tr>
            </thead>
            <tbody>
              {topPlayers.map(({ position, name, rankKey, elo, me }) => (
                <tr key={name} className={me ? "bg-primary/6" : ""}>
                  <td className={`border-b border-border px-2.5 py-2.5 font-bold ${position === 1 ? "text-chart-3" : "text-muted-foreground"}`}>
                    {position}
                  </td>
                  <td className={`border-b border-border px-2.5 py-2.5 ${me ? "font-bold text-primary" : ""}`}>
                    {name}
                  </td>
                  <td className="border-b border-border px-2.5 py-2.5">
                    <RankBadge rank={rankKey} />
                  </td>
                  <td className="border-b border-border px-2.5 py-2.5 font-[family-name:var(--font-jetbrains)] font-bold text-primary">
                    {elo}
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
