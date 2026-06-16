"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/bscl/locale-provider";

export function TryDemoLink() {
  const router = useRouter();
  const t = useT();
  const [loading, setLoading] = useState(false);

  async function enterDemo() {
    setLoading(true);
    try {
      await fetch("/api/demo/enter", { method: "POST" });
      router.push("/demo");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={enterDemo}
      disabled={loading}
      className="w-full rounded-lg border border-[rgba(245,158,11,.35)] bg-[rgba(245,158,11,.08)] px-4 py-2.5 text-sm font-semibold text-[#F59E0B] disabled:opacity-50"
    >
      {loading ? "…" : t.demo.enterPrototype}
    </button>
  );
}
