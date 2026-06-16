import { NextResponse } from "next/server";
import { isBackendEnabled } from "@/lib/backend";
import { prisma } from "@/lib/prisma";

const SERVICES = ["website", "api", "database", "discord_bot"] as const;

export async function GET() {
  if (!isBackendEnabled()) {
    return NextResponse.json(
      SERVICES.map((service) => ({
        service,
        status: "ONLINE",
        message: "Demo mode",
        updatedAt: new Date(),
      })),
    );
  }

  const health = await prisma.serviceHealth.findMany();
  const map = Object.fromEntries(health.map((h) => [h.service, h]));

  return NextResponse.json(
    SERVICES.map((service) => ({
      service,
      status: map[service]?.status ?? "ONLINE",
      message: map[service]?.message ?? null,
      updatedAt: map[service]?.updatedAt ?? new Date(),
    })),
  );
}
