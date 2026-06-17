import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy } from "./csp";

describe("buildContentSecurityPolicy", () => {
  it("does not include unsafe-eval", () => {
    const policy = buildContentSecurityPolicy();
    expect(policy).not.toContain("unsafe-eval");
    expect(policy).toContain("script-src 'self' 'unsafe-inline'");
    expect(policy).toContain("https://cdn.discordapp.com");
  });
});
