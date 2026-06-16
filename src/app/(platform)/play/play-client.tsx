"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MatchStatus } from "@/generated/prisma/client";
import { useDemoOptional } from "@/components/bscl/demo-provider";
import { Card, CardHeader, EmptyState, StatCell, Tag } from "@/components/bscl/ui";
import { matchStatusVariant } from "@/lib/match-display";

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

export function PlayClient({
  initialStats,
  initialMatches,
}: {
  initialStats: { liveMatches: number; todayMatches: number };
  initialMatches: LiveMatch[];
}) {
  const router = useRouter();
  const demo = useDemoOptional();
  const isDemo = Boolean(demo);

  const [queue, setQueue] = useState<QueueState>({ count: 0, needed: 10, players: [] });
  const [inQueue, setInQueue] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveMatches] = useState(initialMatches);

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
          setError(body.error ?? "Failed to leave queue");
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
          setError(body.error ?? "Failed to join queue");
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

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label="In Queue" value={queue.count} sub={`${queue.needed} needed`} />
        <StatCell label="Avg Wait" value={<>—</>} sub={isDemo ? "Demo mode" : "Collecting data"} />
        <StatCell label="Live" value={initialStats.liveMatches} sub="matches" />
        <StatCell label="Today" value={initialStats.todayMatches} sub="matches" />
      </div>

      <div className="rounded-xl border border-[#1E2D45] bg-[#162032] p-4 md:p-5">
        <div className="mb-3.5 flex items-start justify-between gap-2.5">
          <div>
            <h2 className="font-[family-name:var(--font-rajdhani)] text-lg font-bold">PUG Queue — 5v5</h2>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              {queue.count} / {SLOT_COUNT} players ·{" "}
              {queue.count < SLOT_COUNT ? "Filling…" : "Ready for draft!"}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleQueue}
            disabled={loading}
            className={
              queueActive
                ? "rounded-lg border border-[#1E2D45] bg-[#162032] px-4 py-2 text-[13px] font-semibold disabled:opacity-50"
                : "rounded-lg bg-[#0066FF] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_0_14px_rgba(0,102,255,.28)] disabled:opacity-50"
            }
          >
            {loading ? "…" : queueActive ? "Leave" : "Join"}
          </button>
        </div>

        {error && <p className="mb-3 text-center text-xs text-[#EF4444]">{error}</p>}

        <div className="mb-3">
          <div className="mb-1.5 flex justify-between text-[11px] text-[#6B7280]">
            <span>{queue.count}/{SLOT_COUNT}</span>
            <span className="font-semibold text-[#0066FF]">5v5 PUG</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#1E2D45]">
            <div
              className="h-full rounded-full bg-[#0066FF] shadow-[0_0_8px_rgba(0,102,255,.28)] transition-all duration-400"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mb-3.5 grid grid-cols-5 gap-1.5">
          {slots.map((player, i) =>
            player ? (
              <div
                key={player.id}
                className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border border-[#0066FF] bg-[rgba(0,102,255,.1)]"
              >
                <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#0066FF] font-[family-name:var(--font-rajdhani)] text-[10px] font-bold">
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
          {isDemo
            ? "Demo queue — stored in your browser. Sign in as guest first."
            : "10 players needed · Captains auto-selected · Snake draft via Discord bot"}
        </p>
      </div>

      <Card>
        <h2 className="mb-3.5 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">How it works</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            ["01 · Join", "Queue Up", "Click Join. Bot adds you to the 5v5 pool."],
            ["02 · Draft", "Pick Teams", "Two captains run a snake draft for 8 picks."],
            ["03 · Play", "Game On", "Play your match. Captain submits score."],
            ["04 · ELO", "Update", "Opposing cap confirms. ELO auto-updates."],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-lg border border-[#1E2D45] bg-[#162032] p-3">
              <div className="mb-0.5 font-[family-name:var(--font-rajdhani)] text-xs font-bold text-[#0066FF]">{n}</div>
              <div className="mb-0.5 text-xs font-semibold">{t}</div>
              <div className="text-[11px] leading-snug text-[#6B7280]">{d}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Active Matches"
          action={
            <Link href="/matches" className="rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-1.5 text-xs font-semibold">
              All →
            </Link>
          }
        />
        {liveMatches.length === 0 ? (
          <EmptyState message="No active matches right now." />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#1E2D45] text-left text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                <th className="px-2.5 py-2">ID</th>
                <th className="px-2.5 py-2">Alpha</th>
                <th className="px-2.5 py-2">Bravo</th>
                <th className="px-2.5 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {liveMatches.map((m) => (
                <tr key={m.id}>
                  <td className="border-b border-[#1E2D45] px-2.5 py-2.5 font-[family-name:var(--font-jetbrains)] text-[11px] text-[#6B7280]">{m.id}</td>
                  <td className="border-b border-[#1E2D45] px-2.5 py-2.5 text-[13px]">{m.alpha}</td>
                  <td className="border-b border-[#1E2D45] px-2.5 py-2.5 text-[13px]">{m.bravo}</td>
                  <td className="border-b border-[#1E2D45] px-2.5 py-2.5">
                    <Tag variant={matchStatusVariant(m.status as MatchStatus)}>{m.status}</Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
