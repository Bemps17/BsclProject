"use client";

import Link from "next/link";
import { Card, CardHeader, EmptyState, MatchRow, RankBadge, StatCell, Tag } from "@/components/bscl/ui";
import { ChevronRight, NavIcon } from "@/components/bscl/icons";
import { useT } from "@/components/bscl/locale-provider";
import { RANK_THRESHOLDS } from "@/lib/elo";
import { interpolate } from "@/lib/i18n";
import { formatMatchScore } from "@/lib/match-display";
import { playerInitials, rankTierToKey } from "@/lib/ranks";
import type { NavIconId } from "@/lib/nav-icons";
import { RankTier } from "@/generated/prisma/client";

type RecentMatch = {
  id: string;
  side: string;
  eloDelta: number | null;
  match: {
    number: number;
    alphaScore: number | null;
    bravoScore: number | null;
  };
};

export function ProfileLive({
  displayName,
  username,
  rank,
  verified,
  elo,
  peakElo,
  wins,
  losses,
  rankPosition,
  recentMatches,
  isStaff,
}: {
  displayName: string;
  username: string;
  rank: RankTier;
  verified: boolean;
  elo: number;
  peakElo: number;
  wins: number;
  losses: number;
  rankPosition: number;
  recentMatches: RecentMatch[];
  isStaff: boolean;
}) {
  const t = useT();
  const rankKey = rankTierToKey(rank);
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const nextRankElo = rank === "ELITE" ? null : RANK_THRESHOLDS.ELITE;
  const progressToElite =
    nextRankElo != null
      ? Math.min(100, Math.max(0, ((elo - RANK_THRESHOLDS.DIAMOND) / (RANK_THRESHOLDS.ELITE - RANK_THRESHOLDS.DIAMOND)) * 100))
      : 100;

  return (
    <>
      <div className="rounded-[14px] border border-[#1E2D45] bg-[#111827] p-5">
        <div className="mb-4 flex items-center gap-3.5">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-[#0066FF] bg-[#0066FF] font-[family-name:var(--font-rajdhani)] text-[28px] font-bold text-white shadow-[0_0_20px_rgba(0,102,255,.28)]">
            {playerInitials(displayName)}
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold">{displayName}</h2>
            <p className="text-[11px] text-[#6B7280]">{t.profile.discord}: {username} · S1</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <RankBadge rank={rankKey} />
              {verified && <Tag>{t.common.verified}</Tag>}
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between border-t border-[#1E2D45] pt-3.5">
          <div>
            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">{t.profile.currentElo}</div>
            <div className="font-[family-name:var(--font-jetbrains)] text-4xl font-bold leading-none text-[#0066FF]">{elo}</div>
          </div>
          <div className="text-right text-[11px] text-[#6B7280]">
            <div className="text-sm font-semibold text-white">
              {interpolate(t.profile.rankPosition, { n: rankPosition })}
            </div>
            <div>{t.profile.peak}: <span className="text-[#0066FF]">{peakElo}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label={t.profile.matches} value={totalMatches} />
        <StatCell label={t.profile.wins} value={wins} valueClassName="text-[#22C55E]" />
        <StatCell label={t.home.winRate} value={`${winRate}%`} />
        <StatCell label={t.profile.losses} value={losses} valueClassName="text-[#EF4444]" />
      </div>

      <Card>
        <h2 className="mb-3.5 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">{t.profile.rankProgress}</h2>
        <div className="mb-3.5 flex flex-wrap items-center gap-1.5">
          <RankBadge rank="plat" /> <span className="text-xs text-[#6B7280]">→</span>
          <RankBadge rank="diamond" className={rank === "DIAMOND" || rank === "ELITE" ? "outline outline-1 outline-[#0066FF]" : "opacity-40"} />{" "}
          <span className="text-xs text-[#6B7280]">→</span>
          <RankBadge rank="elite" className={rank === "ELITE" ? "outline outline-1 outline-[#0066FF]" : "opacity-40"} />
        </div>
        {nextRankElo != null && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] text-[#6B7280]">
              <span>{RANK_THRESHOLDS.DIAMOND}</span>
              <span className="font-semibold text-[#0066FF]">{elo}</span>
              <span>{RANK_THRESHOLDS.ELITE}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#1E2D45]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0066FF] to-[#60A5FA] shadow-[0_0_8px_rgba(0,102,255,.28)]"
                style={{ width: `${progressToElite}%` }}
              />
            </div>
            <p className="text-[11px] text-[#6B7280]">
              {interpolate(t.profile.toElite, { n: Math.max(0, RANK_THRESHOLDS.ELITE - elo) })}
            </p>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title={t.profile.matchHistory}
          action={
            <Link href="/matches" className="rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-1.5 text-xs font-semibold">
              {t.common.all} →
            </Link>
          }
        />
        {recentMatches.length === 0 ? (
          <EmptyState message={t.profile.noMatches} />
        ) : (
          <div className="flex flex-col gap-1.5">
            {recentMatches.map((mp) => {
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
                  meta={`#M-${String(mp.match.number).padStart(3, "0")}`}
                  delta={mp.eloDelta ?? undefined}
                />
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title={t.profile.myTeam} action={<button type="button" className="rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-1.5 text-xs font-semibold">{t.profile.manage}</button>} />
        <div className="flex items-center gap-2.5 py-1.5">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-[#1E2D45] bg-[rgba(0,102,255,.06)] text-[13px] font-bold text-[#0066FF]">—</div>
          <p className="text-[13px] text-[#6B7280]">
            {t.profile.notInTeam} ·{" "}
            <button type="button" className="inline-flex rounded-lg bg-[#0066FF] px-3 py-1 text-xs font-semibold text-white">
              {t.profile.createOrJoin}
            </button>
          </p>
        </div>
      </Card>

      <Card>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">{t.profile.account}</p>
        {(
          [
            { href: "/tickets", icon: "tickets" as NavIconId, label: t.profile.supportTickets },
            { href: "/tournaments", icon: "tournaments" as NavIconId, label: t.profile.tournaments },
            ...(isStaff
              ? [
                  {
                    href: "/admin",
                    icon: "admin" as NavIconId,
                    label: t.profile.adminPanel,
                    badge: t.profile.staff,
                    variant: "red" as const,
                  },
                ]
              : []),
          ] as const
        ).map((item, i, arr) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex cursor-pointer items-center gap-2.5 py-3 ${i < arr.length - 1 ? "border-b border-[#1E2D45]" : ""}`}
          >
            <NavIcon name={item.icon} className="h-4 w-4 text-[#9CA3AF]" />
            <span className="flex-1 text-[13px] font-medium">{item.label}</span>
            {"badge" in item && item.badge && <Tag variant={item.variant ?? "muted"}>{item.badge}</Tag>}
            <ChevronRight className="h-4 w-4 text-[#6B7280]" aria-hidden strokeWidth={2} />
          </Link>
        ))}
      </Card>
    </>
  );
}
