"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardHeader, EmptyState, RankBadge, StatCell, Tag } from "@/components/bscl/ui";
import { useDemo } from "@/components/bscl/demo-provider";
import { useT } from "@/components/bscl/locale-provider";
import { RANK_THRESHOLDS } from "@/lib/elo";
import { discordTag } from "@/lib/discord-sim";
import { clearGuestPlayer } from "@/lib/local-store";
import { playerInitials } from "@/lib/ranks";

export function ProfileDemo() {
  const router = useRouter();
  const { player } = useDemo();
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
      <div className="rounded-[14px] border border-[#1E2D45] bg-[#111827] p-5">
        <div className="mb-4 flex items-center gap-3.5">
          <div
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-[#0066FF] bg-[#0066FF] font-[family-name:var(--font-rajdhani)] text-[28px] font-bold text-white shadow-[0_0_20px_rgba(0,102,255,.28)]"
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
            <p className="text-[11px] text-[#6B7280]">
              {isDiscordSim ? `${discordLabel} · ${t.profile.discordSimProfile}` : t.profile.guestProfile}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <RankBadge rank={player.rankKey} />
              <Tag variant="gold">{t.common.demo}</Tag>
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between border-t border-[#1E2D45] pt-3.5">
          <div>
            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">{t.profile.currentElo}</div>
            <div className="font-[family-name:var(--font-jetbrains)] text-4xl font-bold leading-none text-[#0066FF]">{player.elo}</div>
          </div>
          <div className="text-right text-[11px] text-[#6B7280]">
            <div className="text-sm font-semibold text-white">{t.profile.localOnly}</div>
            <div>{t.profile.peak}: <span className="text-[#0066FF]">{player.peakElo}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label={t.profile.matches} value={totalMatches} />
        <StatCell label={t.profile.wins} value={player.wins} valueClassName="text-[#22C55E]" />
        <StatCell label={t.home.winRate} value={`${winRate}%`} />
        <StatCell label={t.profile.losses} value={player.losses} valueClassName="text-[#EF4444]" />
      </div>

      <Card>
        <h2 className="mb-3.5 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">{t.profile.rankProgress}</h2>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[10px] text-[#6B7280]">
            <span>{RANK_THRESHOLDS.DIAMOND}</span>
            <span className="font-semibold text-[#0066FF]">{player.elo}</span>
            <span>{RANK_THRESHOLDS.ELITE}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#1E2D45]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0066FF] to-[#60A5FA]"
              style={{ width: `${progressToElite}%` }}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title={t.profile.matchHistory} />
        <EmptyState message={t.profile.noMatchesDemo} />
      </Card>

      <Card>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">{t.profile.account}</p>
        <button
          type="button"
          onClick={signOutLocal}
          className="w-full rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-2 text-sm font-semibold text-[#EF4444]"
        >
          {t.profile.clearProfile}
        </button>
        <p className="mt-2 text-center text-[11px] text-[#6B7280]">
          <Link href="/play" className="text-[#0066FF]">{t.profile.tryQueue}</Link> — {t.profile.savedBrowser}
        </p>
      </Card>
    </>
  );
}
