"use client";

import { Card, EmptyState, Tag } from "@/components/bscl/ui";
import { useLocale, useT } from "@/components/bscl/locale-provider";
import { formatCount, interpolate } from "@/lib/i18n";

type TeamRow = {
  id: string;
  tag: string;
  name: string;
  wins: number;
  losses: number;
  recruiting: boolean;
  captainName: string;
  memberCount: number;
};

export function TeamsClient({
  teams,
  teamCount,
}: {
  teams: TeamRow[];
  teamCount: number;
}) {
  const t = useT();
  const { locale } = useLocale();

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-rajdhani)] text-[22px] font-bold">{t.teams.title}</h2>
          <p className="text-xs text-[#6B7280]">
            {interpolate(t.teams.registered, { n: formatCount(teamCount, locale) })}
          </p>
        </div>
        <button type="button" className="rounded-lg bg-[#0066FF] px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_0_14px_rgba(0,102,255,.28)]">
          + {t.common.create}
        </button>
      </div>

      {teams.length === 0 ? (
        <EmptyState message={t.teams.empty} />
      ) : (
        <div className="grid gap-2.5 md:grid-cols-2">
          {teams.map((team) => {
            const winRate =
              team.wins + team.losses > 0
                ? Math.round((team.wins / (team.wins + team.losses)) * 100)
                : 0;

            return (
              <div
                key={team.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#1E2D45] bg-[#111827] p-3.5 transition active:border-[#0066FF] md:flex-col md:items-start"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#1E2D45] bg-[rgba(0,102,255,.06)] font-[family-name:var(--font-rajdhani)] text-[15px] font-bold text-[#0066FF]">
                  {team.tag}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">{team.name}</div>
                  <div className="mt-0.5 text-[11px] text-[#6B7280]">
                    {team.memberCount} {t.teams.members} · {t.teams.captain}: {team.captainName}
                  </div>
                  <div className="mt-1 flex gap-1">
                    {team.recruiting && <Tag variant="green">{t.teams.recruiting}</Tag>}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 md:flex-row md:items-center">
                  <span className={`font-[family-name:var(--font-jetbrains)] text-sm font-bold ${winRate >= 60 ? "text-[#22C55E]" : winRate < 50 && winRate > 0 ? "text-[#EF4444]" : ""}`}>
                    {winRate}%
                  </span>
                  <span className="text-[10px] text-[#6B7280]">
                    {team.wins}W / {team.losses}L
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex min-h-[80px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#1E2D45] bg-[#111827] p-3.5 md:col-span-2">
        <span className="text-[22px] opacity-25">+</span>
        <span className="text-[13px] text-[#6B7280]">{t.teams.createTeam}</span>
      </div>
    </>
  );
}
