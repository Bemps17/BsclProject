"use client";

import { BulletIcon } from "@/components/bscl/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/components/bscl/locale-provider";
import { cn } from "@/lib/utils";

/** Space reserved for mobile tab bar + safe area when sizing the launch dialog. */
const MOBILE_CHROME =
  "calc(4rem + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px) + 1.5rem)";

export function DemoLaunchModal({
  open,
  onLaunch,
}: {
  open: boolean;
  onLaunch: () => void;
}) {
  const t = useT();

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex max-h-[min(32rem,calc(100dvh-var(--demo-launch-chrome)))] w-[calc(100%-1.5rem)] max-w-md flex-col gap-0 overflow-hidden border-2 border-chart-3 p-0 ring-chart-3/30 sm:max-w-md",
          "top-[max(0.75rem,env(safe-area-inset-top))] max-sm:translate-y-0 sm:top-1/2 sm:-translate-y-1/2",
        )}
        style={{ ["--demo-launch-chrome" as string]: MOBILE_CHROME }}
      >
        <DialogHeader className="shrink-0 border-b border-chart-3/25 bg-chart-3/12 px-5 py-4 text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-chart-3">
            {t.demo.modeLabel}
          </p>
          <DialogTitle className="font-heading text-2xl font-bold text-foreground">
            {t.demo.launchTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <div className="flex flex-col gap-4">
            <DialogDescription className="text-sm leading-relaxed">
              {t.demo.launchDesc}
            </DialogDescription>
            <ul className="flex flex-col gap-2 text-sm text-foreground">
              {t.demo.launchFeatures.map((line) => (
                <li key={line} className="flex gap-2">
                  <BulletIcon className="mt-1.5 shrink-0 text-chart-3" />
                  <span className="min-w-0 break-words">{line}</span>
                </li>
              ))}
            </ul>
            <p className="rounded-lg border border-chart-3/25 bg-chart-3/6 px-3 py-2 text-xs leading-relaxed text-chart-3">
              {t.demo.launchNote}
            </p>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 border-t border-border bg-muted/30 px-5 py-4 sm:justify-stretch">
          <Button
            type="button"
            onClick={onLaunch}
            className="min-h-11 w-full bg-chart-3 text-primary-foreground hover:bg-chart-3/90"
          >
            {t.demo.launchCta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
