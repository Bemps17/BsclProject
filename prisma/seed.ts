import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const season = await prisma.season.upsert({
    where: { number: 1 },
    update: { active: true },
    create: {
      number: 1,
      name: "Season 1",
      week: 1,
      startsAt: new Date("2026-05-01"),
      endsAt: new Date("2026-07-31"),
      active: true,
    },
  });

  const services = ["website", "api", "database", "discord_bot"] as const;
  for (const service of services) {
    await prisma.serviceHealth.upsert({
      where: { service },
      update: { status: "ONLINE" },
      create: { service, status: "ONLINE", message: "Operational" },
    });
  }

  console.log(`Seeded ${season.name} and service health records (no demo players)`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
