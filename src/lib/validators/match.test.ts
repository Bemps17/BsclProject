import { describe, expect, it } from "vitest";
import { matchIdSchema, matchScoreSchema } from "./match";

describe("matchScoreSchema", () => {
  it("accepts valid winning scores", () => {
    expect(matchScoreSchema.parse({ alphaScore: 13, bravoScore: 7 })).toEqual({
      alphaScore: 13,
      bravoScore: 7,
    });
  });

  it("rejects tied scores", () => {
    expect(() => matchScoreSchema.parse({ alphaScore: 10, bravoScore: 10 })).toThrow();
  });

  it("rejects negative or oversized scores", () => {
    expect(() => matchScoreSchema.parse({ alphaScore: -1, bravoScore: 5 })).toThrow();
    expect(() => matchScoreSchema.parse({ alphaScore: 5, bravoScore: 17 })).toThrow();
  });

  it("rejects non-integers", () => {
    expect(() => matchScoreSchema.parse({ alphaScore: 13.5, bravoScore: 7 })).toThrow();
  });
});

describe("matchIdSchema", () => {
  it("accepts alphanumeric ids", () => {
    expect(matchIdSchema.parse("M-038")).toBe("M-038");
    expect(matchIdSchema.parse("match_41")).toBe("match_41");
  });

  it("rejects empty or unsafe ids", () => {
    expect(() => matchIdSchema.parse("")).toThrow();
    expect(() => matchIdSchema.parse("match id")).toThrow();
    expect(() => matchIdSchema.parse("../../../etc")).toThrow();
  });
});
