import { Card, RankBadge, Tag } from "@/components/bscl/ui";

const TEAMS = [
  { tag: "APX", name: "APEX Gaming", members: 5, rank: "elite" as const, wr: 68, record: "22W / 10L", recruiting: false },
  { tag: "GHT", name: "GHOST Squad", members: 5, rank: "plat" as const, wr: 55, record: "17W / 14L", recruiting: true },
  { tag: "ZRO", name: "ZERO Point", members: 4, rank: "gold" as const, wr: 48, record: "11W / 12L", recruiting: true },
];

export default function TeamsPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-rajdhani)] text-[22px] font-bold">Teams</h2>
          <p className="text-xs text-[#6B7280]">86 registered this season</p>
        </div>
        <button type="button" className="rounded-lg bg-[#0066FF] px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_0_14px_rgba(0,102,255,.28)]">
          + Create
        </button>
      </div>

      <div className="grid gap-2.5 md:grid-cols-2">
        {TEAMS.map((team) => (
          <div
            key={team.tag}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#1E2D45] bg-[#111827] p-3.5 transition active:border-[#0066FF] md:flex-col md:items-start"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#1E2D45] bg-[rgba(0,102,255,.06)] font-[family-name:var(--font-rajdhani)] text-[15px] font-bold text-[#0066FF]">
              {team.tag}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">{team.name}</div>
              <div className="mt-0.5 text-[11px] text-[#6B7280]">{team.members} members · Est. S1</div>
              <div className="mt-1 flex gap-1">
                <RankBadge rank={team.rank} className="uppercase" />
                {team.recruiting && <Tag variant="green">Recruiting</Tag>}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 md:flex-row md:items-center">
              <span className={`font-[family-name:var(--font-jetbrains)] text-sm font-bold ${team.wr >= 60 ? "text-[#22C55E]" : team.wr < 50 ? "text-[#EF4444]" : ""}`}>
                {team.wr}%
              </span>
              <span className="text-[10px] text-[#6B7280]">{team.record}</span>
            </div>
          </div>
        ))}

        <div className="flex min-h-[80px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#1E2D45] bg-[#111827] p-3.5 md:col-span-2">
          <span className="text-[22px] opacity-25">+</span>
          <span className="text-[13px] text-[#6B7280]">Create your team</span>
        </div>
      </div>
    </>
  );
}
