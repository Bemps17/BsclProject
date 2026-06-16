"use client";

import { useState } from "react";
import { Button, EmptyState, Field, FieldGroup, FieldLabel, Input, Tag } from "@/components/bscl/ui";
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

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    onCreateTeam?.(tag, name);
    setTag("");
    setName("");
    setShowCreate(false);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-rajdhani)] text-[22px] font-bold">{t.teams.title}</h2>
          <p className="text-xs text-muted-foreground">
            {interpolate(t.teams.registered, { n: formatCount(teamCount, locale) })}
          </p>
        </div>
        {interactive && !myTeamId && (
          <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
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
              <Button type="submit">{t.teams.createTeam}</Button>
            </div>
          </FieldGroup>
        </form>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {teams.length === 0 ? (
        <EmptyState message={t.teams.empty} />
      ) : (
        <div className="grid gap-2.5 md:grid-cols-2">
          {teams.map((team) => {
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
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-primary/6 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold text-primary">
                  {team.tag}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">{team.name}</div>
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
                    <Button type="button" size="xs" variant="outline" onClick={() => onJoinTeam(team.id)}>
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
