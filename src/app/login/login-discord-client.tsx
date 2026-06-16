"use client";

import { useT } from "@/components/bscl/locale-provider";
import { LoginShell } from "./login-shell";
import { TryDemoLink } from "./try-demo-link";

export function LoginDiscordClient({
  signInAction,
}: {
  signInAction: () => Promise<void>;
}) {
  const t = useT();

  return (
    <LoginShell description={t.login.discordDesc}>
      <div className="space-y-3">
        <form action={signInAction}>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#5865F2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4752C4]"
          >
            {t.login.discordCta}
          </button>
        </form>
        <TryDemoLink />
      </div>
    </LoginShell>
  );
}
