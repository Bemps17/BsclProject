"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DiscordSimModal } from "@/components/bscl/discord-sim-modal";
import { useDemo } from "@/components/bscl/demo-provider";
import { DiscordIcon } from "@/components/bscl/icons";
import {
  Button,
  Card,
  CardHeader,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  StatCell,
  Tag,
} from "@/components/bscl/ui";
import { useT } from "@/components/bscl/locale-provider";
import type { MockDiscordAccount } from "@/lib/discord-sim";
import { saveGuestPlayer, saveSimulatedDiscordPlayer } from "@/lib/local-store";
import { matchStatusVariant } from "@/lib/match-display";
import { cn } from "@/lib/utils";
import type { Translations } from "@/lib/i18n";

function statusLabel(t: Translations, status: string): string {
  const key = status as keyof Translations["matchStatus"];
  return t.matchStatus[key] ?? status;
}

export function DemoHub() {
  const router = useRouter();
  const t = useT();
  const demo = useDemo();
  const [modalOpen, setModalOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const activeMatch = demo.matches.find(
    (m) => m.status === "DRAFT" || m.status === "LIVE" || m.status === "SUBMITTED",
  );
  const signedIn = Boolean(demo.player);
  const inQueue = demo.state.inQueue;
  const draftDone = demo.matches.some(
    (m) => m.status === "LIVE" || m.status === "SUBMITTED" || m.status === "CONFIRMED",
  );
  const hasMatches = demo.matches.some((m) => m.status === "CONFIRMED");

  function handleDiscordAuthorize(account: MockDiscordAccount) {
    try {
      saveSimulatedDiscordPlayer(account);
      setModalOpen(false);
      demo.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.login.saveFailed);
    }
  }

  function handleGuestSignIn(e: React.FormEvent) {
    e.preventDefault();
    try {
      saveGuestPlayer(guestName);
      setGuestName("");
      demo.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.login.nameRequired);
    }
  }

  const steps = [
    { done: signedIn, label: t.demo.steps.signIn },
    { done: inQueue || Boolean(activeMatch) || hasMatches, label: t.demo.steps.queue },
    { done: draftDone || hasMatches, label: t.demo.steps.draft },
    { done: hasMatches, label: t.demo.steps.match },
    { done: hasMatches, label: t.demo.steps.elo },
  ];

  return (
    <>
      <section className="rounded-[14px] border border-primary/35 bg-gradient-to-br from-primary/8 to-transparent p-5">
        <Tag variant="gold" className="mb-2">
          {t.common.demoBadge}
        </Tag>
        <h2 className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold">{t.demo.title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t.demo.subtitle}</p>
      </section>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label={t.demo.stats.queue} value={demo.stats.queueCount} sub={t.common.active} />
        <StatCell label={t.demo.stats.live} value={demo.stats.liveMatches} sub={t.common.matches} />
        <StatCell label={t.demo.stats.played} value={demo.stats.matchCount} sub={t.common.matches} />
        <StatCell
          label={t.home.myElo}
          value={demo.player?.elo ?? "—"}
          valueClassName={demo.player ? "text-primary" : undefined}
        />
      </div>

      <Card>
        <CardHeader title={t.demo.journeyTitle} />
        <ol className="flex flex-col gap-2">
          {steps.map((step, i) => (
            <li
              key={step.label}
              className="flex items-center gap-3 rounded-lg border border-primary/25 bg-secondary px-3 py-2.5 text-sm"
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  step.done
                    ? "bg-chart-2 text-primary-foreground"
                    : "bg-primary/15 text-primary",
                )}
              >
                {step.done ? "✓" : i + 1}
              </span>
              <span className={step.done ? "text-foreground" : "text-muted-foreground"}>{step.label}</span>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title={t.demo.authTitle} />
          <p className="mb-3 text-xs text-muted-foreground">{t.demo.authDesc}</p>
          <FieldGroup className="gap-2">
            <Button
              type="button"
              className="w-full bg-[#5865F2] text-white hover:bg-[#4752C4]"
              onClick={() => setModalOpen(true)}
            >
              <DiscordIcon data-icon="inline-start" />
              {t.login.discordCta}
            </Button>
            <form onSubmit={handleGuestSignIn}>
              <FieldGroup className="flex-row gap-2">
                <Field className="min-w-0 flex-1">
                  <FieldLabel htmlFor="demo-guest" className="sr-only">
                    {t.login.displayName}
                  </FieldLabel>
                  <Input
                    id="demo-guest"
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
            {error && <p className="text-xs text-destructive">{error}</p>}
          </FieldGroup>
        </Card>

        <Card>
          <CardHeader title={t.demo.actionsTitle} />
          <div className="flex flex-col gap-2">
            <Button render={<Link href="/play" />} className="w-full shadow-[0_0_14px_color-mix(in_oklch,var(--primary),transparent_72%)]">
              {t.demo.goPlay}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!signedIn}
              onClick={() => {
                try {
                  demo.fillBotsAndMatch();
                } catch (err) {
                  setError(err instanceof Error ? err.message : t.demo.actionFailed);
                }
              }}
            >
              {t.demo.fillBotsMatch}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                demo.resetAll();
                router.push("/login");
              }}
            >
              {t.demo.resetAll}
            </Button>
          </div>
        </Card>
      </div>

      {activeMatch && (
        <Card>
          <CardHeader
            title={t.demo.activeMatch}
            action={
              <Tag variant={matchStatusVariant(activeMatch.status)}>
                {statusLabel(t, activeMatch.status)}
              </Tag>
            }
          />
          <p className="mb-3 text-xs text-muted-foreground">
            #{String(activeMatch.number).padStart(3, "0")} · {t.demo.continueOnPlay}
          </p>
          <Button variant="link" className="h-auto p-0" render={<Link href="/play" />}>
            {t.demo.goPlay} →
          </Button>
        </Card>
      )}

      <DiscordSimModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAuthorize={handleDiscordAuthorize}
      />
    </>
  );
}
