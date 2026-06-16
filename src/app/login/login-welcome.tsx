"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher, useT } from "@/components/bscl/locale-provider";
import { DiscordIcon } from "@/components/bscl/icons";
import { Button, LogoHex } from "@/components/bscl/ui";
import { cn } from "@/lib/utils";
import { LoginLangSwitcherSlot, LoginPageFrame } from "./login-page-frame";
import { LoginShell } from "./login-shell";

const modeCardClass =
  "group h-auto w-full min-w-0 touch-manipulation flex-col items-start gap-0 rounded-2xl border-2 p-4 text-left sm:p-5 md:p-6";

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

  async function enterDemo() {
    setLoadingDemo(true);
    try {
      await fetch("/api/demo/enter", { method: "POST" });
      router.push("/demo");
      router.refresh();
    } finally {
      setLoadingDemo(false);
    }
  }

  async function chooseStandard() {
    setLoadingStandard(true);
    try {
      await fetch("/api/demo/exit", { method: "DELETE" });
      setStep("standard");
      router.refresh();
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

      <div className="mb-6 flex w-full max-w-2xl flex-col items-center text-center sm:mb-8">
        <LogoHex />
        <h1 className="mt-4 font-[family-name:var(--font-rajdhani)] text-[clamp(1.75rem,5vw,2.25rem)] font-bold leading-tight">
          <span className="text-primary">BSCL</span>.gg
        </h1>
        <p className="mt-2 max-w-md px-1 text-sm leading-relaxed text-muted-foreground">
          {t.login.welcomeSubtitle}
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={chooseStandard}
          disabled={loadingStandard}
          className={cn(
            modeCardClass,
            "border-primary/35 bg-gradient-to-br from-primary/8 to-card hover:border-primary",
          )}
        >
          <span className="mb-3 inline-flex w-fit rounded-full border border-primary/35 bg-primary/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
            {t.login.standardBadge}
          </span>
          <span className="font-[family-name:var(--font-rajdhani)] text-lg font-bold text-foreground sm:text-xl">
            {t.login.standardTitle}
          </span>
          <span className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {t.login.standardDesc}
          </span>
          <span className="mt-4 min-h-[44px] text-sm font-bold leading-[44px] text-primary group-hover:underline sm:min-h-0 sm:leading-normal">
            {loadingStandard ? "…" : `${t.login.standardCta} →`}
          </span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={enterDemo}
          disabled={loadingDemo}
          className={cn(
            modeCardClass,
            "border-chart-3/35 bg-gradient-to-br from-chart-3/8 to-card hover:border-chart-3",
            loadingDemo && "opacity-60",
          )}
        >
          <span className="mb-3 inline-flex w-fit rounded-full border border-chart-3/35 bg-chart-3/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-chart-3">
            {t.login.demoBadge}
          </span>
          <span className="font-[family-name:var(--font-rajdhani)] text-lg font-bold text-foreground sm:text-xl">
            {t.login.demoTitle}
          </span>
          <span className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {t.login.demoCardDesc}
          </span>
          <span className="mt-4 min-h-[44px] text-sm font-bold leading-[44px] text-chart-3 group-hover:underline sm:min-h-0 sm:leading-normal">
            {loadingDemo ? "…" : `${t.login.demoCtaCard} →`}
          </span>
        </Button>
      </div>
    </LoginPageFrame>
  );
}
