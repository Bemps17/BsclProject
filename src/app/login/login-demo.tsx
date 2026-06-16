"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoHex } from "@/components/bscl/ui";
import { saveGuestPlayer } from "@/lib/local-store";

export function LoginDemo() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      saveGuestPlayer(name);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#0B0B0B] px-4">
      <div className="w-full max-w-sm rounded-xl border border-[#1E2D45] bg-[#111827] p-8 text-center">
        <div className="mb-4 flex justify-center">
          <LogoHex />
        </div>
        <h1 className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold">
          <span className="text-[#0066FF]">BSCL</span>.gg
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Demo mode — create a local guest profile. Data is stored in your browser only.
        </p>
        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display name"
            maxLength={24}
            className="w-full rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]"
          />
          {error && <p className="text-xs text-[#EF4444]">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-[#0066FF] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0052CC]"
          >
            Continue as guest
          </button>
        </form>
      </div>
    </div>
  );
}
