import { describe, expect, it, vi, beforeEach } from "vitest";
import { hasRole, requireAuth } from "./auth";
import type { UserRole } from "@/generated/prisma/client";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/backend", () => ({
  isBackendEnabled: vi.fn(() => true),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = vi.mocked(auth);
const mockFindUnique = vi.mocked(prisma.user.findUnique);

function mockUser(overrides: {
  id?: string;
  role?: UserRole;
  banned?: boolean;
  player?: { id: string } | null;
}) {
  mockAuth.mockResolvedValue({
    user: { id: overrides.id ?? "user-1" },
    expires: new Date(Date.now() + 3600_000).toISOString(),
  } as Awaited<ReturnType<typeof auth>>);

  mockFindUnique.mockResolvedValue({
    id: overrides.id ?? "user-1",
    role: overrides.role ?? "PLAYER",
    banned: overrides.banned ?? false,
    player: overrides.player === undefined ? { id: "player-1" } : overrides.player,
  } as Awaited<ReturnType<typeof mockFindUnique>>);
}

describe("hasRole", () => {
  it("allows equal or higher roles", () => {
    expect(hasRole("ADMIN", "PLAYER")).toBe(true);
    expect(hasRole("MODERATOR", "MODERATOR")).toBe(true);
    expect(hasRole("CAPTAIN", "MODERATOR")).toBe(false);
  });

  it("respects full hierarchy through OWNER", () => {
    expect(hasRole("OWNER", "ADMIN")).toBe(true);
    expect(hasRole("PLAYER", "OWNER")).toBe(false);
  });
});

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws UNAUTHORIZED without session", async () => {
    mockAuth.mockResolvedValue(null);
    await expect(requireAuth()).rejects.toThrow("UNAUTHORIZED");
  });

  it("throws BANNED for banned users", async () => {
    mockUser({ banned: true });
    await expect(requireAuth()).rejects.toThrow("BANNED");
  });

  it("throws FORBIDDEN when role is insufficient", async () => {
    mockUser({ role: "PLAYER" });
    await expect(requireAuth("ADMIN")).rejects.toThrow("FORBIDDEN");
  });

  it("returns user when authorized", async () => {
    mockUser({ role: "CAPTAIN" });
    const user = await requireAuth("PLAYER");
    expect(user.role).toBe("CAPTAIN");
    expect(user.player?.id).toBe("player-1");
  });
});
