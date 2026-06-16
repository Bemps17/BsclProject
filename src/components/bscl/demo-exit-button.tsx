"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemoOptional } from "@/components/bscl/demo-provider";
import { DemoExitModal } from "@/components/bscl/demo-exit-modal";
import { useT } from "@/components/bscl/locale-provider";

export function DemoExitButton() {
  const t = useT();
  const router = useRouter();
  const demo = useDemoOptional();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!demo) return null;

  async function handleExit() {
    setLoading(true);
    try {
      await fetch("/api/demo/exit", { method: "DELETE" }).catch(() => undefined);
      demo!.exitDemo();
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-[rgba(245,158,11,.45)] bg-[rgba(245,158,11,.1)] px-2.5 py-1.5 text-[11px] font-bold text-[#F59E0B] transition hover:bg-[rgba(245,158,11,.2)] sm:px-3 sm:text-xs"
      >
        {t.demo.exitDemo}
      </button>
      <DemoExitModal
        open={open}
        loading={loading}
        onCancel={() => setOpen(false)}
        onConfirm={handleExit}
      />
    </>
  );
}
