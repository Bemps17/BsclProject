import { describe, expect, it } from "vitest";
import {
  LOCAL_BOT_POOL,
  confirmLocalMatch,
  createMatchFromQueue,
  submitLocalScores,
} from "./local-matchmaker";

describe("local-matchmaker", () => {
  it("creates a 5v5 match from 10 queue entries", () => {
    const queue = [
      { id: "p1", name: "Player1" },
      ...LOCAL_BOT_POOL.slice(0, 9).map((b) => ({ id: b.id, name: b.name })),
    ];
    const match = createMatchFromQueue(queue, 1, { id: "p1", elo: 1000 });
    expect(match).not.toBeNull();
    expect(match!.players).toHaveLength(10);
    expect(match!.alphaIds).toHaveLength(5);
    expect(match!.bravoIds).toHaveLength(5);
  });

  it("runs submit → confirm and updates local player ELO", () => {
    const queue = [
      { id: "p1", name: "Player1" },
      ...LOCAL_BOT_POOL.slice(0, 9).map((b) => ({ id: b.id, name: b.name })),
    ];
    const match = createMatchFromQueue(queue, 1, { id: "p1", elo: 1000 })!;
    const captainId = match.captainAlpha;
    const submitted = submitLocalScores(match, captainId, 13, 7);
    expect(submitted.status).toBe("SUBMITTED");

    const confirmerId =
      captainId === match.captainAlpha ? match.captainBravo : match.captainAlpha;
    const { playerUpdate } = confirmLocalMatch(submitted, confirmerId, {
      id: "p1",
      elo: 1000,
      wins: 0,
      losses: 0,
      peakElo: 1000,
    });

    if (match.players.some((p) => p.playerId === "p1")) {
      expect(playerUpdate).not.toBeNull();
      expect(playerUpdate!.wins + playerUpdate!.losses).toBe(1);
    }
  });
});
