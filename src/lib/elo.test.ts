import { describe, expect, it } from "vitest";
import {
  K_FACTOR,
  PLACEMENT_MATCHES,
  RANK_THRESHOLDS,
  STARTING_ELO,
  calculateEloDelta,
  expectedScore,
  getRankFromElo,
  softResetElo,
} from "./elo";

describe("getRankFromElo", () => {
  it("maps thresholds to the correct tiers", () => {
    expect(getRankFromElo(0)).toBe("BRONZE");
    expect(getRankFromElo(999)).toBe("BRONZE");
    expect(getRankFromElo(1000)).toBe("SILVER");
    expect(getRankFromElo(1199)).toBe("SILVER");
    expect(getRankFromElo(1200)).toBe("GOLD");
    expect(getRankFromElo(1399)).toBe("GOLD");
    expect(getRankFromElo(1400)).toBe("PLATINUM");
    expect(getRankFromElo(1599)).toBe("PLATINUM");
    expect(getRankFromElo(1600)).toBe("DIAMOND");
    expect(getRankFromElo(1799)).toBe("DIAMOND");
    expect(getRankFromElo(1800)).toBe("ELITE");
    expect(getRankFromElo(2500)).toBe("ELITE");
  });
});

describe("expectedScore", () => {
  it("returns 0.5 for equal ratings", () => {
    expect(expectedScore(1000, 1000)).toBeCloseTo(0.5, 5);
  });

  it("favors the higher-rated player", () => {
    expect(expectedScore(1600, 1000)).toBeGreaterThan(0.5);
    expect(expectedScore(1000, 1600)).toBeLessThan(0.5);
  });
});

describe("calculateEloDelta", () => {
  it("awards positive delta when lower-rated player wins", () => {
    const delta = calculateEloDelta(1000, 1600, true);
    expect(delta).toBeGreaterThan(0);
  });

  it("applies negative delta when favorite loses", () => {
    const delta = calculateEloDelta(1600, 1000, false);
    expect(delta).toBeLessThan(0);
  });

  it("uses smaller losses under placement protection", () => {
    const normal = calculateEloDelta(1600, 1000, false, false);
    const protectedLoss = calculateEloDelta(1600, 1000, false, true);
    expect(protectedLoss).toBeGreaterThan(normal);
    expect(Math.abs(protectedLoss)).toBeLessThan(Math.abs(normal));
  });

  it("returns zero-sum symmetric magnitude for equal ratings", () => {
    const win = calculateEloDelta(1000, 1000, true);
    const loss = calculateEloDelta(1000, 1000, false);
    expect(win).toBe(K_FACTOR / 2);
    expect(loss).toBe(-K_FACTOR / 2);
  });
});

describe("softResetElo", () => {
  it("pulls ratings halfway back toward starting ELO", () => {
    expect(softResetElo(1400)).toBe(1200);
    expect(softResetElo(1600)).toBe(1300);
  });

  it("never drops below starting ELO", () => {
    expect(softResetElo(800)).toBe(STARTING_ELO);
  });

  it("keeps starting ELO unchanged", () => {
    expect(softResetElo(STARTING_ELO)).toBe(STARTING_ELO);
  });
});

describe("rank constants", () => {
  it("exposes placement match count from roadmap", () => {
    expect(PLACEMENT_MATCHES).toBe(5);
  });

  it("uses monotonic rank thresholds", () => {
    const tiers = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "ELITE"] as const;
    for (let i = 1; i < tiers.length; i += 1) {
      expect(RANK_THRESHOLDS[tiers[i]]).toBeGreaterThan(RANK_THRESHOLDS[tiers[i - 1]]);
    }
  });
});
