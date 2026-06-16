import { PlayClient } from "@/app/(platform)/play/play-client";
import { getLiveMatches, getPlatformStats } from "@/lib/data";

export default async function PlayPage() {
  const [stats, liveMatches] = await Promise.all([getPlatformStats(), getLiveMatches(10)]);

  const initialMatches = liveMatches.map((m) => {
    const alpha = m.teams.find((t) => t.side === "ALPHA");
    const bravo = m.teams.find((t) => t.side === "BRAVO");
    return {
      id: `#${String(m.number).padStart(3, "0")}`,
      alpha: alpha?.name ?? "—",
      bravo: bravo?.name ?? "—",
      status: m.status,
    };
  });

  return (
    <PlayClient
      initialStats={{
        liveMatches: stats.liveMatches,
        todayMatches: stats.todayMatches,
      }}
      initialMatches={initialMatches}
    />
  );
}
