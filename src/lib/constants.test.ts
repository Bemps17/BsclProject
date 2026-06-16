import { describe, expect, it } from "vitest";
import { DEMO_LEADERBOARD, NAV_ITEMS, RANK_LABELS, RANK_STYLES } from "./constants";

describe("rank constants", () => {
  it("defines styles and labels for every rank key", () => {
    const ranks = new Set(DEMO_LEADERBOARD.all.map((p) => p.rank));
    for (const rank of ranks) {
      expect(RANK_LABELS[rank]).toBeTruthy();
      expect(RANK_STYLES[rank]).toContain("border");
    }
  });
});

describe("navigation", () => {
  it("uses unique hrefs", () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("exposes mobile tab routes", () => {
    const mobileHrefs = NAV_ITEMS.filter((item) => item.mobile).map((item) => item.href);
    expect(mobileHrefs).toEqual(["/", "/play", "/rankings", "/teams", "/profile"]);
  });
});
