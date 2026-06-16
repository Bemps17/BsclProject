"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/components/bscl/locale-provider";

export function DemoExitModal({
  open,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  const t = useT();
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onCancel]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/75 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm overflow-hidden rounded-xl border border-[rgba(245,158,11,.35)] bg-[#111827] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-5">
          <h2 id={titleId} className="font-[family-name:var(--font-rajdhani)] text-xl font-bold text-white">
            {t.demo.exitTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">{t.demo.exitDesc}</p>
        </div>
        <div className="flex gap-2 border-t border-[#1E2D45] bg-[#0B1628] px-4 py-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-[#1E2D45] px-4 py-2.5 text-sm font-semibold text-[#E5E7EB] disabled:opacity-50"
          >
            {t.demo.exitCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-[#EF4444] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "…" : t.demo.exitConfirm}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
