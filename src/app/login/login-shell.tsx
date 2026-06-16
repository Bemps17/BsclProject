"use client";

import { LanguageSwitcher } from "@/components/bscl/locale-provider";
import { Card, LogoHex } from "@/components/bscl/ui";

export function LoginShell({
  description,
  children,
}: {
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-background px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-sm text-center ring-border/60">
        <div className="flex flex-col items-center gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold">
            <span className="text-primary">BSCL</span>.gg
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="w-full">{children}</div>
        </div>
      </Card>
    </div>
  );
}
