import { redirect } from "next/navigation";
import { AdminClient } from "@/app/(platform)/admin/admin-client";
import { hasRole, getSessionUser } from "@/lib/auth";
import { isBackendEnabled } from "@/lib/backend";
import { getAdminStats } from "@/lib/data";

export default async function AdminPage() {
  if (!isBackendEnabled()) {
    redirect("/");
  }

  const user = await getSessionUser();
  if (!user || !hasRole(user.role, "MODERATOR")) {
    redirect("/");
  }

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
