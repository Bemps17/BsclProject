"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/bscl/locale-provider";
import { saveGuestPlayer } from "@/lib/local-store";
import { LoginShell } from "./login-shell";

export function LoginDemo() {
  const router = useRouter();
  const t = useT();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      saveGuestPlayer(name);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.login.saveFailed);
    }
  }

  return (
    <LoginShell description={t.login.demoDesc}>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.login.displayName}
          maxLength={24}
          className="w-full rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]"
        />
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-[#0066FF] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0052CC]"
        >
          {t.login.demoCta}
        </button>
      </form>
    </LoginShell>
  );
}
