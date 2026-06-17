import { describe, expect, it, vi } from "vitest";
import { ApiError, fetchJson, parseApiError } from "./fetch-client";

describe("parseApiError", () => {
  it("reads error field from JSON body", async () => {
    const res = new Response(JSON.stringify({ error: "Already in queue" }), {
      status: 409,
    });
    await expect(parseApiError(res)).resolves.toBe("Already in queue");
  });
});

describe("fetchJson", () => {
  it("throws ApiError when response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ error: "Login required" }, { status: 401 }),
      ),
    );

    await expect(fetchJson("/api/queue", { method: "POST" })).rejects.toMatchObject({
      status: 401,
      message: "Login required",
    } satisfies Partial<ApiError>);

    vi.unstubAllGlobals();
  });

  it("returns parsed JSON on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ count: 3 })),
    );

    await expect(fetchJson<{ count: number }>("/api/queue")).resolves.toEqual({ count: 3 });

    vi.unstubAllGlobals();
  });
});
