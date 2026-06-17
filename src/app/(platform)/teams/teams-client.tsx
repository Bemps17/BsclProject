"use client";

import { useMemo, useState } from "react";
import {
  Button,
  EmptyState,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  StatCell,
  Tag,
} from "@/components/bscl/ui";
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

type TeamFilter = "all" | "recruiting";

export function TeamsClient({
  teams,
  teamCount,
  interactive = false,
  myTeamId = null,
  onCreateTeam,
  onJoinTeam,
  error,
}: {
  teams: TeamRow[];
  teamCount: number;
  interactive?: boolean;
  myTeamId?: string | null;
  onCreateTeam?: (tag: string, name: string) => void;
  onJoinTeam?: (teamId: string) => void;
  error?: string | null;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [tag, setTag] = useState("");
  const [name, setName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<TeamFilter>("all");

  const recruitingCount = useMemo(() => teams.filter((team) => team.recruiting).length, [teams]);

  const visibleTeams = useMemo(() => {
    if (filter === "recruiting") {
      return teams.filter((team) => team.recruiting);
    }
    return teams;
  }, [filter, teams]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    onCreateTeam?.(tag, name);
    setTag("");
    setName("");
    setShowCreate(false);
  }

  const filters: { key: TeamFilter; label: string }[] = [
    { key: "all", label: t.common.all },
    { key: "recruiting", label: t.teams.recruiting },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
        <StatCell
          label={t.teams.title}
          value={formatCount(teamCount, locale)}
          sub={interpolate(t.teams.registered, { n: formatCount(teamCount, locale) })}
        />
        <StatCell label={t.teams.recruiting} value={recruitingCount} />
        <StatCell
          label={t.teams.myTeam}
          value={myTeamId ? "✓" : "—"}
          valueClassName={myTeamId ? "text-[var(--gold)]" : undefined}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-h-[44px] flex-1 rounded-lg border border-border bg-secondary p-0.5">
          {filters.map((item) => (
            <Button
              key={item.key}
              type="button"
              variant={filter === item.key ? "default" : "ghost"}
              size="sm"
              aria-pressed={filter === item.key}
              onClick={() => setFilter(item.key)}
              className={cn(
                "min-h-[40px] flex-1",
                filter === item.key &&
                  "shadow-[0_0_10px_color-mix(in_oklch,var(--primary),transparent_72%)]",
              )}
            >
              {item.label}
            </Button>
          ))}
        </div>
        {interactive && !myTeamId && (
          <Button size="sm" className="min-h-[44px]" onClick={() => setShowCreate((v) => !v)}>
            + {t.common.create}
          </Button>
        )}
      </div>

      {interactive && showCreate && !myTeamId && (
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-secondary p-4">
          <FieldGroup className="gap-3 sm:flex-row">
            <Field className="sm:w-28">
              <FieldLabel htmlFor="team-tag">{t.teams.tagLabel}</FieldLabel>
              <Input
                id="team-tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                maxLength={4}
                placeholder="APX"
              />
            </Field>
            <Field className="min-w-0 flex-1">
              <FieldLabel htmlFor="team-name">{t.teams.nameLabel}</FieldLabel>
              <Input
                id="team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={32}
                placeholder={t.teams.namePlaceholder}
              />
            </Field>
            <div className="flex items-end">
              <Button type="submit" className="min-h-[44px]">
                {t.teams.createTeam}
              </Button>
            </div>
          </FieldGroup>
        </form>
      )}

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      {visibleTeams.length === 0 ? (
        <EmptyState message={filter === "recruiting" ? t.teams.emptyRecruiting : t.teams.empty} />
      ) : (
        <div className="grid gap-2.5 md:grid-cols-2">
          {visibleTeams.map((team) => {
            const winRate =
              team.wins + team.losses > 0
                ? Math.round((team.wins / (team.wins + team.losses)) * 100)
                : 0;
            const isMine = myTeamId === team.id;

            return (
              <div
                key={team.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card p-3.5 transition md:flex-col md:items-start",
                  isMine ? "border-primary" : "border-border active:border-primary",
                )}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-primary/6 font-heading text-[15px] font-bold text-primary">
                  {team.tag}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-heading text-[15px] font-bold">{team.name}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {team.memberCount} {t.teams.members} · {t.teams.captain}: {team.captainName}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {team.recruiting && <Tag variant="green">{t.teams.recruiting}</Tag>}
                    {isMine && <Tag variant="gold">{t.teams.myTeam}</Tag>}
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
                  {interactive && !myTeamId && team.recruiting && onJoinTeam && (
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      className="min-h-[44px] md:min-h-0"
                      onClick={() => onJoinTeam(team.id)}
                    >
                      {t.teams.joinTeam}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!interactive && (
        <div className="flex min-h-[80px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-card p-3.5 md:col-span-2">
          <span className="text-[22px] opacity-25">+</span>
          <span className="text-[13px] text-muted-foreground">{t.teams.createTeam}</span>
        </div>
      )}
    </>
  );
}
