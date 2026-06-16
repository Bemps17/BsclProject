import { signIn } from "@/auth";
import { LoginWelcome } from "./login-welcome";

export function LoginDiscord() {
  return (
    <LoginWelcome
      signInAction={async () => {
        "use server";
        await signIn("discord", { redirectTo: "/" });
      }}
    />
  );
}
