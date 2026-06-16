"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DiscordSimModal } from "@/components/bscl/discord-sim-modal";
import { useT } from "@/components/bscl/locale-provider";
import type { MockDiscordAccount } from "@/lib/discord-sim";
import { saveSimulatedDiscordPlayer } from "@/lib/local-store";
import { LoginShell } from "./login-shell";

export function LoginDemo() {
  const router = useRouter();
  const t = useT();
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAuthorize(account: MockDiscordAccount) {
    try {
      saveSimulatedDiscordPlayer(account);
      setModalOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.login.saveFailed);
    }
  }

  return (
    <>
      <LoginShell description={t.login.demoDesc}>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setModalOpen(true);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4752C4]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"
              />
            </svg>
            {t.login.discordCta}
          </button>
          {error && <p className="text-xs text-[#EF4444]">{error}</p>}
        </div>
      </LoginShell>

      <DiscordSimModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAuthorize={handleAuthorize}
      />
    </>
  );
}
