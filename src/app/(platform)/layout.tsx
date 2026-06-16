import { AppShell } from "@/components/bscl/shell";
import { DemoProvider } from "@/components/bscl/demo-provider";
import { getSessionUser } from "@/lib/auth";
import { isBackendEnabled } from "@/lib/backend";
import { playerInitials, rankTierToKey } from "@/lib/ranks";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isBackendEnabled()) {
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
