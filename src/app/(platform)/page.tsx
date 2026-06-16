import Link from "next/link";
import { Card, CardHeader, MatchRow, RankBadge, StatCell } from "@/components/bscl/ui";
import { BSCL, type RankKey } from "@/lib/constants";

const TOP_PLAYERS: {
  pos: number;
  name: string;
  rank: RankKey;
  elo: number;
  gold?: boolean;
  me?: boolean;
}[] = [
  { pos: 1, name: "ShadowK1ng", rank: "elite", elo: 2041, gold: true },
  { pos: 2, name: "NightCrawler", rank: "diamond", elo: 1804 },
  { pos: 3, name: "xGhost_BR", rank: "diamond", elo: 1642, me: true },
  { pos: 4, name: "Specter99", rank: "diamond", elo: 1621 },
  { pos: 5, name: "AcidReign", rank: "plat", elo: 1542 },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden rounded-[14px] border border-[#1E2D45] bg-gradient-to-br from-[#080E1A] via-[#0B1628] to-[#050A14] p-5 md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-16 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(0,102,255,.14)_0%,transparent_65%)]" />
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[2px] text-[#0066FF]">
          Season {BSCL.season.number} — Week {BSCL.season.week} — Live Now
        </p>
        <h2 className="mb-2.5 font-[family-name:var(--font-rajdhani)] text-[30px] font-bold leading-tight tracking-wide md:text-4xl">
          Compete.
          <em className="block not-italic text-[#0066FF]">Prove your rank.</em>
        </h2>
        <p className="mb-4 max-w-lg text-[13px] leading-relaxed text-[#6B7280]">
          Black Squad&apos;s first dedicated competitive league. 5v5 PUGs, ELO, team play, and
          tournaments.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/play"
            className="inline-flex items-center justify-center rounded-lg bg-[#0066FF] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_0_14px_rgba(0,102,255,.28)]"
          >
            Join a PUG
          </Link>
          <Link
            href="/rankings"
            className="inline-flex items-center justify-center rounded-lg border border-[#1E2D45] bg-[#162032] px-4 py-2.5 text-[13px] font-semibold text-[#E5E7EB]"
          >
            Leaderboard
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-0 border-t border-[#1E2D45] pt-4 md:grid-cols-4">
          {[
            ["1,247", "Players"],
            ["438", "Matches"],
            ["86", "Teams"],
            ["S1", "Season"],
          ].map(([n, l]) => (
            <div key={l} className="py-1.5">
              <div className="font-[family-name:var(--font-rajdhani)] text-[22px] font-bold">{n}</div>
              <div className="text-[11px] text-[#6B7280]">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-2.5 rounded-[10px] border border-[rgba(0,102,255,.28)] bg-gradient-to-r from-[rgba(0,102,255,.1)] to-transparent px-3.5 py-3">
        <div className="shrink-0 font-[family-name:var(--font-rajdhani)] text-[22px] font-bold text-[#0066FF]">
          S{BSCL.season.number}
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-semibold">
            Season {BSCL.season.number} · Week {BSCL.season.week}
          </div>
          <div className="text-[11px] text-[#6B7280]">
            Ends in {BSCL.season.daysLeft} days — Soft reset at season end
          </div>
        </div>
        <Link href="/rankings" className="rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-1.5 text-xs font-semibold">
          →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label="Queue" value="3" sub="Active" subClassName="text-[#22C55E]" />
        <StatCell label="Today" value="12" sub="Matches" />
        <StatCell label="My ELO" value="1642" valueClassName="text-[#0066FF]" sub="+28 this wk" subClassName="text-[#22C55E]" />
        <StatCell label="Win Rate" value="61%" sub="Last 20" />
      </div>

      <Card>
        <CardHeader
          title="Recent Results"
          action={
            <Link href="/matches" className="rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-1.5 text-xs font-semibold">
              All →
            </Link>
          }
        />
        <div className="flex flex-col gap-1.5">
          <MatchRow result="win" score="13–07" meta="#M-038 · 2h ago" delta={23} />
          <MatchRow result="win" score="13–09" meta="#M-035 · 4h ago" delta={19} />
          <MatchRow result="loss" score="07–13" meta="#M-034 · Yesterday" delta={-18} />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Top Players"
          accent="· Week"
          action={
            <Link href="/rankings" className="rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-1.5 text-xs font-semibold">
              Full →
            </Link>
          }
        />
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#1E2D45] text-left text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
              <th className="px-2.5 py-2">#</th>
              <th className="px-2.5 py-2">Player</th>
              <th className="px-2.5 py-2">Rank</th>
              <th className="px-2.5 py-2">ELO</th>
            </tr>
          </thead>
          <tbody>
            {TOP_PLAYERS.map(({ pos, name, rank, elo, gold, me }) => (
              <tr key={name} className={me ? "bg-[rgba(0,102,255,.06)]" : ""}>
                <td className={`border-b border-[#1E2D45] px-2.5 py-2.5 font-bold ${gold ? "text-[#F59E0B]" : "text-[#6B7280]"}`}>
                  {pos}
                </td>
                <td className={`border-b border-[#1E2D45] px-2.5 py-2.5 ${me ? "font-bold text-[#0066FF]" : ""}`}>
                  {name}
                </td>
                <td className="border-b border-[#1E2D45] px-2.5 py-2.5">
                  <RankBadge rank={rank} />
                </td>
                <td className="border-b border-[#1E2D45] px-2.5 py-2.5 font-[family-name:var(--font-jetbrains)] font-bold text-[#0066FF]">
                  {elo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
