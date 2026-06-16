"use client";

import { Card, EmptyState, Tag } from "@/components/bscl/ui";
import { useT } from "@/components/bscl/locale-provider";
import { matchStatusVariant } from "@/lib/match-display";
import type { MatchStatus } from "@/generated/prisma/client";
import type { Translations } from "@/lib/i18n";

type MatchRow = {
  id: string;
  number: number;
  alphaName: string;
  bravoName: string;
  alphaScore: number | null;
  bravoScore: number | null;
  status: MatchStatus;
  scoreLabel: string;
  alphaWon: boolean;
};

function statusLabel(t: Translations, status: MatchStatus): string {
  return t.matchStatus[status] ?? status;
}

export function MatchesClient({
  matches,
  seasonLabel,
}: {
  matches: MatchRow[];
  seasonLabel: string;
}) {
  const t = useT();

  return (
    <Card>
      <h2 className="mb-3.5 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">
        {t.matches.title} <span className="text-[#0066FF]">· {seasonLabel}</span>
      </h2>
      {matches.length === 0 ? (
        <EmptyState message={t.matches.empty} />
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#1E2D45] text-left text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
              <th className="px-2.5 py-2">{t.matches.id}</th>
              <th className="px-2.5 py-2">{t.matches.alpha}</th>
              <th className="px-2.5 py-2">{t.matches.score}</th>
              <th className="px-2.5 py-2">{t.matches.bravo}</th>
              <th className="px-2.5 py-2">{t.matches.status}</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id}>
                <td className="border-b border-[#1E2D45] px-2.5 py-2.5 font-[family-name:var(--font-jetbrains)] text-[11px] text-[#6B7280]">
                  #{String(m.number).padStart(3, "0")}
                </td>
                <td className="border-b border-[#1E2D45] px-2.5 py-2.5">{m.alphaName}</td>
                <td
                  className={`border-b border-[#1E2D45] px-2.5 py-2.5 font-[family-name:var(--font-jetbrains)] font-bold ${
                    m.status === "CONFIRMED"
                      ? m.alphaWon
                        ? "text-[#22C55E]"
                        : "text-[#EF4444]"
                      : ""
                  }`}
                >
                  {m.status === "LIVE" ? t.matchStatus.LIVE : m.scoreLabel}
                </td>
                <td className="border-b border-[#1E2D45] px-2.5 py-2.5">{m.bravoName}</td>
                <td className="border-b border-[#1E2D45] px-2.5 py-2.5">
                  <Tag variant={matchStatusVariant(m.status)}>{statusLabel(t, m.status)}</Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
