"use client";

import { useState } from "react";
import { Button, Card, Field, FieldGroup, FieldLabel, Input, Tag } from "@/components/bscl/ui";
import { useT } from "@/components/bscl/locale-provider";

type TicketRow = {
  id: string;
  subject: string;
  statusKey: "statusOpen" | "statusAnswered" | "statusClosed";
  variant: "green" | "gold" | "muted";
};

const DEFAULT_TICKETS: TicketRow[] = [
  { id: "#T-018", subject: "Match Dispute — #M-034", statusKey: "statusOpen", variant: "green" },
  { id: "#T-012", subject: "Technical — Bot not responding", statusKey: "statusAnswered", variant: "gold" },
  { id: "#T-007", subject: "General — Team transfer", statusKey: "statusClosed", variant: "muted" },
];

export function TicketsClient({
  tickets = DEFAULT_TICKETS,
  interactive = false,
  onCreateTicket,
  error,
}: {
  tickets?: TicketRow[];
  interactive?: boolean;
  onCreateTicket?: (subject: string) => void;
  error?: string | null;
}) {
  const t = useT();
  const [subject, setSubject] = useState("");
  const [showForm, setShowForm] = useState(false);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    onCreateTicket?.(subject);
    setSubject("");
    setShowForm(false);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-[22px] font-bold">{t.tickets.title}</h2>
        {interactive ? (
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            + {t.tickets.new}
          </Button>
        ) : (
          <Button size="sm">+ {t.tickets.new}</Button>
        )}
      </div>

      {interactive && showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-secondary p-4">
          <FieldGroup className="flex-row gap-2">
            <Field className="min-w-0 flex-1">
              <FieldLabel htmlFor="ticket-subject" className="sr-only">
                {t.tickets.subjectLabel}
              </FieldLabel>
              <Input
                id="ticket-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t.tickets.subjectPlaceholder}
                maxLength={120}
              />
            </Field>
            <Button type="submit">{t.tickets.new}</Button>
          </FieldGroup>
        </form>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Card>
        <h2 className="mb-3.5 font-heading text-[15px] font-bold">{t.tickets.myTickets}</h2>
        <div className="flex flex-col gap-2">
          {tickets.map((ticket) => (
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
