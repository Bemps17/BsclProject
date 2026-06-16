"use client";

import { useState } from "react";
import { useDemoOptional } from "@/components/bscl/demo-provider";
import { Card, CardHeader, Tag } from "@/components/bscl/ui";
import { useT } from "@/components/bscl/locale-provider";
import { matchStatusVariant } from "@/lib/match-display";
import type { Translations } from "@/lib/i18n";
import type { LocalMatch } from "@/lib/local-store";

function statusLabel(t: Translations, status: string): string {
  const key = status as keyof Translations["matchStatus"];
  return t.matchStatus[key] ?? status;
}

function DemoActiveMatchPanel({ match }: { match: LocalMatch }) {
  const demo = useDemoOptional();
  const t = useT();
  const [alphaScore, setAlphaScore] = useState("13");
  const [bravoScore, setBravoScore] = useState("7");
  const [error, setError] = useState<string | null>(null);

  if (!demo?.player) return null;

  const player = demo.player;
  const playerId = player.id;
  const isCaptain =
    playerId === match.captainAlpha || playerId === match.captainBravo;
  const isSubmitter = match.submittedBy === playerId;
  const canSubmit = match.status === "LIVE" && isCaptain;
  const canConfirm =
    match.status === "SUBMITTED" &&
    match.submittedBy != null &&
    match.submittedBy !== playerId &&
    isCaptain;

  function handleSubmit() {
    setError(null);
    try {
      const a = Number(alphaScore);
      const b = Number(bravoScore);
      if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error(t.demo.invalidScore);
      demo!.submitMatch(match.id, a, b);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.demo.actionFailed);
    }
  }

  function handleConfirm() {
    setError(null);
    try {
      demo!.confirmMatch(match.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.demo.actionFailed);
    }
  }

  const alphaNames = match.players.filter((p) => p.side === "ALPHA").map((p) => p.name);
  const bravoNames = match.players.filter((p) => p.side === "BRAVO").map((p) => p.name);

  return (
    <Card>
      <CardHeader
        title={`${t.demo.activeMatch} #${String(match.number).padStart(3, "0")}`}
        action={
          <Tag variant={matchStatusVariant(match.status)}>
            {statusLabel(t, match.status)}
          </Tag>
        }
      />
      <div className="mb-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-[#1E2D45] bg-[#162032] p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#0066FF]">Alpha</p>
          <ul className="space-y-1 text-xs text-[#E5E7EB]">
            {alphaNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-[#1E2D45] bg-[#162032] p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">Bravo</p>
          <ul className="space-y-1 text-xs text-[#E5E7EB]">
            {bravoNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>

      {match.status === "SUBMITTED" && match.alphaScore != null && match.bravoScore != null && (
        <p className="mb-3 text-center font-[family-name:var(--font-jetbrains)] text-lg font-bold">
          {match.alphaScore} — {match.bravoScore}
        </p>
      )}

      {canSubmit && (
        <div className="mb-3 flex items-center justify-center gap-2">
          <input
            type="number"
            min={0}
            max={16}
            value={alphaScore}
            onChange={(e) => setAlphaScore(e.target.value)}
            className="w-16 rounded-lg border border-[#1E2D45] bg-[#0B1628] px-2 py-2 text-center text-sm"
            aria-label="Alpha score"
          />
          <span className="text-[#6B7280]">:</span>
          <input
            type="number"
            min={0}
            max={16}
            value={bravoScore}
            onChange={(e) => setBravoScore(e.target.value)}
            className="w-16 rounded-lg border border-[#1E2D45] bg-[#0B1628] px-2 py-2 text-center text-sm"
            aria-label="Bravo score"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {canSubmit && (
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white"
          >
            {t.demo.submitScore}
          </button>
        )}
        {canConfirm && (
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-lg bg-[#22C55E] px-4 py-2 text-sm font-semibold text-white"
          >
            {t.demo.confirmScore}
          </button>
        )}
        {match.status === "SUBMITTED" && !canConfirm && (
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-lg border border-[#1E2D45] bg-[#162032] px-4 py-2 text-sm font-semibold"
          >
            {t.demo.simulateConfirm}
          </button>
        )}
        {isSubmitter && match.status === "SUBMITTED" && (
          <p className="text-xs text-[#6B7280]">{t.demo.waitingConfirm}</p>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-[#EF4444]">{error}</p>}
    </Card>
  );
}

export function DemoActiveMatch() {
  const demo = useDemoOptional();
  if (!demo) return null;

  const active = demo.matches.find((m) => m.status === "LIVE" || m.status === "SUBMITTED");
  if (!active) return null;

  return <DemoActiveMatchPanel match={active} />;
}
