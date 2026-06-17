"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MatchStatus } from "@/generated/prisma/client";
import { DemoMatchFlow } from "@/components/bscl/demo-match-flow";
import { useDemoOptional } from "@/components/bscl/demo-provider";
import { useT } from "@/components/bscl/locale-provider";
import {
  Button,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  StatCell,
  TableScroll,
  Tag,
} from "@/components/bscl/ui";
import { matchStatusVariant } from "@/lib/match-display";
import type { Translations } from "@/lib/i18n";
import { ApiError, fetchJson } from "@/lib/fetch-client";
import { cn } from "@/lib/utils";

type QueuePlayer = {
  id: string;
  name: string;
  initials: string;
};

type QueueState = {
  count: number;
  needed: number;
  players: QueuePlayer[];
};

type LiveMatch = {
  id: string;
  alpha: string;
  bravo: string;
  status: string;
};

const SLOT_COUNT = 10;

function statusLabel(t: Translations, status: string): string {
  const key = status as keyof Translations["matchStatus"];
  return t.matchStatus[key] ?? status;
}

export function PlayClient({
  initialStats,
  initialMatches,
}: {
  initialStats: { liveMatches: number; todayMatches: number };
  initialMatches: LiveMatch[];
}) {
  const router = useRouter();
  const demo = useDemoOptional();
  const t = useT();
  const isDemo = Boolean(demo);

  const [queue, setQueue] = useState<QueueState>({ count: 0, needed: 10, players: [] });
  const [inQueue, setInQueue] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const liveMatches = isDemo
    ? (demo?.matches ?? [])
        .filter((m) => m.status === "DRAFT" || m.status === "LIVE" || m.status === "SUBMITTED")
        .map((m) => {
          const alphaName =
            m.players.find((p) => p.playerId === m.captainAlpha)?.name ?? "Alpha";
          const bravoName =
            m.players.find((p) => p.playerId === m.captainBravo)?.name ?? "Bravo";
          return {
            id: `#${String(m.number).padStart(3, "0")}`,
            alpha: alphaName,
            bravo: bravoName,
            status: m.status,
          };
        })
    : initialMatches;

  const syncDemoQueue = useCallback(() => {
    if (!demo) return;
    const snap = demo.queue;
    setQueue({ count: snap.count, needed: snap.needed, players: snap.players });
    setInQueue(demo.state.inQueue);
  }, [demo]);

  const fetchQueue = useCallback(async () => {
    if (isDemo) {
      syncDemoQueue();
      return;
    }
    try {
      const data = await fetchJson<QueueState>("/api/queue");
      setQueue(data);
    } catch {
      /* ignore polling errors */
    }
  }, [isDemo, syncDemoQueue]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (isDemo) {
        if (!cancelled) syncDemoQueue();
        return;
      }
      try {
        const data = await fetchJson<QueueState>("/api/queue");
        if (!cancelled) setQueue(data);
      } catch {
        /* ignore initial load errors */
      }
    })();

    if (isDemo) return;

    const timer = setInterval(() => {
      void fetchQueue();
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [fetchQueue, isDemo, syncDemoQueue, demo?.state.inQueue]);

  const pct = (queue.count / SLOT_COUNT) * 100;
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => queue.players[i] ?? null);

  async function toggleQueue() {
    setLoading(true);
    setError(null);
    try {
      if (isDemo) {
        if (!demo?.player) {
          router.push("/demo");
          return;
        }
        if (demo.state.inQueue) {
          demo.leaveQueue();
        } else {
          demo.joinQueue();
        }
        syncDemoQueue();
        return;
      }

      if (inQueue) {
        try {
          await fetchJson("/api/queue", { method: "DELETE" });
          setInQueue(false);
        } catch (err) {
          if (err instanceof ApiError && err.status === 401) {
            router.push("/login");
            return;
          }
          setError(err instanceof ApiError ? err.message : t.play.failLeave);
          await fetchQueue();
          return;
        }
      } else {
        try {
          await fetchJson("/api/queue", { method: "POST" });
          setInQueue(true);
        } catch (err) {
          if (err instanceof ApiError && err.status === 401) {
            router.push("/login");
            return;
          }
          setError(err instanceof ApiError ? err.message : t.play.failJoin);
          await fetchQueue();
          return;
        }
      }
      await fetchQueue();
    } finally {
      setLoading(false);
    }
  }

  const queueActive = isDemo ? demo?.state.inQueue ?? false : inQueue;
  const demoLiveCount = isDemo ? demo?.stats.liveMatches ?? 0 : initialStats.liveMatches;
  const demoTodayCount = isDemo ? demo?.stats.todayMatches ?? 0 : initialStats.todayMatches;

  function handleFillBots() {
    if (!demo?.player) {
      router.push("/demo");
      return;
    }
    setError(null);
    try {
      if (!demo.state.inQueue) {
        demo.joinQueue();
      }
      demo.fillBots();
      demo.startMatch();
      syncDemoQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.play.failJoin);
    }
  }

  return (
    <>
      {isDemo && <DemoMatchFlow />}
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell
          label={t.play.inQueue}
          value={queue.count}
          sub={`${queue.needed} ${t.common.needed}`}
        />
        <StatCell
          label={t.play.avgWait}
          value={<>—</>}
          sub={isDemo ? t.play.demoMode : t.play.collectingData}
        />
        <StatCell label={t.play.live} value={demoLiveCount} sub={t.common.matches} />
        <StatCell label={t.home.today} value={demoTodayCount} sub={t.common.matches} />
      </div>

      <div className="rounded-xl border border-border bg-secondary p-4 md:p-5">
        <div className="mb-3.5 flex items-start justify-between gap-2.5">
          <div>
            <h2 className="font-heading text-lg font-bold">{t.play.pugTitle}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {queue.count} / {SLOT_COUNT} ·{" "}
              {queue.count < SLOT_COUNT ? t.play.filling : t.play.readyDraft}
            </p>
          </div>
          <Button
            type="button"
            onClick={toggleQueue}
            disabled={loading}
            variant={queueActive ? "secondary" : "default"}
            className={cn(
              !queueActive && "shadow-[0_0_14px_color-mix(in_oklch,var(--primary),transparent_72%)]",
            )}
          >
            {loading ? "…" : queueActive ? t.play.leave : t.play.join}
          </Button>
        </div>

        {isDemo && queue.count < SLOT_COUNT && (
          <div className="mb-3 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillBots}
              disabled={!demo?.player}
            >
              {t.play.fillBots}
            </Button>
          </div>
        )}

        {error && (
          <p className="mb-3 text-center text-xs text-destructive" role="alert" aria-live="polite">
            {error}
          </p>
        )}

        <div className="mb-3">
          <div className="mb-1.5 flex justify-between text-[11px] text-muted-foreground">
            <span>
              {queue.count}/{SLOT_COUNT}
            </span>
            <span className="font-semibold text-primary">5v5 PUG</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-400 shadow-[0_0_8px_color-mix(in_oklch,var(--primary),transparent_65%)]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mb-3.5 grid grid-cols-5 gap-1.5">
          {slots.map((player, i) =>
            player ? (
              <div
                key={player.id}
                className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border border-primary bg-primary/12"
              >
                <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-primary font-heading text-[10px] font-bold text-primary-foreground">
                  {player.initials}
                </div>
                <span className="max-w-full truncate px-0.5 text-[9px]">{player.name}</span>
              </div>
            ) : (
              <div
                key={`empty-${i}`}
                className="flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-border text-[9px] text-muted-foreground"
              >
                <span className="text-base opacity-30">+</span>
              </div>
            ),
          )}
        </div>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          {isDemo ? t.play.footerDemo : t.play.footerLive}
        </p>
      </div>

      <Card>
        <h2 className="mb-3.5 font-heading text-[15px] font-bold">{t.play.howItWorks}</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {t.play.steps.map(([n, title, desc]) => (
            <div key={n} className="rounded-lg border border-border bg-secondary p-3">
              <div className="mb-0.5 font-heading text-xs font-bold text-primary">
                {n}
              </div>
              <div className="mb-0.5 text-xs font-semibold">{title}</div>
              <div className="text-[11px] leading-snug text-muted-foreground">{desc}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title={t.play.activeMatches}
          action={
            <ButtonLink href="/matches" variant="secondary" size="sm">
              {t.common.all} →
            </ButtonLink>
          }
        />
        {liveMatches.length === 0 ? (
          <EmptyState message={t.play.noActiveMatches} />
        ) : (
          <TableScroll>
            <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-2.5 py-2">{t.matches.id}</th>
                <th className="px-2.5 py-2">{t.matches.alpha}</th>
                <th className="px-2.5 py-2">{t.matches.bravo}</th>
                <th className="px-2.5 py-2">{t.matches.status}</th>
              </tr>
            </thead>
            <tbody>
              {liveMatches.map((m) => (
                <tr key={m.id}>
                  <td className="border-b border-border px-2.5 py-2.5 font-[family-name:var(--font-jetbrains)] text-[11px] text-muted-foreground">{m.id}</td>
                  <td className="border-b border-border px-2.5 py-2.5 text-[13px]">{m.alpha}</td>
                  <td className="border-b border-border px-2.5 py-2.5 text-[13px]">{m.bravo}</td>
                  <td className="border-b border-border px-2.5 py-2.5">
                    <Tag variant={matchStatusVariant(m.status as MatchStatus)}>
                      {statusLabel(t, m.status)}
                    </Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </TableScroll>
        )}
      </Card>
    </>
  );
}
