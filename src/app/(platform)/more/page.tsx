import { cookies } from "next/headers";
import { MoreMenu } from "@/components/bscl/more-menu";
import { getSessionUser } from "@/lib/auth";
import { isDemoMode } from "@/lib/backend";
import { playerInitials, rankTierToKey } from "@/lib/ranks";

export default async function MorePage() {
  const cookieStore = await cookies();
  const demoMode = isDemoMode(cookieStore.get("bscl_demo")?.value);

  let user = null;
  if (!demoMode) {
    const sessionUser = await getSessionUser();
    if (sessionUser?.player) {
      user = {
        name: sessionUser.player.displayName,
        initials: playerInitials(sessionUser.player.displayName),
        rankKey: rankTierToKey(sessionUser.player.rank),
        elo: sessionUser.player.elo,
      };
    }
  }

  return <MoreMenu demoMode={demoMode} user={user} />;
}
