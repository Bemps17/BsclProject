import { describe, expect, it } from "vitest";
import { MOCK_DISCORD_ACCOUNTS, discordTag } from "./discord-sim";

describe("discord-sim", () => {
  it("formats discord tag", () => {
    expect(discordTag(MOCK_DISCORD_ACCOUNTS[0])).toBe("xGhost_BR#1337");
  });

  it("exposes preset mock accounts", () => {
    expect(MOCK_DISCORD_ACCOUNTS.length).toBeGreaterThanOrEqual(3);
    for (const account of MOCK_DISCORD_ACCOUNTS) {
      expect(account.username.length).toBeGreaterThan(0);
      expect(account.discriminator).toMatch(/^\d{4}$/);
    }
  });
});
