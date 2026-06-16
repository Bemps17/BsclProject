import { cookies } from "next/headers";
import { isDemoMode } from "@/lib/backend";
import { LoginDemo } from "./login-demo";
import { LoginDiscord } from "./login-discord";

export default async function LoginPage() {
  const cookieStore = await cookies();
  if (isDemoMode(cookieStore.get("bscl_demo")?.value)) {
    return <LoginDemo />;
  }
  return <LoginDiscord />;
}
