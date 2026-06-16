import { describe, expect, it } from "vitest";
import {
  canConfirmMatch,
  queueSnapshot,
  snakeDraftOrder,
  PUG_QUEUE_SIZE,
  PUG_TEAM_SIZE,
} from "./match";

describe("snakeDraftOrder", () => {
  it("returns empty array for non-positive pick counts", () => {
    expect(snakeDraftOrder(0)).toEqual([]);
    expect(snakeDraftOrder(-1)).toEqual([]);
  });

  it("follows BSCL snake pattern for 8 picks", () => {
    expect(snakeDraftOrder(8)).toEqual([
      "ALPHA",
      "BRAVO",
      "BRAVO",
      "ALPHA",
      "ALPHA",
      "BRAVO",
      "BRAVO",
      "ALPHA",
    ]);
  });

  it("alternates first pick by round", () => {
    expect(snakeDraftOrder(2)).toEqual(["ALPHA", "BRAVO"]);
    expect(snakeDraftOrder(4)).toEqual(["ALPHA", "BRAVO", "BRAVO", "ALPHA"]);
  });
});

describe("queueSnapshot", () => {
  it("reports needed players until queue is full", () => {
    expect(queueSnapshot(3)).toEqual({ count: 3, needed: 7, ready: false });
    expect(queueSnapshot(PUG_QUEUE_SIZE)).toEqual({
      count: 10,
      needed: 0,
      ready: true,
    });
  });

  it("never reports negative needed count", () => {
    expect(queueSnapshot(12).needed).toBe(0);
    expect(queueSnapshot(12).ready).toBe(true);
  });
});

describe("canConfirmMatch", () => {
  it("requires SUBMITTED status and different captains", () => {
    expect(canConfirmMatch("cap-a", "cap-b", "SUBMITTED")).toBe(true);
    expect(canConfirmMatch("cap-a", "cap-a", "SUBMITTED")).toBe(false);
    expect(canConfirmMatch("cap-a", "cap-b", "LIVE")).toBe(false);
  });
});

describe("pug constants", () => {
  it("uses 5v5 roster size", () => {
    expect(PUG_TEAM_SIZE).toBe(5);
    expect(PUG_QUEUE_SIZE).toBe(PUG_TEAM_SIZE * 2);
  });
});
