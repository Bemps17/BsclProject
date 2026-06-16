"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher, useT } from "@/components/bscl/locale-provider";
import { DiscordIcon } from "@/components/bscl/icons";
import { Button, LogoHex } from "@/components/bscl/ui";
import { cn } from "@/lib/utils";
import { LoginShell } from "./login-shell";

export function LoginWelcome({
  signInAction,
}: {
  signInAction: () => Promise<void>;
}) {
  const router = useRouter();
  const t = useT();
  const [step, setStep] = useState<"choose" | "standard">("choose");
  const [loadingDemo, setLoadingDemo] = useState(false);

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

  if (step === "standard") {
    return (
      <LoginShell description={t.login.discordDesc}>
        <div className="flex flex-col gap-3">
          <form action={signInAction}>
            <Button type="submit" className="w-full bg-[#5865F2] text-white hover:bg-[#4752C4]">
              <DiscordIcon data-icon="inline-start" />
              {t.login.discordCta}
            </Button>
          </form>
          <Button type="button" variant="outline" onClick={() => setStep("choose")}>
            {t.login.backToModeChoice}
          </Button>
        </div>
      </LoginShell>
    );
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-background px-4 py-8">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="mb-8 flex flex-col items-center text-center">
        <LogoHex />
        <h1 className="mt-4 font-[family-name:var(--font-rajdhani)] text-3xl font-bold sm:text-4xl">
          <span className="text-primary">BSCL</span>.gg
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{t.login.welcomeSubtitle}</p>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep("standard")}
          className="group h-auto flex-col items-start gap-0 rounded-2xl border-2 border-primary/35 bg-gradient-to-br from-primary/8 to-card p-5 text-left hover:border-primary sm:p-6"
        >
          <span className="mb-3 inline-flex w-fit rounded-full border border-primary/35 bg-primary/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
            {t.login.standardBadge}
          </span>
          <span className="font-[family-name:var(--font-rajdhani)] text-xl font-bold text-foreground">
            {t.login.standardTitle}
          </span>
          <span className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {t.login.standardDesc}
          </span>
          <span className="mt-4 text-sm font-bold text-primary group-hover:underline">
            {t.login.standardCta} →
          </span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={enterDemo}
          disabled={loadingDemo}
          className={cn(
            "group h-auto flex-col items-start gap-0 rounded-2xl border-2 border-chart-3/35 bg-gradient-to-br from-chart-3/8 to-card p-5 text-left hover:border-chart-3 sm:p-6",
            loadingDemo && "opacity-60",
          )}
        >
          <span className="mb-3 inline-flex w-fit rounded-full border border-chart-3/35 bg-chart-3/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-chart-3">
            {t.login.demoBadge}
          </span>
          <span className="font-[family-name:var(--font-rajdhani)] text-xl font-bold text-foreground">
            {t.login.demoTitle}
          </span>
          <span className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {t.login.demoCardDesc}
          </span>
          <span className="mt-4 text-sm font-bold text-chart-3 group-hover:underline">
            {loadingDemo ? "…" : `${t.login.demoCtaCard} →`}
          </span>
        </Button>
      </div>
    </div>
  );
}
