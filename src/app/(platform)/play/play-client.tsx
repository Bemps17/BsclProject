"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MatchStatus } from "@/generated/prisma/client";
import { DemoMatchFlow } from "@/components/bscl/demo-match-flow";
import { useDemoOptional } from "@/components/bscl/demo-provider";
import { useT } from "@/components/bscl/locale-provider";
import { Card, CardHeader, EmptyState, StatCell, TableScroll, Tag } from "@/components/bscl/ui";
import { matchStatusVariant } from "@/lib/match-display";
import type { Translations } from "@/lib/i18n";
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
      const res = await fetch("/api/queue");
      if (!res.ok) return;
      const data = (await res.json()) as QueueState;
      setQueue(data);
    } catch {
      /* ignore polling errors */
    }
  }, [isDemo, syncDemoQueue]);

  useEffect(() => {
    fetchQueue();
    if (isDemo) return;
    const timer = setInterval(fetchQueue, 3000);
    return () => clearInterval(timer);
  }, [fetchQueue, isDemo]);

  useEffect(() => {
    if (isDemo) syncDemoQueue();
  }, [isDemo, syncDemoQueue, demo?.state]);

  const pct = (queue.count / SLOT_COUNT) * 100;
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => queue.players[i] ?? null);

  async function toggleQueue() {
    setLoading(true);
    setError(null);
    try {
      if (isDemo) {
        if (!demo?.player) {
          router.push("/login");
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
        const res = await fetch("/api/queue", { method: "DELETE" });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          setError(body.error ?? t.play.failLeave);
          return;
        }
        setInQueue(false);
      } else {
        const res = await fetch("/api/queue", { method: "POST" });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          setError(body.error ?? t.play.failJoin);
          return;
        }
        setInQueue(true);
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
      router.push("/login");
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

      <div className="rounded-xl border border-[#1E2D45] bg-[#162032] p-4 md:p-5">
        <div className="mb-3.5 flex items-start justify-between gap-2.5">
          <div>
            <h2 className="font-[family-name:var(--font-rajdhani)] text-lg font-bold">{t.play.pugTitle}</h2>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              {queue.count} / {SLOT_COUNT} ·{" "}
              {queue.count < SLOT_COUNT ? t.play.filling : t.play.readyDraft}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleQueue}
            disabled={loading}
            className={
              queueActive
                ? "rounded-lg border border-[#1E2D45] bg-[#162032] px-4 py-2 text-[13px] font-semibold disabled:opacity-50"
                : isDemo
                  ? "rounded-lg bg-[#F59E0B] px-4 py-2 text-[13px] font-bold text-[#0B0B0B] shadow-[0_0_14px_rgba(245,158,11,.28)] disabled:opacity-50"
                  : "rounded-lg bg-[#0066FF] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_0_14px_rgba(0,102,255,.28)] disabled:opacity-50"
            }
          >
            {loading ? "…" : queueActive ? t.play.leave : t.play.join}
          </button>
        </div>

        {isDemo && queue.count < SLOT_COUNT && (
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={handleFillBots}
              disabled={!demo?.player}
              className="rounded-lg border border-[rgba(245,158,11,.35)] bg-[rgba(245,158,11,.08)] px-3 py-1.5 text-xs font-semibold text-[#F59E0B] disabled:opacity-50"
            >
              {t.play.fillBots}
            </button>
          </div>
        )}

        {error && <p className="mb-3 text-center text-xs text-[#EF4444]">{error}</p>}

        <div className="mb-3">
          <div className="mb-1.5 flex justify-between text-[11px] text-[#6B7280]">
            <span>
              {queue.count}/{SLOT_COUNT}
            </span>
            <span className={cn("font-semibold", isDemo ? "text-[#F59E0B]" : "text-[#0066FF]")}>5v5 PUG</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#1E2D45]">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-400",
                isDemo
                  ? "bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,.35)]"
                  : "bg-[#0066FF] shadow-[0_0_8px_rgba(0,102,255,.28)]",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mb-3.5 grid grid-cols-5 gap-1.5">
          {slots.map((player, i) =>
            player ? (
              <div
                key={player.id}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border",
                  isDemo
                    ? "border-[#F59E0B] bg-[rgba(245,158,11,.12)]"
                    : "border-[#0066FF] bg-[rgba(0,102,255,.1)]",
                )}
              >
                <div
                  className={cn(
                    "flex h-[26px] w-[26px] items-center justify-center rounded-full font-[family-name:var(--font-rajdhani)] text-[10px] font-bold",
                    isDemo ? "bg-[#F59E0B] text-[#0B0B0B]" : "bg-[#0066FF]",
                  )}
                >
                  {player.initials}
                </div>
                <span className="max-w-full truncate px-0.5 text-[9px]">{player.name}</span>
              </div>
            ) : (
              <div
                key={`empty-${i}`}
                className="flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-[#1E2D45] text-[9px] text-[#6B7280]"
              >
                <span className="text-base opacity-30">+</span>
              </div>
            ),
          )}
        </div>

        <p className="text-center text-[11px] leading-relaxed text-[#6B7280]">
          {isDemo ? t.play.footerDemo : t.play.footerLive}
        </p>
      </div>

      <Card>
        <h2 className="mb-3.5 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">{t.play.howItWorks}</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {t.play.steps.map(([n, title, desc]) => (
            <div key={n} className="rounded-lg border border-[#1E2D45] bg-[#162032] p-3">
              <div
                className={cn(
                  "mb-0.5 font-[family-name:var(--font-rajdhani)] text-xs font-bold",
                  isDemo ? "text-[#F59E0B]" : "text-[#0066FF]",
                )}
              >
                {n}
              </div>
              <div className="mb-0.5 text-xs font-semibold">{title}</div>
              <div className="text-[11px] leading-snug text-[#6B7280]">{desc}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title={t.play.activeMatches}
          action={
            <Link href="/matches" className="rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-1.5 text-xs font-semibold">
              {t.common.all} →
            </Link>
          }
        />
        {liveMatches.length === 0 ? (
          <EmptyState message={t.play.noActiveMatches} />
        ) : (
          <TableScroll>
            <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#1E2D45] text-left text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                <th className="px-2.5 py-2">{t.matches.id}</th>
                <th className="px-2.5 py-2">{t.matches.alpha}</th>
                <th className="px-2.5 py-2">{t.matches.bravo}</th>
                <th className="px-2.5 py-2">{t.matches.status}</th>
              </tr>
            </thead>
            <tbody>
              {liveMatches.map((m) => (
                <tr key={m.id}>
                  <td className="border-b border-[#1E2D45] px-2.5 py-2.5 font-[family-name:var(--font-jetbrains)] text-[11px] text-[#6B7280]">{m.id}</td>
                  <td className="border-b border-[#1E2D45] px-2.5 py-2.5 text-[13px]">{m.alpha}</td>
                  <td className="border-b border-[#1E2D45] px-2.5 py-2.5 text-[13px]">{m.bravo}</td>
                  <td className="border-b border-[#1E2D45] px-2.5 py-2.5">
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
