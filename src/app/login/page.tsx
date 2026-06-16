import { isBackendEnabled } from "@/lib/backend";
import { LoginDemo } from "./login-demo";
import { LoginDiscord } from "./login-discord";

export default function LoginPage() {
  if (!isBackendEnabled()) {
    return <LoginDemo />;
  }
  return <LoginDiscord />;
}
