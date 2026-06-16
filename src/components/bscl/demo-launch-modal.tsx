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
        className="max-w-md gap-0 overflow-hidden border-2 border-chart-3 p-0 ring-chart-3/30 sm:max-w-md"
      >
        <DialogHeader className="border-b border-chart-3/25 bg-chart-3/12 px-5 py-4 text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-chart-3">
            {t.demo.modeLabel}
          </p>
          <DialogTitle className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold text-foreground">
            {t.demo.launchTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-5 py-5">
          <DialogDescription className="text-sm leading-relaxed">
            {t.demo.launchDesc}
          </DialogDescription>
          <ul className="flex flex-col gap-2 text-sm text-foreground">
            {t.demo.launchFeatures.map((line) => (
              <li key={line} className="flex gap-2">
                <BulletIcon className="mt-1.5 text-chart-3" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-lg border border-chart-3/25 bg-chart-3/6 px-3 py-2 text-xs text-chart-3">
            {t.demo.launchNote}
          </p>
        </div>

        <DialogFooter className="border-t border-border bg-muted/30 px-5 py-4 sm:justify-stretch">
          <Button
            type="button"
            onClick={onLaunch}
            className="w-full bg-chart-3 text-primary-foreground hover:bg-chart-3/90"
          >
            {t.demo.launchCta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
