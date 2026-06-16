import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MatchLifecycleError,
  confirmMatchResult,
  submitMatchResult,
} from "@/lib/match-lifecycle";

const mockTransaction = vi.fn();
const mockMatchFindUnique = vi.fn();
const mockMatchUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    match: {
      findUnique: (...args: unknown[]) => mockMatchFindUnique(...args),
      update: (...args: unknown[]) => mockMatchUpdate(...args),
    },
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

describe("submitMatchResult", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects non-captains", async () => {
    mockMatchFindUnique.mockResolvedValue({
      id: "m1",
      status: "LIVE",
      captainAlpha: "cap-a",
      captainBravo: "cap-b",
    });

    await expect(
      submitMatchResult("m1", "other", { alphaScore: 8, bravoScore: 5 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("submits scores for live match", async () => {
    mockMatchFindUnique.mockResolvedValue({
      id: "m1",
      status: "LIVE",
      captainAlpha: "cap-a",
      captainBravo: "cap-b",
    });
    mockMatchUpdate.mockResolvedValue({
      id: "m1",
      number: 1,
      status: "SUBMITTED",
      alphaScore: 8,
      bravoScore: 5,
    });

    const match = await submitMatchResult("m1", "cap-a", { alphaScore: 8, bravoScore: 5 });
    expect(match.status).toBe("SUBMITTED");
    expect(mockMatchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          alphaScore: 8,
          bravoScore: 5,
          submittedBy: "cap-a",
        }),
      }),
    );
  });
});

describe("confirmMatchResult", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns alreadyConfirmed without re-applying ELO", async () => {
    mockMatchFindUnique.mockResolvedValue({
      id: "m1",
      status: "CONFIRMED",
      submittedBy: "cap-a",
      captainAlpha: "cap-a",
      captainBravo: "cap-b",
      players: [],
    });

    const result = await confirmMatchResult("m1", "cap-b");
    expect(result.alreadyConfirmed).toBe(true);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("rejects confirm from submitting captain", async () => {
    mockMatchFindUnique.mockResolvedValue({
      id: "m1",
      status: "SUBMITTED",
      submittedBy: "cap-a",
      captainAlpha: "cap-a",
      captainBravo: "cap-b",
      alphaScore: 8,
      bravoScore: 5,
      players: [],
    });

    await expect(confirmMatchResult("m1", "cap-a")).rejects.toBeInstanceOf(MatchLifecycleError);
  });
});
