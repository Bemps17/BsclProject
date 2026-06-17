import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/status/route";

vi.mock("@/lib/backend", () => ({
  isBackendEnabled: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    serviceHealth: {
      findMany: vi.fn(),
    },
  },
}));

import { isBackendEnabled } from "@/lib/backend";
import { prisma } from "@/lib/prisma";

const mockIsBackendEnabled = vi.mocked(isBackendEnabled);
const mockFindMany = vi.mocked(prisma.serviceHealth.findMany);

describe("GET /api/status", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns demo health rows when backend is disabled", async () => {
    mockIsBackendEnabled.mockReturnValue(false);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(4);
    expect(body[0]).toMatchObject({ service: "website", status: "ONLINE", message: "Demo mode" });
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("reads service health from database when backend is enabled", async () => {
    mockIsBackendEnabled.mockReturnValue(true);
    mockFindMany.mockResolvedValue([
      {
        service: "database",
        status: "ONLINE",
        message: "OK",
        updatedAt: new Date("2026-06-16T12:00:00.000Z"),
      },
    ] as Awaited<ReturnType<typeof mockFindMany>>);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.find((row: { service: string }) => row.service === "database")).toMatchObject({
      status: "ONLINE",
      message: "OK",
    });
  });
});
