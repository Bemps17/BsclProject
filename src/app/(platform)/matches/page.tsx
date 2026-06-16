import { Card, EmptyState, Tag } from "@/components/bscl/ui";
import { formatMatchScore, getActiveSeason, getMatches, matchStatusVariant } from "@/lib/data";

export default async function MatchesPage() {
  const [matches, season] = await Promise.all([getMatches(50), getActiveSeason()]);
  const seasonLabel = season ? `S${season.number}` : "S1";

  return (
    <Card>
      <h2 className="mb-3.5 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">
        Match History <span className="text-[#0066FF]">· {seasonLabel}</span>
      </h2>
      {matches.length === 0 ? (
        <EmptyState message="No matches recorded yet." />
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#1E2D45] text-left text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
              <th className="px-2.5 py-2">ID</th>
              <th className="px-2.5 py-2">Alpha</th>
              <th className="px-2.5 py-2">Score</th>
              <th className="px-2.5 py-2">Bravo</th>
              <th className="px-2.5 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => {
              const alpha = m.teams.find((t) => t.side === "ALPHA");
              const bravo = m.teams.find((t) => t.side === "BRAVO");
              const score =
                m.status === "LIVE"
                  ? "LIVE"
                  : formatMatchScore(m.alphaScore, m.bravoScore);
              const alphaWon =
                m.alphaScore != null && m.bravoScore != null && m.alphaScore > m.bravoScore;

              return (
                <tr key={m.id}>
                  <td className="border-b border-[#1E2D45] px-2.5 py-2.5 font-[family-name:var(--font-jetbrains)] text-[11px] text-[#6B7280]">
                    #{String(m.number).padStart(3, "0")}
                  </td>
                  <td className="border-b border-[#1E2D45] px-2.5 py-2.5">{alpha?.name ?? "—"}</td>
                  <td
                    className={`border-b border-[#1E2D45] px-2.5 py-2.5 font-[family-name:var(--font-jetbrains)] font-bold ${
                      m.status === "CONFIRMED"
                        ? alphaWon
                          ? "text-[#22C55E]"
                          : "text-[#EF4444]"
                        : ""
                    }`}
                  >
                    {score}
                  </td>
                  <td className="border-b border-[#1E2D45] px-2.5 py-2.5">{bravo?.name ?? "—"}</td>
                  <td className="border-b border-[#1E2D45] px-2.5 py-2.5">
                    <Tag variant={matchStatusVariant(m.status)}>{m.status}</Tag>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
}
