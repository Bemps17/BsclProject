"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="block w-full text-center text-xs font-semibold text-[#F59E0B] hover:underline disabled:opacity-50"
    >
      {loading ? "…" : `${t.login.backToModeChoice} →`}
    </button>
  );
}
