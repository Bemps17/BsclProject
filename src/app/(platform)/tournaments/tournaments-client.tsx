"use client";

import { Button, Tag } from "@/components/bscl/ui";
import { AppIcon } from "@/components/bscl/icons";
import { useT } from "@/components/bscl/locale-provider";
import type { AppIconId } from "@/lib/nav-icons";
import { cn } from "@/lib/utils";

export type TournamentRow = {
  id: string;
  icon: AppIconId;
  name: string;
  meta: string;
  statusKey: "statusOpen" | "statusCheckIn" | "statusEnded";
  variant: "green" | "gold" | "muted";
  prize: string;
  date: string;
  ctaKey: "register" | "bracket" | "results";
  primary: boolean;
  dim?: boolean;
  registered?: boolean;
};

const DEFAULT_TOURNAMENTS: TournamentRow[] = [
  {
    id: "tour_open_1",
    icon: "tournaments",
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
    id: "tour_weekly_3",
    icon: "zap",
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
    id: "tour_weekly_2",
    icon: "clipboard",
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

export function TournamentsClient({
  tournaments = DEFAULT_TOURNAMENTS,
  interactive = false,
  onRegister,
  error,
}: {
  tournaments?: TournamentRow[];
  interactive?: boolean;
  onRegister?: (id: string) => void;
  error?: string | null;
}) {
  const t = useT();

  return (
    <>
      <h2 className="font-heading text-[22px] font-bold">{t.tournaments.title}</h2>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex flex-col gap-2.5">
        {tournaments.map((item) => {
          const status = t.tournaments[item.statusKey];
          const cta = item.registered ? t.tournaments.registered : t.tournaments[item.ctaKey];
          const prizeLabel = item.statusKey === "statusEnded" ? t.tournaments.winner : t.tournaments.prizePool;

          return (
            <div key={item.id} className={cn("overflow-hidden rounded-xl border border-border bg-card", item.dim && "opacity-65")}>
              <div className={cn("flex items-center gap-3 border-b border-border p-4", item.dim ? "bg-secondary" : "bg-gradient-to-br from-background to-secondary")}>
                <AppIcon name={item.icon} className="h-7 w-7 text-chart-3" />
                <div>
                  <div className="font-heading text-lg font-bold">{item.name}</div>
                  <div className="text-[11px] text-muted-foreground">{item.meta}</div>
                </div>
                <Tag variant={item.variant} className="ml-auto">{status}</Tag>
              </div>
              <div className="flex items-center justify-between gap-3 p-3.5">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{prizeLabel}</div>
                  <div className={cn("font-heading font-bold", item.statusKey === "statusEnded" ? "text-base" : "text-[22px] text-chart-3")}>
                    {item.prize}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">{item.date}</div>
                <Button
                  type="button"
                  size="sm"
                  variant={item.primary && !item.registered ? "default" : "secondary"}
                  disabled={item.statusKey === "statusEnded" || Boolean(item.registered)}
                  onClick={() => interactive && onRegister?.(item.id)}
                >
                  {cta}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
