"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher, useT } from "@/components/bscl/locale-provider";
import { LogoHex } from "@/components/bscl/ui";
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
        <div className="space-y-3">
          <form action={signInAction}>
            <button
              type="submit"
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
          </form>
          <button
            type="button"
            onClick={() => setStep("choose")}
            className="w-full rounded-lg border border-[#1E2D45] px-4 py-2.5 text-sm font-semibold text-[#9CA3AF] transition hover:border-[#0066FF] hover:text-[#E5E7EB]"
          >
            {t.login.backToModeChoice}
          </button>
        </div>
      </LoginShell>
    );
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-[#0B0B0B] px-4 py-8">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="mb-8 flex flex-col items-center text-center">
        <LogoHex />
        <h1 className="mt-4 font-[family-name:var(--font-rajdhani)] text-3xl font-bold sm:text-4xl">
          <span className="text-[#0066FF]">BSCL</span>.gg
        </h1>
        <p className="mt-2 max-w-md text-sm text-[#6B7280]">{t.login.welcomeSubtitle}</p>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setStep("standard")}
          className="group flex flex-col rounded-2xl border-2 border-[rgba(0,102,255,.35)] bg-gradient-to-br from-[rgba(0,102,255,.08)] to-[#111827] p-5 text-left transition hover:border-[#0066FF] hover:shadow-[0_0_24px_rgba(0,102,255,.2)] sm:p-6"
        >
          <span className="mb-3 inline-flex w-fit rounded-full border border-[rgba(0,102,255,.35)] bg-[rgba(0,102,255,.12)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#0066FF]">
            {t.login.standardBadge}
          </span>
          <span className="font-[family-name:var(--font-rajdhani)] text-xl font-bold text-white">
            {t.login.standardTitle}
          </span>
          <span className="mt-2 flex-1 text-sm leading-relaxed text-[#9CA3AF]">
            {t.login.standardDesc}
          </span>
          <span className="mt-4 text-sm font-bold text-[#0066FF] group-hover:underline">
            {t.login.standardCta} →
          </span>
        </button>

        <button
          type="button"
          onClick={enterDemo}
          disabled={loadingDemo}
          className={cn(
            "group flex flex-col rounded-2xl border-2 border-[rgba(245,158,11,.35)] bg-gradient-to-br from-[rgba(245,158,11,.08)] to-[#111827] p-5 text-left transition hover:border-[#F59E0B] hover:shadow-[0_0_24px_rgba(245,158,11,.2)] sm:p-6",
            loadingDemo && "opacity-60",
          )}
        >
          <span className="mb-3 inline-flex w-fit rounded-full border border-[rgba(245,158,11,.35)] bg-[rgba(245,158,11,.12)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">
            {t.login.demoBadge}
          </span>
          <span className="font-[family-name:var(--font-rajdhani)] text-xl font-bold text-white">
            {t.login.demoTitle}
          </span>
          <span className="mt-2 flex-1 text-sm leading-relaxed text-[#9CA3AF]">
            {t.login.demoCardDesc}
          </span>
          <span className="mt-4 text-sm font-bold text-[#F59E0B] group-hover:underline">
            {loadingDemo ? "…" : `${t.login.demoCtaCard} →`}
          </span>
        </button>
      </div>
    </div>
  );
}
