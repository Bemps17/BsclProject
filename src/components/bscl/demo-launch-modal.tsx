"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/components/bscl/locale-provider";
import { BulletIcon } from "@/components/bscl/icons";

export function DemoLaunchModal({
  open,
  onLaunch,
}: {
  open: boolean;
  onLaunch: () => void;
}) {
  const t = useT();
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-[#0B0B0B]/90 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-[#F59E0B] bg-[#111827] shadow-[0_0_40px_rgba(245,158,11,.25)]"
      >
        <div className="border-b border-[rgba(245,158,11,.25)] bg-[rgba(245,158,11,.12)] px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F59E0B]">
            {t.demo.modeLabel}
          </p>
          <h2 id={titleId} className="mt-1 font-[family-name:var(--font-rajdhani)] text-2xl font-bold text-white">
            {t.demo.launchTitle}
          </h2>
        </div>

        <div className="space-y-4 px-5 py-5">
          <p className="text-sm leading-relaxed text-[#9CA3AF]">{t.demo.launchDesc}</p>
          <ul className="space-y-2 text-sm text-[#E5E7EB]">
            {t.demo.launchFeatures.map((line) => (
              <li key={line} className="flex gap-2">
                <BulletIcon className="mt-1.5 h-2 w-2 text-[#F59E0B]" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-lg border border-[rgba(245,158,11,.25)] bg-[rgba(245,158,11,.06)] px-3 py-2 text-xs text-[#F59E0B]">
            {t.demo.launchNote}
          </p>
        </div>

        <div className="border-t border-[#1E2D45] bg-[#0B1628] px-5 py-4">
          <button
            type="button"
            onClick={onLaunch}
            className="w-full rounded-lg bg-[#F59E0B] px-4 py-3 text-sm font-bold text-[#0B0B0B] shadow-[0_0_20px_rgba(245,158,11,.35)] transition hover:bg-[#D97706]"
          >
            {t.demo.launchCta}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
