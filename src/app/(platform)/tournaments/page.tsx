import { cookies } from "next/headers";
import { TournamentsClient } from "@/app/(platform)/tournaments/tournaments-client";
import { TournamentsDemo } from "@/app/(platform)/tournaments/tournaments-demo";
import { isDemoMode } from "@/lib/backend";

export default async function TournamentsPage() {
  const cookieStore = await cookies();
  if (isDemoMode(cookieStore.get("bscl_demo")?.value)) {
    return <TournamentsDemo />;
  }

  return <TournamentsClient />;
}
