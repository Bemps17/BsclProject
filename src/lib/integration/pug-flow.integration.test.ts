import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmMatchResult, submitMatchResult } from "@/lib/match-lifecycle";
import { joinQueue } from "@/lib/queue-service";

const mockProcessQueueMatchmaking = vi.fn();
const mockQueueCreate = vi.fn();
const mockQueueFindFirst = vi.fn();
const mockQueueCount = vi.fn();
const mockMatchFindUnique = vi.fn();
const mockMatchUpdate = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/matchmaker", () => ({
  processQueueMatchmaking: (...args: unknown[]) => mockProcessQueueMatchmaking(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    queueEntry: {
      findFirst: (...args: unknown[]) => mockQueueFindFirst(...args),
      create: (...args: unknown[]) => mockQueueCreate(...args),
      count: (...args: unknown[]) => mockQueueCount(...args),
      updateMany: vi.fn(),
      findMany: vi.fn(async () => []),
    },
    match: {
      findUnique: (...args: unknown[]) => mockMatchFindUnique(...args),
      update: (...args: unknown[]) => mockMatchUpdate(...args),
    },
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

/**
 * Phase 7e — integration-style flow: queue join triggers matchmaker,
 * submit → confirm → idempotent second confirm.
 */
describe("PUG flow integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueueFindFirst.mockResolvedValue(null);
    mockQueueCreate.mockImplementation(async ({ data }: { data: { playerId: string } }) => ({
      id: `entry-${data.playerId}`,
      playerId: data.playerId,
    }));
    mockProcessQueueMatchmaking.mockResolvedValue([{ matchId: "m1", matchNumber: 42 }]);
  });

  it("joins queue and drains matchmaker when 10 players are waiting", async () => {
    mockQueueCount.mockResolvedValueOnce(10).mockResolvedValueOnce(0);

    const result = await joinQueue("player-10");

    expect(result.matchesCreated).toEqual([{ matchId: "m1", matchNumber: 42 }]);
    expect(mockProcessQueueMatchmaking).toHaveBeenCalledTimes(1);
    expect(result.count).toBe(0);
  });

  it("submit → confirm → second confirm stays idempotent", async () => {
    mockMatchFindUnique
      .mockResolvedValueOnce({
        id: "m1",
        status: "LIVE",
        captainAlpha: "cap-a",
        captainBravo: "cap-b",
      })
      .mockResolvedValueOnce({
        id: "m1",
        status: "CONFIRMED",
        submittedBy: "cap-a",
        captainAlpha: "cap-a",
        captainBravo: "cap-b",
        players: [],
      });

    mockMatchUpdate.mockResolvedValue({
      id: "m1",
      number: 42,
      status: "SUBMITTED",
      alphaScore: 13,
      bravoScore: 7,
    });

    const submitted = await submitMatchResult("m1", "cap-a", { alphaScore: 13, bravoScore: 7 });
    expect(submitted.status).toBe("SUBMITTED");

    const confirmed = await confirmMatchResult("m1", "cap-b");
    expect(confirmed.alreadyConfirmed).toBe(true);
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
