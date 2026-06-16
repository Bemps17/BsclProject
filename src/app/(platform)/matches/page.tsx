import { cookies } from "next/headers";
import { MatchesClient } from "@/app/(platform)/matches/matches-client";
import { MatchesDemo } from "@/app/(platform)/matches/matches-demo";
import { isDemoMode } from "@/lib/backend";
import { formatMatchScore, getActiveSeason, getMatches } from "@/lib/data";

export default async function MatchesPage() {
  const cookieStore = await cookies();
  if (isDemoMode(cookieStore.get("bscl_demo")?.value)) {
    return <MatchesDemo />;
  }

  const [matches, season] = await Promise.all([getMatches(50), getActiveSeason()]);
  const seasonLabel = season ? `S${season.number}` : "S1";

  return (
    <MatchesClient
      seasonLabel={seasonLabel}
      matches={matches.map((m) => {
        const alpha = m.teams.find((t) => t.side === "ALPHA");
        const bravo = m.teams.find((t) => t.side === "BRAVO");
        const alphaWon =
          m.alphaScore != null && m.bravoScore != null && m.alphaScore > m.bravoScore;
        const scoreLabel =
          m.status === "LIVE"
            ? "LIVE"
            : formatMatchScore(m.alphaScore, m.bravoScore);

        return {
          id: m.id,
          number: m.number,
          alphaName: alpha?.name ?? "—",
          bravoName: bravo?.name ?? "—",
          alphaScore: m.alphaScore,
          bravoScore: m.bravoScore,
          status: m.status,
          scoreLabel,
          alphaWon,
        };
      })}
    />
  );
}
