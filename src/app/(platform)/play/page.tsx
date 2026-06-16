"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, StatCell, Tag } from "@/components/bscl/ui";

const PLAYERS = [
  { i: "SK", n: "ShadowK1ng" },
  { i: "NC", n: "NightCrwlr" },
  { i: "SP", n: "Specter99" },
  { i: "XG", n: "xGhost_BR" },
  { i: "AR", n: "AcidReign" },
  { i: "FB", n: "FrostByte" },
  { i: "VR", n: "VoidRunner" },
  { i: "RE", n: "RazorEdge" },
  { i: "PX", n: "PhantomX" },
  { i: "ZD", n: "ZeroDawn" },
];

export default function PlayPage() {
  const [filled, setFilled] = useState<boolean[]>([
    true, true, true, false, false, false, false, false, false, false,
  ]);
  const [inQueue, setInQueue] = useState(false);

  const count = filled.filter(Boolean).length;
  const pct = (count / 10) * 100;

  const renderSlots = useCallback(() => filled, [filled]);

  useEffect(() => {
    if (!inQueue) return;
    let idx = 3;
    const timer = setInterval(() => {
      setFilled((prev) => {
        if (idx >= 10) {
          clearInterval(timer);
          return prev;
        }
        const next = [...prev];
        next[idx] = true;
        idx += 1;
        if (next.every(Boolean)) {
          clearInterval(timer);
          setTimeout(() => {
            alert(
              "🎮 10/10 — Draft starting!\n\nCaptain Alpha: ShadowK1ng\nCaptain Bravo: Specter99\n\nSnake draft via Discord bot…",
            );
            setFilled(Array(10).fill(false));
            setInQueue(false);
          }, 400);
        }
        return next;
      });
    }, 1100);
    return () => clearInterval(timer);
  }, [inQueue]);

  function toggleQueue() {
    if (!inQueue) {
      setInQueue(true);
      setFilled((prev) => {
        const next = [...prev];
        next[0] = true;
        return next;
      });
    } else {
      setInQueue(false);
      setFilled((prev) => {
        const next = [...prev];
        next[0] = false;
        return next;
      });
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label="In Queue" value={count} sub={`${10 - count} needed`} />
        <StatCell label="Avg Wait" value={<>4<span className="text-base">m</span></>} />
        <StatCell label="Live" value="2" sub="matches" />
        <StatCell label="Today" value="12" sub="matches" />
      </div>

      <div className="rounded-xl border border-[#1E2D45] bg-[#162032] p-4 md:p-5">
        <div className="mb-3.5 flex items-start justify-between gap-2.5">
          <div>
            <h2 className="font-[family-name:var(--font-rajdhani)] text-lg font-bold">PUG Queue — 5v5</h2>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              {count} / 10 players · {count < 10 ? "Filling…" : "Starting draft!"}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleQueue}
            className={
              inQueue
                ? "rounded-lg border border-[#1E2D45] bg-[#162032] px-4 py-2 text-[13px] font-semibold"
                : "rounded-lg bg-[#0066FF] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_0_14px_rgba(0,102,255,.28)]"
            }
          >
            {inQueue ? "Leave" : "Join"}
          </button>
        </div>

        <div className="mb-3">
          <div className="mb-1.5 flex justify-between text-[11px] text-[#6B7280]">
            <span>{count}/10</span>
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
          {renderSlots().map((on, i) => {
            const p = PLAYERS[i];
            return on ? (
              <div
                key={p.n}
                className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border border-[#0066FF] bg-[rgba(0,102,255,.1)]"
              >
                <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#0066FF] font-[family-name:var(--font-rajdhani)] text-[10px] font-bold">
                  {p.i}
                </div>
                <span className="max-w-full truncate px-0.5 text-[9px]">{p.n}</span>
              </div>
            ) : (
              <div
                key={`empty-${i}`}
                className="flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-[#1E2D45] text-[9px] text-[#6B7280]"
              >
                <span className="text-base opacity-30">+</span>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[11px] leading-relaxed text-[#6B7280]">
          10 players needed · Captains auto-selected · Snake draft via Discord bot
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
            {[
              ["#041", "ShadowK1ng+4", "Specter99+4", "Live", "green"],
              ["#040", "NightCrwlr+4", "AcidReign+4", "Live", "green"],
              ["#039", "FrostByte+4", "VoidRuner+4", "Pending", "gold"],
            ].map(([id, a, b, status, variant]) => (
              <tr key={id}>
                <td className="border-b border-[#1E2D45] px-2.5 py-2.5 font-[family-name:var(--font-jetbrains)] text-[11px] text-[#6B7280]">{id}</td>
                <td className="border-b border-[#1E2D45] px-2.5 py-2.5 text-[13px]">{a}</td>
                <td className="border-b border-[#1E2D45] px-2.5 py-2.5 text-[13px]">{b}</td>
                <td className="border-b border-[#1E2D45] px-2.5 py-2.5">
                  <Tag variant={variant as "green" | "gold"}>{status}</Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
