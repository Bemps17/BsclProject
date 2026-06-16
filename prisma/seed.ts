import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, RankTier, UserRole } from "../src/generated/prisma/client";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_PLAYERS = [
  { name: "ShadowK1ng", elo: 2041, wins: 74, losses: 26, rank: "ELITE" as RankTier },
  { name: "NightCrawler", elo: 1964, wins: 68, losses: 32, rank: "ELITE" as RankTier },
  { name: "xGhost_BR", elo: 1642, wins: 33, losses: 21, rank: "DIAMOND" as RankTier },
  { name: "Specter99", elo: 1621, wins: 28, losses: 22, rank: "DIAMOND" as RankTier },
  { name: "AcidReign", elo: 1542, wins: 26, losses: 24, rank: "PLATINUM" as RankTier },
];

async function main() {
  const season = await prisma.season.upsert({
    where: { number: 1 },
    update: { active: true },
    create: {
      number: 1,
      name: "Season 1",
      week: 3,
      startsAt: new Date("2026-05-01"),
      endsAt: new Date("2026-07-31"),
      active: true,
    },
  });

  for (const [i, p] of DEMO_PLAYERS.entries()) {
    const discordId = `demo_${i}_${p.name.toLowerCase()}`;
    const user = await prisma.user.upsert({
      where: { discordId },
      update: {},
      create: {
        discordId,
        username: p.name,
        role: i === 2 ? UserRole.ADMIN : UserRole.PLAYER,
      },
    });

    await prisma.player.upsert({
      where: { userId: user.id },
      update: { elo: p.elo, rank: p.rank, wins: p.wins, losses: p.losses },
      create: {
        userId: user.id,
        displayName: p.name,
        elo: p.elo,
        mmr: p.elo,
        peakElo: p.elo,
        rank: p.rank,
        placementComplete: true,
        placementMatches: 5,
        wins: p.wins,
        losses: p.losses,
        verified: true,
      },
    });
  }

  const services = ["website", "api", "database", "discord_bot"] as const;
  for (const service of services) {
    await prisma.serviceHealth.upsert({
      where: { service },
      update: { status: "ONLINE" },
      create: { service, status: "ONLINE", message: "Operational" },
    });
  }

  console.log(`Seeded season ${season.name} with ${DEMO_PLAYERS.length} demo players`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
