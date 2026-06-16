"use client";

import { AdminClient } from "@/app/(platform)/admin/admin-client";
import { useDemo } from "@/components/bscl/demo-provider";

export function AdminDemo() {
  const demo = useDemo();

  return (
    <AdminClient
      demoMode
      stats={{
        users: demo.adminStats.users,
        openTickets: demo.adminStats.openTickets,
        activeBans: demo.adminStats.activeBans,
        pendingMatches: demo.adminStats.pendingMatches,
      }}
    />
  );
}
