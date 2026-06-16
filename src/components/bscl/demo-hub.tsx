"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DiscordSimModal } from "@/components/bscl/discord-sim-modal";
import { useDemo } from "@/components/bscl/demo-provider";
import { Card, CardHeader, StatCell, Tag } from "@/components/bscl/ui";
import { useT } from "@/components/bscl/locale-provider";
import type { MockDiscordAccount } from "@/lib/discord-sim";
import { saveGuestPlayer, saveSimulatedDiscordPlayer } from "@/lib/local-store";
import { matchStatusVariant } from "@/lib/match-display";
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
      <section className="rounded-[14px] border border-[rgba(245,158,11,.35)] bg-gradient-to-br from-[rgba(245,158,11,.08)] to-transparent p-5">
        <Tag variant="gold" className="mb-2">
          {t.common.demoBadge}
        </Tag>
        <h2 className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold">{t.demo.title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6B7280]">{t.demo.subtitle}</p>
      </section>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label={t.demo.stats.queue} value={demo.stats.queueCount} sub={t.common.active} />
        <StatCell label={t.demo.stats.live} value={demo.stats.liveMatches} sub={t.common.matches} />
        <StatCell label={t.demo.stats.played} value={demo.stats.matchCount} sub={t.common.matches} />
        <StatCell
          label={t.home.myElo}
          value={demo.player?.elo ?? "—"}
          valueClassName={demo.player ? "text-[#F59E0B]" : undefined}
        />
      </div>

      <Card>
        <CardHeader title={t.demo.journeyTitle} />
        <ol className="space-y-2">
          {steps.map((step, i) => (
            <li
              key={step.label}
              className="flex items-center gap-3 rounded-lg border border-[rgba(245,158,11,.25)] bg-[#162032] px-3 py-2.5 text-sm"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  step.done
                    ? "bg-[#22C55E] text-white"
                    : "bg-[rgba(245,158,11,.15)] text-[#F59E0B]"
                }`}
              >
                {step.done ? "✓" : i + 1}
              </span>
              <span className={step.done ? "text-[#E5E7EB]" : "text-[#6B7280]"}>{step.label}</span>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title={t.demo.authTitle} />
          <p className="mb-3 text-xs text-[#6B7280]">{t.demo.authDesc}</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4752C4]"
            >
              {t.login.discordCta}
            </button>
            <form onSubmit={handleGuestSignIn} className="flex gap-2">
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={t.login.displayName}
                maxLength={24}
                className="min-w-0 flex-1 rounded-lg border border-[#1E2D45] bg-[#0B1628] px-3 py-2 text-sm outline-none focus:border-[#F59E0B]"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-2 text-sm font-semibold"
              >
                {t.login.demoCta}
              </button>
            </form>
            {error && <p className="text-xs text-[#EF4444]">{error}</p>}
          </div>
        </Card>

        <Card>
          <CardHeader title={t.demo.actionsTitle} />
          <div className="flex flex-col gap-2">
            <Link
              href="/play"
              className="rounded-lg bg-[#F59E0B] px-4 py-2.5 text-center text-sm font-bold text-[#0B0B0B] shadow-[0_0_14px_rgba(245,158,11,.28)]"
            >
              {t.demo.goPlay}
            </Link>
            <button
              type="button"
              disabled={!signedIn}
              onClick={() => {
                try {
                  demo.fillBotsAndMatch();
                } catch (err) {
                  setError(err instanceof Error ? err.message : t.demo.actionFailed);
                }
              }}
              className="rounded-lg border border-[rgba(245,158,11,.35)] bg-[rgba(245,158,11,.08)] px-4 py-2.5 text-sm font-semibold text-[#F59E0B] disabled:opacity-50"
            >
              {t.demo.fillBotsMatch}
            </button>
            <button
              type="button"
              onClick={() => {
                demo.resetAll();
                router.push("/login");
              }}
              className="rounded-lg border border-[rgba(239,68,68,.35)] px-4 py-2.5 text-sm font-semibold text-[#EF4444]"
            >
              {t.demo.resetAll}
            </button>
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
          <p className="mb-3 text-xs text-[#6B7280]">
            #{String(activeMatch.number).padStart(3, "0")} · {t.demo.continueOnPlay}
          </p>
          <Link href="/play" className="text-sm font-semibold text-[#F59E0B]">
            {t.demo.goPlay} →
          </Link>
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
