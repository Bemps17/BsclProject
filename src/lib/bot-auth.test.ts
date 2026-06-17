import { beforeEach, describe, expect, it, vi } from "vitest";
import { BotAuthError, requireBotUser, verifyBotAuthorization } from "@/lib/bot-auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

const mockFindUnique = vi.mocked(prisma.user.findUnique);

describe("verifyBotAuthorization", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("DISCORD_BOT_TOKEN", "test-bot-token");
  });

  it("accepts matching bearer token", () => {
    const request = new Request("http://localhost/api/bot/queue", {
      headers: { Authorization: "Bearer test-bot-token" },
    });
    expect(verifyBotAuthorization(request)).toBe(true);
  });

  it("rejects missing authorization", () => {
    const request = new Request("http://localhost/api/bot/queue");
    expect(verifyBotAuthorization(request)).toBe(false);
  });
});

describe("requireBotUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("DISCORD_BOT_TOKEN", "test-bot-token");
  });

  it("requires discord user header", async () => {
    const request = new Request("http://localhost/api/bot/queue", {
      headers: { Authorization: "Bearer test-bot-token" },
    });

    await expect(requireBotUser(request)).rejects.toMatchObject({
      code: "DISCORD_ID_REQUIRED",
    } satisfies Partial<BotAuthError>);
  });

  it("resolves linked player account", async () => {
    mockFindUnique.mockResolvedValue({
      id: "u1",
      discordId: "123",
      banned: false,
      role: "PLAYER",
      player: { id: "p1" },
    } as Awaited<ReturnType<typeof mockFindUnique>>);

    const request = new Request("http://localhost/api/bot/queue", {
      headers: {
        Authorization: "Bearer test-bot-token",
        "X-Discord-User-Id": "123",
      },
    });

    const user = await requireBotUser(request);
    expect(user.player?.id).toBe("p1");
  });
});
