import { AppShell } from "@/components/bscl/shell";
import { getSessionUser } from "@/lib/auth";
import { playerInitials, rankTierToKey } from "@/lib/ranks";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
