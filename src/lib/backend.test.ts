import { describe, expect, it, vi, afterEach } from "vitest";

describe("isBackendEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns false when DATABASE_URL or AUTH_SECRET is missing", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("AUTH_SECRET", "");
    const { isBackendEnabled } = await import("./backend");
    expect(isBackendEnabled()).toBe(false);
  });

  it("returns true when both DATABASE_URL and AUTH_SECRET are set", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/test");
    vi.stubEnv("AUTH_SECRET", "secret");
    const { isBackendEnabled } = await import("./backend");
    expect(isBackendEnabled()).toBe(true);
  });
});

describe("isDemoMode", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns true when backend is disabled", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("AUTH_SECRET", "");
    const { isDemoMode } = await import("./backend");
    expect(isDemoMode()).toBe(true);
  });

  it("returns true when demo cookie is set and backend enabled", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/test");
    vi.stubEnv("AUTH_SECRET", "secret");
    const { isDemoMode } = await import("./backend");
    expect(isDemoMode("1")).toBe(true);
    expect(isDemoMode()).toBe(false);
  });

  it("returns true when BSCL_DEMO is set", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/test");
    vi.stubEnv("AUTH_SECRET", "secret");
    vi.stubEnv("BSCL_DEMO", "1");
    const { isDemoMode } = await import("./backend");
    expect(isDemoMode()).toBe(true);
  });
});
