import { describe, expect, it } from "vitest";
import { PUG_QUEUE_SIZE, queueSnapshot } from "./queue";

describe("bot queueSnapshot", () => {
  it("matches web queue semantics", () => {
    expect(queueSnapshot(0)).toEqual({ count: 0, needed: 10, ready: false });
    expect(queueSnapshot(3)).toEqual({ count: 3, needed: 7, ready: false });
    expect(queueSnapshot(PUG_QUEUE_SIZE)).toEqual({ count: 10, needed: 0, ready: true });
  });
});
