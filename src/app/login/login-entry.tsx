import { signIn } from "@/auth";
import { isBackendEnabled } from "@/lib/backend";
import { LoginWelcome } from "./login-welcome";

export function LoginEntry() {
  const backendEnabled = isBackendEnabled();

  return (
    <LoginWelcome
      backendEnabled={backendEnabled}
      signInAction={
        backendEnabled
          ? async () => {
              "use server";
              await signIn("discord", { redirectTo: "/" });
            }
          : undefined
      }
    />
  );
}
