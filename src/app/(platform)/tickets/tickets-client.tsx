"use client";

import { Button, Card, Tag } from "@/components/bscl/ui";
import { useT } from "@/components/bscl/locale-provider";

const TICKETS = [
  { id: "#T-018", subject: "Match Dispute — #M-034", statusKey: "statusOpen" as const, variant: "green" as const },
  { id: "#T-012", subject: "Technical — Bot not responding", statusKey: "statusAnswered" as const, variant: "gold" as const },
  { id: "#T-007", subject: "General — Team transfer", statusKey: "statusClosed" as const, variant: "muted" as const },
];

export function TicketsClient() {
  const t = useT();

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-rajdhani)] text-[22px] font-bold">{t.tickets.title}</h2>
        <Button size="sm">+ {t.tickets.new}</Button>
      </div>
      <Card>
        <h2 className="mb-3.5 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">{t.tickets.myTickets}</h2>
        <div className="flex flex-col gap-2">
          {TICKETS.map((ticket) => (
            <div key={ticket.id} className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary p-3">
              <div className="min-w-12 font-[family-name:var(--font-jetbrains)] text-[11px] text-muted-foreground">{ticket.id}</div>
              <div className="flex-1 text-[13px] font-medium">{ticket.subject}</div>
              <Tag variant={ticket.variant}>{t.tickets[ticket.statusKey]}</Tag>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
