"use client";

import { Button, EmptyState, Tag } from "@/components/bscl/ui";
import { useLocale, useT } from "@/components/bscl/locale-provider";
import { formatCount, interpolate } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
          <p className="text-xs text-muted-foreground">
            {interpolate(t.teams.registered, { n: formatCount(teamCount, locale) })}
          </p>
        </div>
        <Button size="sm" className="shadow-[0_0_14px_color-mix(in_oklch,var(--primary),transparent_72%)]">
          + {t.common.create}
        </Button>
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
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition active:border-primary md:flex-col md:items-start"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-primary/6 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold text-primary">
                  {team.tag}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">{team.name}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {team.memberCount} {t.teams.members} · {t.teams.captain}: {team.captainName}
                  </div>
                  <div className="mt-1 flex gap-1">
                    {team.recruiting && <Tag variant="green">{t.teams.recruiting}</Tag>}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 md:flex-row md:items-center">
                  <span
                    className={cn(
                      "font-[family-name:var(--font-jetbrains)] text-sm font-bold",
                      winRate >= 60 && "text-chart-2",
                      winRate < 50 && winRate > 0 && "text-destructive",
                    )}
                  >
                    {winRate}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {team.wins}W / {team.losses}L
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex min-h-[80px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-card p-3.5 md:col-span-2">
        <span className="text-[22px] opacity-25">+</span>
        <span className="text-[13px] text-muted-foreground">{t.teams.createTeam}</span>
      </div>
    </>
  );
}
