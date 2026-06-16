import { Tag } from "@/components/bscl/ui";

const TOURNAMENTS = [
  { icon: "🏆", name: "BSCL Open #1", meta: "16 Teams · Single Elim · BO3", status: "Open", variant: "green" as const, prize: "$200", date: "Jun 22 · 8/16 teams", cta: "Register", primary: true },
  { icon: "⚡", name: "Weekly Cup #3", meta: "8 Teams · Double Elim · BO1", status: "Check-in", variant: "gold" as const, prize: "$50", date: "Jun 17 · 8/8 teams", cta: "Bracket", primary: false },
  { icon: "📋", name: "Weekly Cup #2", meta: "8 Teams · Single Elim · BO1", status: "Ended", variant: "muted" as const, prize: "APEX Gaming", date: "Winner", cta: "Results", primary: false, dim: true },
];

export default function TournamentsPage() {
  return (
    <>
      <h2 className="font-[family-name:var(--font-rajdhani)] text-[22px] font-bold">Tournaments</h2>
      <div className="flex flex-col gap-2.5">
        {TOURNAMENTS.map((t) => (
          <div key={t.name} className={`overflow-hidden rounded-xl border border-[#1E2D45] bg-[#111827] ${t.dim ? "opacity-65" : ""}`}>
            <div className={`flex items-center gap-3 border-b border-[#1E2D45] p-4 ${t.dim ? "bg-[#162032]" : "bg-gradient-to-br from-[#080F1E] to-[#0A1830]"}`}>
              <span className="text-[28px]">{t.icon}</span>
              <div>
                <div className="font-[family-name:var(--font-rajdhani)] text-lg font-bold">{t.name}</div>
                <div className="text-[11px] text-[#6B7280]">{t.meta}</div>
              </div>
              <Tag variant={t.variant} className="ml-auto">{t.status}</Tag>
            </div>
            <div className="flex items-center justify-between gap-3 p-3.5">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#6B7280]">
                  {t.status === "Ended" ? "Winner" : "Prize Pool"}
                </div>
                <div className={`font-[family-name:var(--font-rajdhani)] font-bold ${t.status === "Ended" ? "text-base" : "text-[22px] text-[#F59E0B]"}`}>
                  {t.prize}
                </div>
              </div>
              <div className="text-right text-xs text-[#6B7280]">{t.date}</div>
              <button
                type="button"
                className={
                  t.primary
                    ? "rounded-lg bg-[#0066FF] px-3.5 py-1.5 text-xs font-semibold text-white"
                    : "rounded-lg border border-[#1E2D45] bg-[#162032] px-3.5 py-1.5 text-xs font-semibold"
                }
              >
                {t.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
