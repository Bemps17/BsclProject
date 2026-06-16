import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/backend";
import { getCurrentPlayerProfile } from "@/lib/data";
import { ProfileDemo } from "./profile-demo";
import { ProfileLive } from "./profile-live";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  if (isDemoMode(cookieStore.get("bscl_demo")?.value)) {
    return <ProfileDemo />;
  }

  const profile = await getCurrentPlayerProfile();
  if (!profile) {
    redirect("/login");
  }

  const { user, player, rankPosition, recentMatches } = profile;
  const isStaff = user.role === "ADMIN" || user.role === "OWNER" || user.role === "MODERATOR";

  return (
    <ProfileLive
      displayName={player.displayName}
      username={user.username}
      rank={player.rank}
      verified={player.verified}
      elo={player.elo}
      peakElo={player.peakElo}
      wins={player.wins}
      losses={player.losses}
      rankPosition={rankPosition}
      recentMatches={recentMatches}
      isStaff={isStaff}
    />
  );
}
