import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SERVICES = ["website", "api", "database", "discord_bot"] as const;

export async function GET() {
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
