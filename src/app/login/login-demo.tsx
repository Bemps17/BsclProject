"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DiscordSimModal } from "@/components/bscl/discord-sim-modal";
import { DiscordIcon } from "@/components/bscl/icons";
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
} from "@/components/bscl/ui";
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
        <FieldGroup className="gap-3">
          <Button
            type="button"
            className="w-full bg-[#5865F2] text-white hover:bg-[#4752C4]"
            onClick={() => {
              setError(null);
              setModalOpen(true);
            }}
          >
            <DiscordIcon data-icon="inline-start" />
            {t.login.discordCta}
          </Button>

          <form onSubmit={handleGuest}>
            <FieldGroup className="flex-row gap-2">
              <Field className="min-w-0 flex-1">
                <FieldLabel htmlFor="guest-name" className="sr-only">
                  {t.login.displayName}
                </FieldLabel>
                <Input
                  id="guest-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder={t.login.displayName}
                  maxLength={24}
                />
              </Field>
              <Button type="submit" variant="secondary">
                {t.login.demoCta}
              </Button>
            </FieldGroup>
          </form>

          <SwitchModeLink />

          <Button variant="link" className="h-auto p-0 text-xs text-muted-foreground" render={<Link href="/demo" />}>
            {t.demo.openHub} →
          </Button>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </FieldGroup>
      </LoginShell>

      <DiscordSimModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAuthorize={handleAuthorize}
      />
    </>
  );
}
