import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminClient } from "@/app/(platform)/admin/admin-client";
import { AdminDemo } from "@/app/(platform)/admin/admin-demo";
import { hasRole, getSessionUser } from "@/lib/auth";
import { isBackendEnabled, isDemoMode } from "@/lib/backend";
import { getAdminStats } from "@/lib/data";

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (isDemoMode(cookieStore.get("bscl_demo")?.value)) {
    return <AdminDemo />;
  }

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
