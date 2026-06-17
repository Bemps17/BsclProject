"use client";

import { useState } from "react";
import { useDemoOptional } from "@/components/bscl/demo-provider";
import { useT } from "@/components/bscl/locale-provider";
import {
  Button,
  Card,
  CardHeader,
  Input,
  Tag,
} from "@/components/bscl/ui";
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

  function handleDispute() {
    setError(null);
    try {
      demo!.disputeMatch(match.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.demo.actionFailed);
    }
  }

  const canDispute =
    (match.status === "SUBMITTED" || match.status === "LIVE") && isCaptain;
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
    <Card className="border-primary/35 bg-primary/5">
      <CardHeader
        title={`${t.demo.activeMatch} #${String(match.number).padStart(3, "0")}`}
        action={
          <Tag variant={matchStatusVariant(match.status as "DRAFT" | "LIVE" | "SUBMITTED" | "CONFIRMED")}>
            {statusLabel(t, match.status)}
          </Tag>
        }
      />

      {match.status === "DRAFT" && !draftDone && (
        <div className="mb-4 flex flex-col gap-3">
          {match.draftRevealStep === 0 && (
            <div className="rounded-lg border border-primary/30 bg-primary/8 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                {t.demo.captainSelection}
              </p>
              <p className="mb-3 text-xs text-muted-foreground">{t.demo.captainRule}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-primary/25 bg-secondary p-3">
                  <p className="text-[10px] font-bold uppercase text-primary">Alpha {t.demo.captain}</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {playerName(match, match.captainAlpha)}
                    {match.captainAlpha === playerId && (
                      <span className="ml-1 text-xs text-primary">({t.demo.you})</span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-secondary p-3">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Bravo {t.demo.captain}</p>
                  <p className="mt-1 font-semibold text-foreground">{playerName(match, match.captainBravo)}</p>
                </div>
              </div>
            </div>
          )}

          {currentPick && (
            <div className="rounded-lg border border-border bg-secondary p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t.demo.draftPick} {currentPick.pickNumber}/8
              </p>
              <p className="mt-2 text-sm text-foreground">
                <span className="font-bold text-primary">{currentPick.name}</span>
                {" → "}
                <span className="font-semibold">{currentPick.side === "ALPHA" ? "Alpha" : "Bravo"}</span>
              </p>
            </div>
          )}

          <Button type="button" onClick={handleAdvanceDraft} className="w-full">
            {match.draftRevealStep === 0 ? t.demo.startDraft : t.demo.nextDraftPick}
          </Button>
        </div>
      )}

      {(match.status === "LIVE" || match.status === "SUBMITTED" || match.status === "CONFIRMED") && (
        <div className="mb-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-primary/25 bg-secondary p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">Alpha</p>
            <ul className="flex flex-col gap-1 text-xs text-foreground">
              {alphaRoster.map((p) => (
                <li key={p.playerId}>
                  {p.name}
                  {p.playerId === match.captainAlpha && (
                    <span className="ml-1 text-primary">({t.demo.captain})</span>
                  )}
                  {p.playerId === playerId && (
                    <span className="ml-1 text-primary">({t.demo.you})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-secondary p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bravo</p>
            <ul className="flex flex-col gap-1 text-xs text-foreground">
              {bravoRoster.map((p) => (
                <li key={p.playerId}>
                  {p.name}
                  {p.playerId === match.captainBravo && (
                    <span className="ml-1 text-muted-foreground">({t.demo.captain})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {match.status === "LIVE" && isCaptain && (
        <p className="mb-2 text-xs text-primary">
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
          <Input
            type="number"
            min={0}
            max={16}
            value={alphaScore}
            onChange={(e) => setAlphaScore(e.target.value)}
            className="w-16 text-center"
            aria-label="Alpha score"
          />
          <span className="text-muted-foreground">:</span>
          <Input
            type="number"
            min={0}
            max={16}
            value={bravoScore}
            onChange={(e) => setBravoScore(e.target.value)}
            className="w-16 text-center"
            aria-label="Bravo score"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {canSubmit && (
          <Button type="button" onClick={handleSubmit}>
            {t.demo.submitScore}
          </Button>
        )}
        {canConfirm && (
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-chart-2 text-primary-foreground hover:bg-chart-2/90"
          >
            {t.demo.confirmScore}
          </Button>
        )}
        {match.status === "SUBMITTED" && !canConfirm && (
          <Button type="button" variant="outline" onClick={handleConfirm}>
            {t.demo.simulateConfirm}
          </Button>
        )}
        {canDispute && match.status !== "DISPUTED" && (
          <Button type="button" variant="destructive" onClick={handleDispute}>
            {t.demo.disputeScore}
          </Button>
        )}
      </div>

      {match.status === "DISPUTED" && (
        <p className="mt-3 rounded-lg border border-destructive/35 bg-destructive/8 px-3 py-2 text-center text-sm text-destructive">
          {t.demo.disputeOpened}
        </p>
      )}

      {confirmedToast != null && (
        <p className="mt-3 rounded-lg border border-chart-2/35 bg-chart-2/8 px-3 py-2 text-center text-sm font-semibold text-chart-2">
          {confirmedToast >= 0 ? "+" : ""}
          {confirmedToast} ELO — {t.demo.matchComplete}
        </p>
      )}

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
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
