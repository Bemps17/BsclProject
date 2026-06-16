import { describe, expect, it } from "vitest";
import { PUG_QUEUE_SIZE } from "@/lib/match";
import { assignPugTeams, teamAverageElo } from "@/lib/team-balance";

function mockPlayers(elos: number[]) {
  return elos.map((elo, i) => ({
    id: `p${i + 1}`,
    elo,
    displayName: `Player ${i + 1}`,
  }));
}

describe("assignPugTeams", () => {
  it("assigns top two ELO as captains with five per team", () => {
    const players = mockPlayers([1200, 1100, 1050, 1040, 1030, 1020, 1010, 1000, 990, 980]);
    const result = assignPugTeams(players);

    expect(result.captainAlpha).toBe("p1");
    expect(result.captainBravo).toBe("p2");
    expect(result.alphaIds).toHaveLength(5);
    expect(result.bravoIds).toHaveLength(5);
    expect(new Set([...result.alphaIds, ...result.bravoIds]).size).toBe(PUG_QUEUE_SIZE);
    expect(result.draftOrder).toHaveLength(8);
  });

  it("throws when player count is not 10", () => {
    expect(() => assignPugTeams(mockPlayers([1000, 1000]))).toThrow(/Expected 10 players/);
  });
});

describe("teamAverageElo", () => {
  it("returns rounded average", () => {
    expect(teamAverageElo([{ elo: 1000 }, { elo: 1100 }])).toBe(1050);
  });
});
