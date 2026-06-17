"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Button,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  MatchRow,
  RankBadge,
  StatCell,
  Tag,
} from "@/components/bscl/ui";
import { ChevronRight, NavIcon } from "@/components/bscl/icons";
import { useDemo } from "@/components/bscl/demo-provider";
import { useT } from "@/components/bscl/locale-provider";
import { RANK_THRESHOLDS } from "@/lib/elo";
import { discordTag } from "@/lib/discord-sim";
import { interpolate } from "@/lib/i18n";
import { formatMatchScore } from "@/lib/match-display";
import { clearGuestPlayer } from "@/lib/local-store";
import { playerInitials } from "@/lib/ranks";
import type { NavIconId } from "@/lib/nav-icons";

export function ProfileDemo() {
  const router = useRouter();
  const demo = useDemo();
  const { player, myMatches, leaderboard, playerTeamId, teams } = demo;
  const t = useT();

  useEffect(() => {
    if (!player) router.replace("/demo");
  }, [player, router]);

  if (!player) return null;

  const isDiscordSim =
    player.authMethod === "discord_sim" &&
    player.discordUsername &&
    player.discordDiscriminator;
  const discordLabel = isDiscordSim
    ? discordTag({
        username: player.discordUsername!,
        discriminator: player.discordDiscriminator!,
      })
    : null;
  const avatarHue = isDiscordSim ? player.avatarHue : undefined;

  const totalMatches = player.wins + player.losses;
  const winRate = totalMatches > 0 ? Math.round((player.wins / totalMatches) * 100) : 0;
  const progressToElite = Math.min(
    100,
    Math.max(
      0,
      ((player.elo - RANK_THRESHOLDS.DIAMOND) / (RANK_THRESHOLDS.ELITE - RANK_THRESHOLDS.DIAMOND)) * 100,
    ),
  );
  const rankRow = leaderboard.find((row) => row.me);
  const rankPosition = rankRow?.position ?? leaderboard.length + 1;
  const myTeam = playerTeamId ? teams.find((team) => team.id === playerTeamId) : null;

  function signOutLocal() {
    clearGuestPlayer();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <div className="rounded-[14px] border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-3.5">
          <div
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-primary bg-primary font-heading text-[28px] font-bold text-primary-foreground shadow-[0_0_20px_color-mix(in_oklch,var(--primary),transparent_72%)]"
            style={
              avatarHue != null
                ? {
                    backgroundColor: `hsl(${avatarHue} 65% 45%)`,
                    borderColor: `hsl(${avatarHue} 65% 45%)`,
                    boxShadow: `0 0 20px hsl(${avatarHue} 65% 45% / 0.35)`,
                  }
                : undefined
            }
          >
            {playerInitials(player.displayName)}
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold">{player.displayName}</h2>
            <p className="text-[11px] text-muted-foreground">
              {isDiscordSim ? `${discordLabel} · ${t.profile.discordSimProfile}` : t.profile.guestProfile}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <RankBadge rank={player.rankKey} />
              <Tag variant="gold">{t.common.demo}</Tag>
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between border-t border-border pt-3.5">
          <div>
            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.profile.currentElo}
            </div>
            <div className="font-[family-name:var(--font-jetbrains)] text-4xl font-bold leading-none text-primary">
              {player.elo}
            </div>
          </div>
          <div className="text-right text-[11px] text-muted-foreground">
            <div className="text-sm font-semibold text-foreground">
              {interpolate(t.profile.rankPosition, { n: rankPosition })}
            </div>
            <div>
              {t.profile.peak}: <span className="text-primary">{player.peakElo}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label={t.profile.matches} value={totalMatches} />
        <StatCell label={t.profile.wins} value={player.wins} valueClassName="text-chart-2" />
        <StatCell label={t.home.winRate} value={`${winRate}%`} />
        <StatCell label={t.profile.losses} value={player.losses} valueClassName="text-destructive" />
      </div>

      <Card>
        <h2 className="mb-3.5 font-heading text-[15px] font-bold">{t.profile.rankProgress}</h2>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{RANK_THRESHOLDS.DIAMOND}</span>
            <span className="font-semibold text-primary">{player.elo}</span>
            <span>{RANK_THRESHOLDS.ELITE}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-chart-4"
              style={{ width: `${progressToElite}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {interpolate(t.profile.toElite, { n: Math.max(0, RANK_THRESHOLDS.ELITE - player.elo) })}
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader
          title={t.profile.matchHistory}
          action={
            <ButtonLink href="/matches" variant="secondary" size="sm">
              {t.common.all} →
            </ButtonLink>
          }
        />
        {myMatches.filter((m) => m.status === "CONFIRMED").length === 0 ? (
          <EmptyState message={t.profile.noMatchesDemo} />
        ) : (
          <div className="flex flex-col gap-1.5">
            {myMatches
              .filter((m) => m.status === "CONFIRMED")
              .map((match) => {
                const mp = match.players.find((p) => p.playerId === player.id)!;
                const onAlpha = mp.side === "ALPHA";
                const won =
                  match.alphaScore != null &&
                  match.bravoScore != null &&
                  (onAlpha
                    ? match.alphaScore > match.bravoScore
                    : match.bravoScore > match.alphaScore);
                return (
                  <MatchRow
                    key={match.id}
                    result={won ? "win" : "loss"}
                    score={formatMatchScore(match.alphaScore ?? null, match.bravoScore ?? null)}
                    meta={`#M-${String(match.number).padStart(3, "0")} · ${onAlpha ? "Alpha" : "Bravo"}`}
                    delta={mp.eloDelta}
                  />
                );
              })}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title={t.profile.myTeam}
          action={
            <ButtonLink href="/teams" variant="secondary" size="sm">
              {t.profile.manage}
            </ButtonLink>
          }
        />
        {myTeam ? (
          <div className="flex items-center justify-between gap-2.5 py-1.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-border bg-primary/6 text-[13px] font-bold text-primary">
                {myTeam.tag}
              </div>
              <div>
                <p className="text-[13px] font-semibold">{myTeam.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {myTeam.memberIds.length} {t.teams.members} · {myTeam.wins}W / {myTeam.losses}L
                </p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => demo.leaveTeam()}>
              {t.profile.leaveTeam}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 py-1.5">
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-border bg-primary/6 text-[13px] font-bold text-primary">
              —
            </div>
            <p className="text-[13px] text-muted-foreground">
              {t.profile.notInTeam} ·{" "}
              <ButtonLink href="/teams" size="sm" className="inline-flex h-auto px-3 py-1">
                {t.profile.createOrJoin}
              </ButtonLink>
            </p>
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.profile.account}</p>
        {(
          [
            { href: "/tickets", icon: "tickets" as NavIconId, label: t.profile.supportTickets },
            { href: "/tournaments", icon: "tournaments" as NavIconId, label: t.profile.tournaments },
            {
              href: "/admin",
              icon: "admin" as NavIconId,
              label: t.profile.adminPanel,
              badge: t.profile.staff,
              variant: "red" as const,
            },
          ] as const
        ).map((item, i, arr) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex cursor-pointer items-center gap-2.5 py-3 ${i < arr.length - 1 ? "border-b border-border" : ""}`}
          >
            <NavIcon name={item.icon} className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-[13px] font-medium">{item.label}</span>
            {"badge" in item && item.badge && <Tag variant={item.variant ?? "muted"}>{item.badge}</Tag>}
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden strokeWidth={2} />
          </Link>
        ))}
        <Button type="button" variant="destructive" className="mt-3 w-full" onClick={signOutLocal}>
          {t.profile.clearProfile}
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          <Link href="/play" className="text-primary">
            {t.profile.tryQueue}
          </Link>{" "}
          — {t.profile.savedBrowser}
        </p>
      </Card>
    </>
  );
}
