"use client";

import { LanguageSwitcher } from "@/components/bscl/locale-provider";
import { Card, LogoHex } from "@/components/bscl/ui";
import { LoginLangSwitcherSlot, LoginPageFrame } from "./login-page-frame";

export function LoginShell({
  description,
  children,
}: {
  description: string;
  children: React.ReactNode;
}) {
  return (
    <LoginPageFrame>
      <LoginLangSwitcherSlot>
        <LanguageSwitcher />
      </LoginLangSwitcherSlot>
      <Card className="w-full max-w-sm text-center ring-border/60">
        <div className="flex flex-col items-center gap-4">
          <div>
            <div className="mx-auto w-fit">
              <LogoHex />
            </div>
            <h1 className="mt-3 font-[family-name:var(--font-rajdhani)] text-[clamp(1.5rem,4.5vw,1.75rem)] font-bold">
              <span className="text-primary">BSCL</span>.gg
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
          <div className="w-full">{children}</div>
        </div>
      </Card>
    </LoginPageFrame>
  );
}
