import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared full-viewport frame for login / mode selection — mobile-safe (dvh + safe-area). */
export function LoginPageFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-dvh min-h-svh w-full flex-col items-center justify-center overflow-x-hidden bg-background",
        "px-[max(1rem,env(safe-area-inset-left))] py-[max(1.5rem,env(safe-area-inset-top))]",
        "pb-[max(1.5rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))]",
        "sm:px-6 sm:py-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LoginLangSwitcherSlot({ children }: { children: ReactNode }) {
  return (
    <div className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-10">
      {children}
    </div>
  );
}
