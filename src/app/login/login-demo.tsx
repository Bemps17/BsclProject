"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DiscordSimModal } from "@/components/bscl/discord-sim-modal";
import { DiscordIcon } from "@/components/bscl/icons";
import { useT } from "@/components/bscl/locale-provider";
import type { MockDiscordAccount } from "@/lib/discord-sim";
import { saveGuestPlayer, saveSimulatedDiscordPlayer } from "@/lib/local-store";
import { LoginShell } from "./login-shell";
import { SwitchModeLink } from "./switch-mode-link";

export function LoginDemo() {
  const router = useRouter();
  const t = useT();
  const [modalOpen, setModalOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleAuthorize(account: MockDiscordAccount) {
    try {
      saveSimulatedDiscordPlayer(account);
      setModalOpen(false);
      router.push("/demo");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.login.saveFailed);
    }
  }

  function handleGuest(e: React.FormEvent) {
    e.preventDefault();
    try {
      saveGuestPlayer(guestName);
      router.push("/demo");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.login.nameRequired);
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
            <DiscordIcon className="h-5 w-5" />
            {t.login.discordCta}
          </button>

          <form onSubmit={handleGuest} className="flex gap-2">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder={t.login.displayName}
              maxLength={24}
              className="min-w-0 flex-1 rounded-lg border border-[#1E2D45] bg-[#0B1628] px-3 py-2.5 text-sm outline-none focus:border-[#0066FF]"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-2.5 text-sm font-semibold"
            >
              {t.login.demoCta}
            </button>
          </form>

          <SwitchModeLink />

          <Link
            href="/demo"
            className="block text-center text-xs font-semibold text-[#9CA3AF] hover:text-[#E5E7EB] hover:underline"
          >
            {t.demo.openHub} →
          </Link>

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
