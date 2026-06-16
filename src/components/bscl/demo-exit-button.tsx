"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemoOptional } from "@/components/bscl/demo-provider";
import { DemoExitModal } from "@/components/bscl/demo-exit-modal";
import { Button } from "@/components/ui/button";
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
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-chart-3/45 bg-chart-3/10 text-[11px] font-bold text-chart-3 hover:bg-chart-3/20 sm:text-xs"
      >
        {t.demo.exitDemo}
      </Button>
      <DemoExitModal
        open={open}
        loading={loading}
        onCancel={() => setOpen(false)}
        onConfirm={handleExit}
      />
    </>
  );
}
