import { Card, Tag } from "@/components/bscl/ui";

const TICKETS = [
  { id: "#T-018", subject: "Match Dispute — #M-034", status: "Open", variant: "green" as const },
  { id: "#T-012", subject: "Technical — Bot not responding", status: "Answered", variant: "gold" as const },
  { id: "#T-007", subject: "General — Team transfer", status: "Closed", variant: "muted" as const },
];

export default function TicketsPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-rajdhani)] text-[22px] font-bold">Support</h2>
        <button type="button" className="rounded-lg bg-[#0066FF] px-3.5 py-1.5 text-xs font-semibold text-white">
          + New
        </button>
      </div>
      <Card>
        <h2 className="mb-3.5 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">My Tickets</h2>
        <div className="flex flex-col gap-2">
          {TICKETS.map((t) => (
            <div key={t.id} className="flex items-center gap-2.5 rounded-lg border border-[#1E2D45] bg-[#162032] p-3">
              <div className="min-w-12 font-[family-name:var(--font-jetbrains)] text-[11px] text-[#6B7280]">{t.id}</div>
              <div className="flex-1 text-[13px] font-medium">{t.subject}</div>
              <Tag variant={t.variant}>{t.status}</Tag>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
