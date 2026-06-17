"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDemoOptional } from "@/components/bscl/demo-provider";
import { DemoExitModal } from "@/components/bscl/demo-exit-modal";
import { Button } from "@/components/ui/button";
import { ApiError, fetchJson } from "@/lib/fetch-client";
import { useT } from "@/components/bscl/locale-provider";

export function DemoExitButton() {
  const t = useT();
  const router = useRouter();
  const demo = useDemoOptional();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!demo) return null;

  async function handleExit() {
    setLoading(true);
    setError(null);
    try {
      await fetchJson("/api/demo/exit", { method: "DELETE" });
      demo!.exitDemo();
      setOpen(false);
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.login.demoExitFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label={t.demo.exitDemo}
        className="h-8 w-8 shrink-0 border-chart-3/45 bg-chart-3/10 px-0 text-chart-3 hover:bg-chart-3/20 sm:h-auto sm:w-auto sm:px-3 sm:text-xs"
      >
        <LogOut className="h-4 w-4 sm:hidden" aria-hidden />
        <span className="hidden text-[11px] font-bold sm:inline">{t.demo.exitDemo}</span>
      </Button>
      <DemoExitModal
        open={open}
        loading={loading}
        error={error}
        onCancel={() => {
          setOpen(false);
          setError(null);
        }}
        onConfirm={handleExit}
      />
    </>
  );
}
