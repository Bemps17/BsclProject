"use client";

import { useT } from "@/components/bscl/locale-provider";
import { LoginShell } from "./login-shell";

export function LoginDiscordClient({
  signInAction,
}: {
  signInAction: () => Promise<void>;
}) {
  const t = useT();

  return (
    <LoginShell description={t.login.discordDesc}>
      <form action={signInAction}>
        <button
          type="submit"
          className="w-full rounded-lg bg-[#5865F2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4752C4]"
        >
          {t.login.discordCta}
        </button>
      </form>
    </LoginShell>
  );
}
