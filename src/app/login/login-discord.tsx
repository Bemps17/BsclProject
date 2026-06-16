import { signIn } from "@/auth";
import { LoginDiscordClient } from "./login-discord-client";

export function LoginDiscord() {
  return (
    <LoginDiscordClient
      signInAction={async () => {
        "use server";
        await signIn("discord", { redirectTo: "/" });
      }}
    />
  );
}
