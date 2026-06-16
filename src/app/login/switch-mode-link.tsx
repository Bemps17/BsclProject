"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/bscl/locale-provider";

export function SwitchModeLink() {
  const router = useRouter();
  const t = useT();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await fetch("/api/demo/exit", { method: "DELETE" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="link"
      disabled={loading}
      onClick={handleClick}
      className="h-auto w-full p-0 text-xs text-chart-3"
    >
      {loading ? "…" : `${t.login.backToModeChoice} →`}
    </Button>
  );
}
