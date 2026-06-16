"use client";

import { useState } from "react";
import { useDemoOptional } from "@/components/bscl/demo-provider";
import { Card, CardHeader, Tag } from "@/components/bscl/ui";
import { useT } from "@/components/bscl/locale-provider";
import { draftRevealTotalSteps } from "@/lib/local-matchmaker";
import { matchStatusVariant } from "@/lib/match-display";
import type { Translations } from "@/lib/i18n";
import type { LocalMatch } from "@/lib/local-store";

function statusLabel(t: Translations, status: string): string {
  const key = status as keyof Translations["matchStatus"];
  return t.matchStatus[key] ?? status;
}

function playerName(match: LocalMatch, id: string): string {
  return match.players.find((p) => p.playerId === id)?.name ?? "?";
}

function DemoMatchFlowPanel({ match }: { match: LocalMatch }) {
  const demo = useDemoOptional();
  const t = useT();
  const [alphaScore, setAlphaScore] = useState("13");
  const [bravoScore, setBravoScore] = useState("7");
  const [error, setError] = useState<string | null>(null);
  const [confirmedToast, setConfirmedToast] = useState<number | null>(null);

  if (!demo?.player) return null;

  const player = demo.player;
  const playerId = player.id;
  const isCaptain =
    playerId === match.captainAlpha || playerId === match.captainBravo;
  const isAlphaCaptain = playerId === match.captainAlpha;
  const canSubmit = match.status === "LIVE" && isCaptain;
  const canConfirm =
    match.status === "SUBMITTED" &&
    match.submittedBy != null &&
    match.submittedBy !== playerId &&
    isCaptain;

  const totalDraftSteps = draftRevealTotalSteps(match);
  const draftDone = match.draftRevealStep >= totalDraftSteps;
  const currentPick =
    match.draftRevealStep > 0 && match.draftRevealStep <= match.draftPicks.length
      ? match.draftPicks[match.draftRevealStep - 1]
      : null;

  const alphaRoster = match.players.filter((p) => p.side === "ALPHA");
  const bravoRoster = match.players.filter((p) => p.side === "BRAVO");

  function handleAdvanceDraft() {
    setError(null);
    try {
      demo!.advanceDraft(match.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.demo.actionFailed);
    }
  }

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
      const mp = match.players.find((p) => p.playerId === playerId);
      if (mp) setConfirmedToast(mp.eloDelta ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.demo.actionFailed);
    }
  }

  return (
    <Card className="border-[rgba(245,158,11,.35)] bg-[rgba(245,158,11,.04)]">
      <CardHeader
        title={`${t.demo.activeMatch} #${String(match.number).padStart(3, "0")}`}
        action={
          <Tag variant={matchStatusVariant(match.status as "DRAFT" | "LIVE" | "SUBMITTED" | "CONFIRMED")}>
            {statusLabel(t, match.status)}
          </Tag>
        }
      />

      {match.status === "DRAFT" && !draftDone && (
        <div className="mb-4 space-y-3">
          {match.draftRevealStep === 0 && (
            <div className="rounded-lg border border-[rgba(245,158,11,.3)] bg-[rgba(245,158,11,.08)] p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">
                {t.demo.captainSelection}
              </p>
              <p className="mb-3 text-xs text-[#9CA3AF]">{t.demo.captainRule}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-[rgba(245,158,11,.25)] bg-[#162032] p-3">
                  <p className="text-[10px] font-bold uppercase text-[#F59E0B]">Alpha {t.demo.captain}</p>
                  <p className="mt-1 font-semibold text-white">
                    {playerName(match, match.captainAlpha)}
                    {match.captainAlpha === playerId && (
                      <span className="ml-1 text-xs text-[#F59E0B]">({t.demo.you})</span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-[#1E2D45] bg-[#162032] p-3">
                  <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Bravo {t.demo.captain}</p>
                  <p className="mt-1 font-semibold text-white">{playerName(match, match.captainBravo)}</p>
                </div>
              </div>
            </div>
          )}

          {currentPick && (
            <div className="rounded-lg border border-[#1E2D45] bg-[#162032] p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                {t.demo.draftPick} {currentPick.pickNumber}/8
              </p>
              <p className="mt-2 text-sm text-[#E5E7EB]">
                <span className="font-bold text-[#F59E0B]">{currentPick.name}</span>
                {" → "}
                <span className="font-semibold">{currentPick.side === "ALPHA" ? "Alpha" : "Bravo"}</span>
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleAdvanceDraft}
            className="w-full rounded-lg bg-[#F59E0B] px-4 py-2.5 text-sm font-bold text-[#0B0B0B]"
          >
            {match.draftRevealStep === 0 ? t.demo.startDraft : t.demo.nextDraftPick}
          </button>
        </div>
      )}

      {(match.status === "LIVE" || match.status === "SUBMITTED" || match.status === "CONFIRMED") && (
        <div className="mb-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-[rgba(245,158,11,.25)] bg-[#162032] p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">Alpha</p>
            <ul className="space-y-1 text-xs text-[#E5E7EB]">
              {alphaRoster.map((p) => (
                <li key={p.playerId}>
                  {p.name}
                  {p.playerId === match.captainAlpha && (
                    <span className="ml-1 text-[#F59E0B]">({t.demo.captain})</span>
                  )}
                  {p.playerId === playerId && (
                    <span className="ml-1 text-[#F59E0B]">({t.demo.you})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-[#1E2D45] bg-[#162032] p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Bravo</p>
            <ul className="space-y-1 text-xs text-[#E5E7EB]">
              {bravoRoster.map((p) => (
                <li key={p.playerId}>
                  {p.name}
                  {p.playerId === match.captainBravo && (
                    <span className="ml-1 text-[#9CA3AF]">({t.demo.captain})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {match.status === "LIVE" && isCaptain && (
        <p className="mb-2 text-xs text-[#F59E0B]">
          {isAlphaCaptain ? t.demo.youAreAlphaCaptain : t.demo.youAreBravoCaptain}
        </p>
      )}

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
            className="w-16 rounded-lg border border-[rgba(245,158,11,.35)] bg-[#0B1628] px-2 py-2 text-center text-sm"
            aria-label="Alpha score"
          />
          <span className="text-[#6B7280]">:</span>
          <input
            type="number"
            min={0}
            max={16}
            value={bravoScore}
            onChange={(e) => setBravoScore(e.target.value)}
            className="w-16 rounded-lg border border-[rgba(245,158,11,.35)] bg-[#0B1628] px-2 py-2 text-center text-sm"
            aria-label="Bravo score"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {canSubmit && (
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-[#F59E0B] px-4 py-2 text-sm font-bold text-[#0B0B0B]"
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
            className="rounded-lg border border-[rgba(245,158,11,.35)] bg-[rgba(245,158,11,.08)] px-4 py-2 text-sm font-semibold text-[#F59E0B]"
          >
            {t.demo.simulateConfirm}
          </button>
        )}
      </div>

      {confirmedToast != null && (
        <p className="mt-3 rounded-lg border border-[rgba(34,197,94,.35)] bg-[rgba(34,197,94,.08)] px-3 py-2 text-center text-sm font-semibold text-[#22C55E]">
          {confirmedToast >= 0 ? "+" : ""}
          {confirmedToast} ELO — {t.demo.matchComplete}
        </p>
      )}

      {error && <p className="mt-2 text-xs text-[#EF4444]">{error}</p>}
    </Card>
  );
}

export function DemoMatchFlow() {
  const demo = useDemoOptional();
  if (!demo) return null;

  const active = demo.matches.find(
    (m) => m.status === "DRAFT" || m.status === "LIVE" || m.status === "SUBMITTED",
  );
  if (!active) return null;

  return <DemoMatchFlowPanel match={active} />;
}
