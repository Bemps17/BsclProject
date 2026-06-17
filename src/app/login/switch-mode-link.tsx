"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/bscl/locale-provider";
import { ApiError, fetchJson } from "@/lib/fetch-client";

export function SwitchModeLink() {
  const router = useRouter();
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      await fetchJson("/api/demo/exit", { method: "DELETE" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.login.demoExitFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="link"
        disabled={loading}
        onClick={handleClick}
        className="h-auto w-full p-0 text-xs text-chart-3"
      >
        {loading ? "…" : `${t.login.backToModeChoice} →`}
      </Button>
      {error && (
        <p className="text-center text-[11px] text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
