import Link from "next/link";
import { Card, CardHeader, MatchRow, RankBadge, StatCell, Tag } from "@/components/bscl/ui";

export default function ProfilePage() {
  return (
    <>
      <div className="rounded-[14px] border border-[#1E2D45] bg-[#111827] p-5">
        <div className="mb-4 flex items-center gap-3.5">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-[#0066FF] bg-[#0066FF] font-[family-name:var(--font-rajdhani)] text-[28px] font-bold text-white shadow-[0_0_20px_rgba(0,102,255,.28)]">
            XG
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold">xGhost_BR</h2>
            <p className="text-[11px] text-[#6B7280]">Discord: xGhost_BR#4291 · S1</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <RankBadge rank="diamond" />
              <Tag>Verified</Tag>
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between border-t border-[#1E2D45] pt-3.5">
          <div>
            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">Current ELO</div>
            <div className="font-[family-name:var(--font-jetbrains)] text-4xl font-bold leading-none text-[#0066FF]">1642</div>
          </div>
          <div className="text-right text-[11px] text-[#6B7280]">
            <div className="text-sm font-semibold text-white">Rank #3</div>
            <div>Peak: <span className="text-[#0066FF]">1698</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label="Matches" value="54" />
        <StatCell label="Wins" value="33" valueClassName="text-[#22C55E]" />
        <StatCell label="Win Rate" value="61%" />
        <StatCell label="ELO +/-" value="+128" valueClassName="text-[#22C55E]" />
      </div>

      <Card>
        <h2 className="mb-3.5 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">Rank Progress</h2>
        <div className="mb-3.5 flex flex-wrap items-center gap-1.5">
          <RankBadge rank="plat" /> <span className="text-xs text-[#6B7280]">→</span>
          <RankBadge rank="diamond" className="outline outline-1 outline-[#0066FF]" />{" "}
          <span className="text-xs text-[#6B7280]">→</span>
          <RankBadge rank="elite" className="opacity-40" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[10px] text-[#6B7280]">
            <span>1600</span>
            <span className="font-semibold text-[#0066FF]">1642</span>
            <span>1800</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#1E2D45]">
            <div className="h-full w-[21%] rounded-full bg-gradient-to-r from-[#0066FF] to-[#60A5FA] shadow-[0_0_8px_rgba(0,102,255,.28)]" />
          </div>
          <p className="text-[11px] text-[#6B7280]">158 ELO to Elite</p>
        </div>
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
        <div className="flex flex-col gap-1.5">
          <MatchRow result="win" score="13–07" meta="#M-038 · 2h" delta={23} />
          <MatchRow result="loss" score="07–13" meta="#M-034 · Yesterday" delta={-18} />
          <MatchRow result="win" score="13–09" meta="#M-031 · 2d" delta={19} />
        </div>
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
          { href: "/tickets", icon: "🎫", label: "Support Tickets", badge: "1 open", variant: "red" as const },
          { href: "/tournaments", icon: "🏆", label: "Tournaments" },
          { href: "/admin", icon: "⚙️", label: "Admin Panel", badge: "Staff", variant: "red" as const },
        ].map((item, i, arr) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex cursor-pointer items-center gap-2.5 py-3 ${i < arr.length - 1 ? "border-b border-[#1E2D45]" : ""}`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1 text-[13px] font-medium">{item.label}</span>
            {item.badge && <Tag variant={item.variant ?? "muted"}>{item.badge}</Tag>}
            <span className="text-xs text-[#6B7280]">›</span>
          </Link>
        ))}
      </Card>
    </>
  );
}
