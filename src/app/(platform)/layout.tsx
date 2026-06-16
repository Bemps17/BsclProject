import { cookies } from "next/headers";
import { AppShell } from "@/components/bscl/shell";
import { DemoProvider } from "@/components/bscl/demo-provider";
import { getSessionUser } from "@/lib/auth";
import { isDemoMode } from "@/lib/backend";
import { playerInitials, rankTierToKey } from "@/lib/ranks";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const demoMode = isDemoMode(cookieStore.get("bscl_demo")?.value);

  if (demoMode) {
    return (
      <DemoProvider>
        <AppShell demoMode user={null}>
          {children}
        </AppShell>
      </DemoProvider>
    );
  }

  const user = await getSessionUser();
  const shellUser = user?.player
    ? {
        name: user.player.displayName,
        initials: playerInitials(user.player.displayName),
        rankKey: rankTierToKey(user.player.rank),
        elo: user.player.elo,
      }
    : null;

  return <AppShell user={shellUser}>{children}</AppShell>;
}
