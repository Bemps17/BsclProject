"use client";

import { Tag } from "@/components/bscl/ui";
import { useT } from "@/components/bscl/locale-provider";

type TournamentItem = {
  icon: string;
  name: string;
  meta: string;
  statusKey: "statusOpen" | "statusCheckIn" | "statusEnded";
  variant: "green" | "gold" | "muted";
  prize: string;
  date: string;
  ctaKey: "register" | "bracket" | "results";
  primary: boolean;
  dim?: boolean;
};

const TOURNAMENTS: TournamentItem[] = [
  {
    icon: "🏆",
    name: "BSCL Open #1",
    meta: "16 Teams · Single Elim · BO3",
    statusKey: "statusOpen",
    variant: "green",
    prize: "$200",
    date: "Jun 22 · 8/16 teams",
    ctaKey: "register",
    primary: true,
  },
  {
    icon: "⚡",
    name: "Weekly Cup #3",
    meta: "8 Teams · Double Elim · BO1",
    statusKey: "statusCheckIn",
    variant: "gold",
    prize: "$50",
    date: "Jun 17 · 8/8 teams",
    ctaKey: "bracket",
    primary: false,
  },
  {
    icon: "📋",
    name: "Weekly Cup #2",
    meta: "8 Teams · Single Elim · BO1",
    statusKey: "statusEnded",
    variant: "muted",
    prize: "APEX Gaming",
    date: "Winner",
    ctaKey: "results",
    primary: false,
    dim: true,
  },
];

export function TournamentsClient() {
  const t = useT();

  return (
    <>
      <h2 className="font-[family-name:var(--font-rajdhani)] text-[22px] font-bold">{t.tournaments.title}</h2>
      <div className="flex flex-col gap-2.5">
        {TOURNAMENTS.map((item) => {
          const status = t.tournaments[item.statusKey];
          const cta = t.tournaments[item.ctaKey];
          const prizeLabel = item.statusKey === "statusEnded" ? t.tournaments.winner : t.tournaments.prizePool;

          return (
            <div key={item.name} className={`overflow-hidden rounded-xl border border-[#1E2D45] bg-[#111827] ${item.dim ? "opacity-65" : ""}`}>
              <div className={`flex items-center gap-3 border-b border-[#1E2D45] p-4 ${item.dim ? "bg-[#162032]" : "bg-gradient-to-br from-[#080F1E] to-[#0A1830]"}`}>
                <span className="text-[28px]">{item.icon}</span>
                <div>
                  <div className="font-[family-name:var(--font-rajdhani)] text-lg font-bold">{item.name}</div>
                  <div className="text-[11px] text-[#6B7280]">{item.meta}</div>
                </div>
                <Tag variant={item.variant} className="ml-auto">{status}</Tag>
              </div>
              <div className="flex items-center justify-between gap-3 p-3.5">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#6B7280]">{prizeLabel}</div>
                  <div className={`font-[family-name:var(--font-rajdhani)] font-bold ${item.statusKey === "statusEnded" ? "text-base" : "text-[22px] text-[#F59E0B]"}`}>
                    {item.prize}
                  </div>
                </div>
                <div className="text-right text-xs text-[#6B7280]">{item.date}</div>
                <button
                  type="button"
                  className={
                    item.primary
                      ? "rounded-lg bg-[#0066FF] px-3.5 py-1.5 text-xs font-semibold text-white"
                      : "rounded-lg border border-[#1E2D45] bg-[#162032] px-3.5 py-1.5 text-xs font-semibold"
                  }
                >
                  {cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
