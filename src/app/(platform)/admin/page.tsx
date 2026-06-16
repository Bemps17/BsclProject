import { AdminClient } from "@/app/(platform)/admin/admin-client";
import { getAdminStats } from "@/lib/data";

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <AdminClient
      stats={{
        users: stats.users,
        openTickets: stats.openTickets,
        activeBans: stats.activeBans,
        pendingMatches: stats.pendingMatches,
      }}
    />
  );
}
