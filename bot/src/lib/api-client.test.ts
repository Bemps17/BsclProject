import { describe, expect, it, vi } from "vitest";
import { BotApiError, createBotApiClient } from "./api-client.js";

describe("createBotApiClient", () => {
  it("sends bot auth headers and parses queue response", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({ count: 4, needed: 6, players: [] }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createBotApiClient({
      baseUrl: "http://localhost:3000",
      botToken: "secret",
    });

    const state = await client.getQueue("discord-user-1");

    expect(state.count).toBe(4);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/bot/queue",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer secret",
          "X-Discord-User-Id": "discord-user-1",
        }),
      }),
    );

    vi.unstubAllGlobals();
  });

  it("throws BotApiError on API failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ error: "Link your Discord account", code: "ACCOUNT_NOT_LINKED" }, { status: 400 }),
      ),
    );

    const client = createBotApiClient({
      baseUrl: "http://localhost:3000",
      botToken: "secret",
    });

    await expect(client.joinQueue("discord-user-1")).rejects.toBeInstanceOf(BotApiError);
    vi.unstubAllGlobals();
  });
});
