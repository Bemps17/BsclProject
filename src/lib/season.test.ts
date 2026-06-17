import { describe, expect, it } from "vitest";
import { computeSeasonDaysLeft } from "./season";

describe("computeSeasonDaysLeft", () => {
  it("returns zero when season already ended", () => {
    const endsAt = new Date("2026-06-01T00:00:00.000Z");
    const reference = new Date("2026-06-16T00:00:00.000Z");
    expect(computeSeasonDaysLeft(endsAt, reference)).toBe(0);
  });

  it("rounds up partial days", () => {
    const reference = new Date("2026-06-16T00:00:00.000Z");
    const endsAt = new Date("2026-06-18T12:00:00.000Z");
    expect(computeSeasonDaysLeft(endsAt, reference)).toBe(3);
  });
});
