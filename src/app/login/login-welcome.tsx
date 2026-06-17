"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher, useT } from "@/components/bscl/locale-provider";
import { DiscordIcon } from "@/components/bscl/icons";
import { Button, LogoHex } from "@/components/bscl/ui";
import { ApiError, fetchJson } from "@/lib/fetch-client";
import { cn } from "@/lib/utils";
import { LoginLangSwitcherSlot, LoginPageFrame } from "./login-page-frame";
import { LoginShell } from "./login-shell";

const modeCardClass =
  "flex h-auto w-full min-w-0 max-w-full touch-manipulation flex-col items-start justify-start gap-0 rounded-2xl border-2 p-4 text-left text-sm transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 sm:p-5 md:p-6";

function ModeChoiceCard({
  badge,
  badgeClassName,
  title,
  description,
  cta,
  loading,
  borderClassName,
  ctaClassName,
  onClick,
  disabled,
}: {
  badge: string;
  badgeClassName: string;
  title: string;
  description: string;
  cta: string;
  loading?: boolean;
  borderClassName: string;
  ctaClassName: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(modeCardClass, borderClassName, disabled && "opacity-60")}
    >
      <span
        className={cn(
          "mb-3 inline-flex w-fit max-w-full rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
          badgeClassName,
        )}
      >
        {badge}
      </span>
      <span className="w-full font-heading text-lg font-bold text-foreground sm:text-xl">
        {title}
      </span>
      <span className="mt-2 w-full whitespace-normal break-words text-sm leading-relaxed text-muted-foreground">
        {description}
      </span>
      <span className={cn("mt-4 w-full whitespace-normal py-1 text-sm font-bold", ctaClassName)}>
        {loading ? "…" : `${cta} →`}
      </span>
    </button>
  );
}

export function LoginWelcome({
  signInAction,
  backendEnabled = true,
}: {
  signInAction?: () => Promise<void>;
  backendEnabled?: boolean;
}) {
  const router = useRouter();
  const t = useT();
  const [step, setStep] = useState<"choose" | "standard">("choose");
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [loadingStandard, setLoadingStandard] = useState(false);
  const [modeError, setModeError] = useState<string | null>(null);

  async function enterDemo() {
    setLoadingDemo(true);
    setModeError(null);
    try {
      await fetchJson("/api/demo/enter", { method: "POST" });
      router.push("/demo");
      router.refresh();
    } catch (err) {
      setModeError(err instanceof ApiError ? err.message : t.login.demoEnterFailed);
    } finally {
      setLoadingDemo(false);
    }
  }

  async function chooseStandard() {
    setLoadingStandard(true);
    setModeError(null);
    try {
      await fetchJson("/api/demo/exit", { method: "DELETE" });
      setStep("standard");
      router.refresh();
    } catch (err) {
      setModeError(err instanceof ApiError ? err.message : t.login.demoExitFailed);
    } finally {
      setLoadingStandard(false);
    }
  }

  if (step === "standard") {
    return (
      <LoginShell description={t.login.discordDesc}>
        <div className="flex flex-col gap-3">
          {backendEnabled && signInAction ? (
            <form action={signInAction}>
              <Button type="submit" className="w-full bg-[#5865F2] text-white hover:bg-[#4752C4]">
                <DiscordIcon data-icon="inline-start" />
                {t.login.discordCta}
              </Button>
            </form>
          ) : (
            <p className="rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-muted-foreground">
              {t.login.backendUnavailable}
            </p>
          )}
          <Button type="button" variant="outline" onClick={() => setStep("choose")}>
            {t.login.backToModeChoice}
          </Button>
        </div>
      </LoginShell>
    );
  }

  return (
    <LoginPageFrame>
      <LoginLangSwitcherSlot>
        <LanguageSwitcher />
      </LoginLangSwitcherSlot>

      <div className="mb-6 flex w-full min-w-0 max-w-2xl flex-col items-center text-center sm:mb-8">
        <LogoHex />
        <h1 className="mt-4 font-heading text-[clamp(1.75rem,5vw,2.25rem)] font-bold leading-tight">
          <span className="text-primary">BSCL</span>.gg
        </h1>
        <p className="mt-2 max-w-md px-1 text-sm leading-relaxed text-muted-foreground">
          {t.login.welcomeSubtitle}
        </p>
      </div>

      <div className="grid w-full min-w-0 max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {modeError && (
          <p
            className="col-span-full rounded-lg border border-destructive/35 bg-destructive/8 px-3 py-2 text-center text-sm text-destructive"
            role="alert"
          >
            {modeError}
          </p>
        )}
        <ModeChoiceCard
          badge={t.login.standardBadge}
          badgeClassName="border-primary/35 bg-primary/12 text-primary"
          title={t.login.standardTitle}
          description={t.login.standardDesc}
          cta={t.login.standardCta}
          loading={loadingStandard}
          disabled={loadingStandard}
          onClick={chooseStandard}
          borderClassName="border-primary/35 bg-gradient-to-br from-primary/8 to-card hover:border-primary"
          ctaClassName="text-primary"
        />

        <ModeChoiceCard
          badge={t.login.demoBadge}
          badgeClassName="border-chart-3/35 bg-chart-3/12 text-chart-3"
          title={t.login.demoTitle}
          description={t.login.demoCardDesc}
          cta={t.login.demoCtaCard}
          loading={loadingDemo}
          disabled={loadingDemo}
          onClick={enterDemo}
          borderClassName="border-chart-3/35 bg-gradient-to-br from-chart-3/8 to-card hover:border-chart-3"
          ctaClassName="text-chart-3"
        />
      </div>
    </LoginPageFrame>
  );
}
