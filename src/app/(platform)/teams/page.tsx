import { Card, EmptyState, Tag } from "@/components/bscl/ui";
import { getPlatformStats, getTeams } from "@/lib/data";

export default async function TeamsPage() {
  const [teams, stats] = await Promise.all([getTeams(), getPlatformStats()]);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-rajdhani)] text-[22px] font-bold">Teams</h2>
          <p className="text-xs text-[#6B7280]">
            {stats.teamCount} registered this season
          </p>
        </div>
        <button type="button" className="rounded-lg bg-[#0066FF] px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_0_14px_rgba(0,102,255,.28)]">
          + Create
        </button>
      </div>

      {teams.length === 0 ? (
        <EmptyState message="No teams yet. Create the first squad for Season 1." />
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
                    {team._count.members} members · Captain: {team.captain.displayName}
                  </div>
                  <div className="mt-1 flex gap-1">
                    {team.recruiting && <Tag variant="green">Recruiting</Tag>}
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
        <span className="text-[13px] text-[#6B7280]">Create your team</span>
      </div>
    </>
  );
}
