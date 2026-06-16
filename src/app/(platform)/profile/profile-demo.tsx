"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, Card, CardHeader, EmptyState, MatchRow, RankBadge, StatCell, Tag } from "@/components/bscl/ui";
import { useDemo } from "@/components/bscl/demo-provider";
import { useT } from "@/components/bscl/locale-provider";
import { RANK_THRESHOLDS } from "@/lib/elo";
import { formatMatchScore } from "@/lib/match-display";
import { discordTag } from "@/lib/discord-sim";
import { clearGuestPlayer } from "@/lib/local-store";
import { playerInitials } from "@/lib/ranks";

export function ProfileDemo() {
  const router = useRouter();
  const { player, myMatches } = useDemo();
  const t = useT();

  useEffect(() => {
    if (!player) router.replace("/login");
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
    Math.max(0, ((player.elo - RANK_THRESHOLDS.DIAMOND) / (RANK_THRESHOLDS.ELITE - RANK_THRESHOLDS.DIAMOND)) * 100),
  );

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
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-primary bg-primary font-[family-name:var(--font-rajdhani)] text-[28px] font-bold text-primary-foreground shadow-[0_0_20px_color-mix(in_oklch,var(--primary),transparent_72%)]"
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
            <h2 className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold">{player.displayName}</h2>
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
            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{t.profile.currentElo}</div>
            <div className="font-[family-name:var(--font-jetbrains)] text-4xl font-bold leading-none text-primary">{player.elo}</div>
          </div>
          <div className="text-right text-[11px] text-muted-foreground">
            <div className="text-sm font-semibold text-foreground">{t.profile.localOnly}</div>
            <div>{t.profile.peak}: <span className="text-primary">{player.peakElo}</span></div>
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
        <h2 className="mb-3.5 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">{t.profile.rankProgress}</h2>
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
        </div>
      </Card>

      <Card>
        <CardHeader title={t.profile.matchHistory} />
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
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.profile.account}</p>
        <Button type="button" variant="destructive" className="w-full" onClick={signOutLocal}>
          {t.profile.clearProfile}
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          <Link href="/play" className="text-primary">{t.profile.tryQueue}</Link> — {t.profile.savedBrowser}
        </p>
      </Card>
    </>
  );
}
