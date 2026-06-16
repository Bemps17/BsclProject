import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, GET, POST } from "@/app/api/queue/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    queueEntry: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/lib/backend", () => ({
  isBackendEnabled: vi.fn(() => true),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const mockFindMany = vi.mocked(prisma.queueEntry.findMany);
const mockFindFirst = vi.mocked(prisma.queueEntry.findFirst);
const mockCreate = vi.mocked(prisma.queueEntry.create);
const mockUpdateMany = vi.mocked(prisma.queueEntry.updateMany);
const mockCount = vi.mocked(prisma.queueEntry.count);
const mockRequireAuth = vi.mocked(requireAuth);

describe("GET /api/queue", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns queue count and player list", async () => {
    mockFindMany.mockResolvedValue([
      {
        playerId: "p1",
        joinedAt: new Date("2026-06-16T10:00:00Z"),
        player: { displayName: "xGhost_BR", user: { username: "xGhost", avatar: null } },
      },
    ] as Awaited<ReturnType<typeof mockFindMany>>);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.count).toBe(1);
    expect(body.needed).toBe(9);
    expect(body.players[0]).toMatchObject({ name: "xGhost_BR", initials: "XG" });
  });
});

describe("POST /api/queue", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("UNAUTHORIZED"));
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("returns 409 when player is already queued", async () => {
    mockRequireAuth.mockResolvedValue({
      player: { id: "player-1" },
    } as Awaited<ReturnType<typeof mockRequireAuth>>);
    mockFindFirst.mockResolvedValue({ id: "entry-1" } as Awaited<ReturnType<typeof mockFindFirst>>);

    const res = await POST();
    expect(res.status).toBe(409);
  });

  it("creates queue entry and reports ready state at 10 players", async () => {
    mockRequireAuth.mockResolvedValue({
      player: { id: "player-1" },
    } as Awaited<ReturnType<typeof mockRequireAuth>>);
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "entry-new" } as Awaited<ReturnType<typeof mockCreate>>);
    mockCount.mockResolvedValue(10);

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ready).toBe(true);
    expect(body.count).toBe(10);
  });

  it("returns 400 when user has no player profile", async () => {
    mockRequireAuth.mockResolvedValue({ player: null } as Awaited<ReturnType<typeof mockRequireAuth>>);
    const res = await POST();
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/queue", () => {
  beforeEach(() => vi.clearAllMocks());

  it("leaves queue and returns updated count", async () => {
    mockRequireAuth.mockResolvedValue({
      player: { id: "player-1" },
    } as Awaited<ReturnType<typeof mockRequireAuth>>);
    mockUpdateMany.mockResolvedValue({ count: 1 });
    mockCount.mockResolvedValue(2);

    const res = await DELETE();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.count).toBe(2);
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { playerId: "player-1", status: "WAITING" },
      }),
    );
  });
});
