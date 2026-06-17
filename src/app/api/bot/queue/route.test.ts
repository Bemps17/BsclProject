import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/bot/queue/route";

vi.mock("@/lib/backend", () => ({
  isBackendEnabled: vi.fn(() => true),
}));

vi.mock("@/lib/bot-auth", () => ({
  requireBotUser: vi.fn(),
  BotAuthError: class BotAuthError extends Error {
    code = "BOT_UNAUTHORIZED";
  },
}));

vi.mock("@/lib/queue-service", () => ({
  getQueueState: vi.fn(async () => ({ count: 2, needed: 8, players: [] })),
  joinQueue: vi.fn(async () => ({
    count: 3,
    ready: false,
    matchesCreated: [],
  })),
  leaveQueue: vi.fn(async () => ({ count: 1 })),
}));

import { requireBotUser } from "@/lib/bot-auth";
import { getQueueState, joinQueue } from "@/lib/queue-service";

const mockRequireBotUser = vi.mocked(requireBotUser);

describe("GET /api/bot/queue", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns queue snapshot for authenticated bot request", async () => {
    mockRequireBotUser.mockResolvedValue({
      player: { id: "p1" },
    } as Awaited<ReturnType<typeof mockRequireBotUser>>);

    const res = await GET(
      new Request("http://localhost/api/bot/queue", {
        headers: {
          Authorization: "Bearer token",
          "X-Discord-User-Id": "123",
        },
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.count).toBe(2);
    expect(getQueueState).toHaveBeenCalled();
  });
});

describe("POST /api/bot/queue", () => {
  beforeEach(() => vi.clearAllMocks());

  it("joins queue for linked player", async () => {
    mockRequireBotUser.mockResolvedValue({
      player: { id: "p1" },
    } as Awaited<ReturnType<typeof mockRequireBotUser>>);

    const res = await POST(
      new Request("http://localhost/api/bot/queue", {
        method: "POST",
        headers: {
          Authorization: "Bearer token",
          "X-Discord-User-Id": "123",
        },
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.count).toBe(3);
    expect(joinQueue).toHaveBeenCalledWith("p1");
  });
});
