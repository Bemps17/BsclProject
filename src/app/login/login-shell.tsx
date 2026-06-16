"use client";

import { LanguageSwitcher } from "@/components/bscl/locale-provider";
import { LogoHex } from "@/components/bscl/ui";

export function LoginShell({
  description,
  children,
}: {
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-[#0B0B0B] px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm rounded-xl border border-[#1E2D45] bg-[#111827] p-8 text-center">
        <div className="mb-4 flex justify-center">
          <LogoHex />
        </div>
        <h1 className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold">
          <span className="text-[#0066FF]">BSCL</span>.gg
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
