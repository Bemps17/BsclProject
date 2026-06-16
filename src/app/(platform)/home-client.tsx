"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  EmptyState,
  MatchRow,
  RankBadge,
  StatCell,
} from "@/components/bscl/ui";
import { DemoHomeStats } from "@/app/(platform)/demo-home-stats";
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
      <section className="relative overflow-hidden rounded-[14px] border border-[#1E2D45] bg-gradient-to-br from-[#080E1A] via-[#0B1628] to-[#050A14] p-5 md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-16 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(0,102,255,.14)_0%,transparent_65%)]" />
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[2px] text-[#0066FF]">
          Season {seasonNumber} — Week {seasonWeek} — {t.home.seasonLive}
        </p>
        <h2 className="mb-2.5 font-[family-name:var(--font-rajdhani)] text-[30px] font-bold leading-tight tracking-wide md:text-4xl">
          {t.home.heroLine1}
          <em className="block not-italic text-[#0066FF]">{t.home.heroLine2}</em>
        </h2>
        <p className="mb-4 max-w-lg text-[13px] leading-relaxed text-[#6B7280]">{t.home.heroDesc}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/play"
            className="inline-flex items-center justify-center rounded-lg bg-[#0066FF] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_0_14px_rgba(0,102,255,.28)]"
          >
            {t.home.joinPug}
          </Link>
          <Link
            href="/rankings"
            className="inline-flex items-center justify-center rounded-lg border border-[#1E2D45] bg-[#162032] px-4 py-2.5 text-[13px] font-semibold text-[#E5E7EB]"
          >
            {t.home.leaderboard}
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-0 border-t border-[#1E2D45] pt-4 md:grid-cols-4">
          {[
            [formatCount(stats.playerCount, locale), t.home.players],
            [formatCount(stats.matchCount, locale), t.common.matches],
            [formatCount(stats.teamCount, locale), t.home.teams],
            [`S${seasonNumber}`, t.home.season],
          ].map(([n, l]) => (
            <div key={l} className="py-1.5">
              <div className="font-[family-name:var(--font-rajdhani)] text-[22px] font-bold">{n}</div>
              <div className="text-[11px] text-[#6B7280]">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-2.5 rounded-[10px] border border-[rgba(0,102,255,.28)] bg-gradient-to-r from-[rgba(0,102,255,.1)] to-transparent px-3.5 py-3">
        <div className="shrink-0 font-[family-name:var(--font-rajdhani)] text-[22px] font-bold text-[#0066FF]">
          S{seasonNumber}
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-semibold">
            {interpolate(t.home.seasonWeek, { n: seasonNumber, w: seasonWeek })}
          </div>
          <div className="text-[11px] text-[#6B7280]">
            {interpolate(t.home.endsIn, { d: daysLeft })}
          </div>
        </div>
        <Link href="/rankings" className="rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-1.5 text-xs font-semibold">
          →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label={t.home.queue} value={stats.queueCount} sub={t.common.active} subClassName="text-[#22C55E]" />
        <StatCell label={t.home.today} value={stats.todayMatches} sub={t.common.matches} />
        <StatCell
          label={t.home.myElo}
          value={myPlayer ? myPlayer.elo : "—"}
          valueClassName={myPlayer ? "text-[#0066FF]" : undefined}
          sub={myPlayer ? undefined : t.common.signIn}
        />
        <StatCell
          label={t.home.winRate}
          value={myWinRate != null ? `${myWinRate}%` : "—"}
          sub={myPlayer ? t.home.overall : undefined}
        />
      </div>

      <DemoHomeStats />

      <Card>
        <CardHeader
          title={t.home.recentResults}
          action={
            <Link href="/matches" className="rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-1.5 text-xs font-semibold">
              {t.common.all} →
            </Link>
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
            <Link href="/rankings" className="rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-1.5 text-xs font-semibold">
              {t.common.all} →
            </Link>
          }
        />
        {topPlayers.length === 0 ? (
          <EmptyState message={t.home.noLeaderboard} />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#1E2D45] text-left text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                <th className="px-2.5 py-2">#</th>
                <th className="px-2.5 py-2">{t.common.player}</th>
                <th className="px-2.5 py-2">{t.common.rank}</th>
                <th className="px-2.5 py-2">{t.common.elo}</th>
              </tr>
            </thead>
            <tbody>
              {topPlayers.map(({ position, name, rankKey, elo, me }) => (
                <tr key={name} className={me ? "bg-[rgba(0,102,255,.06)]" : ""}>
                  <td className={`border-b border-[#1E2D45] px-2.5 py-2.5 font-bold ${position === 1 ? "text-[#F59E0B]" : "text-[#6B7280]"}`}>
                    {position}
                  </td>
                  <td className={`border-b border-[#1E2D45] px-2.5 py-2.5 ${me ? "font-bold text-[#0066FF]" : ""}`}>
                    {name}
                  </td>
                  <td className="border-b border-[#1E2D45] px-2.5 py-2.5">
                    <RankBadge rank={rankKey} />
                  </td>
                  <td className="border-b border-[#1E2D45] px-2.5 py-2.5 font-[family-name:var(--font-jetbrains)] font-bold text-[#0066FF]">
                    {elo}
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
