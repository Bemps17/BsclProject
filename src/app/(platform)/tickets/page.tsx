import { cookies } from "next/headers";
import { TicketsClient } from "@/app/(platform)/tickets/tickets-client";
import { TicketsDemo } from "@/app/(platform)/tickets/tickets-demo";
import { isDemoMode } from "@/lib/backend";

export default async function TicketsPage() {
  const cookieStore = await cookies();
  if (isDemoMode(cookieStore.get("bscl_demo")?.value)) {
    return <TicketsDemo />;
  }

  return <TicketsClient />;
}
