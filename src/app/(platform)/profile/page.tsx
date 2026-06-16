import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardHeader, EmptyState, MatchRow, RankBadge, StatCell, Tag } from "@/components/bscl/ui";
import { isBackendEnabled } from "@/lib/backend";
import { formatMatchScore, getCurrentPlayerProfile } from "@/lib/data";
import { RANK_THRESHOLDS } from "@/lib/elo";
import { playerInitials, rankTierToKey } from "@/lib/ranks";
import { ProfileDemo } from "./profile-demo";

export default async function ProfilePage() {
  if (!isBackendEnabled()) {
    return <ProfileDemo />;
  }

  const profile = await getCurrentPlayerProfile();
  if (!profile) {
    redirect("/login");
  }

  const { user, player, rankPosition, recentMatches } = profile;
  const rankKey = rankTierToKey(player.rank);
  const totalMatches = player.wins + player.losses;
  const winRate = totalMatches > 0 ? Math.round((player.wins / totalMatches) * 100) : 0;
  const nextRankElo = player.rank === "ELITE" ? null : RANK_THRESHOLDS.ELITE;
  const progressToElite =
    nextRankElo != null
      ? Math.min(100, Math.max(0, ((player.elo - RANK_THRESHOLDS.DIAMOND) / (RANK_THRESHOLDS.ELITE - RANK_THRESHOLDS.DIAMOND)) * 100))
      : 100;

  return (
    <>
      <div className="rounded-[14px] border border-[#1E2D45] bg-[#111827] p-5">
        <div className="mb-4 flex items-center gap-3.5">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-[#0066FF] bg-[#0066FF] font-[family-name:var(--font-rajdhani)] text-[28px] font-bold text-white shadow-[0_0_20px_rgba(0,102,255,.28)]">
            {playerInitials(player.displayName)}
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold">{player.displayName}</h2>
            <p className="text-[11px] text-[#6B7280]">Discord: {user.username} · S1</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <RankBadge rank={rankKey} />
              {player.verified && <Tag>Verified</Tag>}
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between border-t border-[#1E2D45] pt-3.5">
          <div>
            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">Current ELO</div>
            <div className="font-[family-name:var(--font-jetbrains)] text-4xl font-bold leading-none text-[#0066FF]">{player.elo}</div>
          </div>
          <div className="text-right text-[11px] text-[#6B7280]">
            <div className="text-sm font-semibold text-white">Rank #{rankPosition}</div>
            <div>Peak: <span className="text-[#0066FF]">{player.peakElo}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label="Matches" value={totalMatches} />
        <StatCell label="Wins" value={player.wins} valueClassName="text-[#22C55E]" />
        <StatCell label="Win Rate" value={`${winRate}%`} />
        <StatCell label="Losses" value={player.losses} valueClassName="text-[#EF4444]" />
      </div>

      <Card>
        <h2 className="mb-3.5 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">Rank Progress</h2>
        <div className="mb-3.5 flex flex-wrap items-center gap-1.5">
          <RankBadge rank="plat" /> <span className="text-xs text-[#6B7280]">→</span>
          <RankBadge rank="diamond" className={player.rank === "DIAMOND" || player.rank === "ELITE" ? "outline outline-1 outline-[#0066FF]" : "opacity-40"} />{" "}
          <span className="text-xs text-[#6B7280]">→</span>
          <RankBadge rank="elite" className={player.rank === "ELITE" ? "outline outline-1 outline-[#0066FF]" : "opacity-40"} />
        </div>
        {nextRankElo != null && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] text-[#6B7280]">
              <span>{RANK_THRESHOLDS.DIAMOND}</span>
              <span className="font-semibold text-[#0066FF]">{player.elo}</span>
              <span>{RANK_THRESHOLDS.ELITE}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#1E2D45]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0066FF] to-[#60A5FA] shadow-[0_0_8px_rgba(0,102,255,.28)]"
                style={{ width: `${progressToElite}%` }}
              />
            </div>
            <p className="text-[11px] text-[#6B7280]">
              {Math.max(0, RANK_THRESHOLDS.ELITE - player.elo)} ELO to Elite
            </p>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Match History"
          action={
            <Link href="/matches" className="rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-1.5 text-xs font-semibold">
              All →
            </Link>
          }
        />
        {recentMatches.length === 0 ? (
          <EmptyState message="No matches played yet." />
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
        <CardHeader title="My Team" action={<button type="button" className="rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-1.5 text-xs font-semibold">Manage</button>} />
        <div className="flex items-center gap-2.5 py-1.5">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-[#1E2D45] bg-[rgba(0,102,255,.06)] text-[13px] font-bold text-[#0066FF]">—</div>
          <p className="text-[13px] text-[#6B7280]">
            Not in a team ·{" "}
            <button type="button" className="inline-flex rounded-lg bg-[#0066FF] px-3 py-1 text-xs font-semibold text-white">
              Create or Join
            </button>
          </p>
        </div>
      </Card>

      <Card>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Account</p>
        {[
          { href: "/tickets", icon: "🎫", label: "Support Tickets" },
          { href: "/tournaments", icon: "🏆", label: "Tournaments" },
          ...(user.role === "ADMIN" || user.role === "OWNER" || user.role === "MODERATOR"
            ? [{ href: "/admin", icon: "⚙️", label: "Admin Panel", badge: "Staff", variant: "red" as const }]
            : []),
        ].map((item, i, arr) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex cursor-pointer items-center gap-2.5 py-3 ${i < arr.length - 1 ? "border-b border-[#1E2D45]" : ""}`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1 text-[13px] font-medium">{item.label}</span>
            {"badge" in item && item.badge && <Tag variant={item.variant ?? "muted"}>{item.badge}</Tag>}
            <span className="text-xs text-[#6B7280]">›</span>
          </Link>
        ))}
      </Card>
    </>
  );
}
