"use client";

import { useState } from "react";
import { TicketsClient } from "@/app/(platform)/tickets/tickets-client";
import { useDemo } from "@/components/bscl/demo-provider";

export function TicketsDemo() {
  const demo = useDemo();
  const [error, setError] = useState<string | null>(null);

  return (
    <TicketsClient
      tickets={demo.tickets.map((t) => ({
        id: `#T-${String(t.number).padStart(3, "0")}`,
        subject: t.subject,
        statusKey:
          t.status === "OPEN"
            ? ("statusOpen" as const)
            : t.status === "ANSWERED"
              ? ("statusAnswered" as const)
              : ("statusClosed" as const),
        variant:
          t.status === "OPEN"
            ? ("green" as const)
            : t.status === "ANSWERED"
              ? ("gold" as const)
              : ("muted" as const),
      }))}
      interactive
      onCreateTicket={(subject) => {
        setError(null);
        try {
          demo.openTicket(subject);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not create ticket");
        }
      }}
      error={error}
    />
  );
}
