import { describe, expect, it } from "vitest";
import { NAV_ITEMS, RANK_LABELS, RANK_STYLES, type RankKey } from "./constants";

const ALL_RANKS: RankKey[] = ["bronze", "silver", "gold", "plat", "diamond", "elite"];

describe("rank constants", () => {
  it("defines styles and labels for every rank key", () => {
    for (const rank of ALL_RANKS) {
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
