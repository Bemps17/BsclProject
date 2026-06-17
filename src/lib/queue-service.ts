import { processQueueMatchmaking } from "@/lib/matchmaker";
import { prisma } from "@/lib/prisma";

export async function getQueueState() {
  const entries = await prisma.queueEntry.findMany({
    where: { status: "WAITING" },
    orderBy: { joinedAt: "asc" },
    include: {
      player: {
        include: { user: { select: { username: true, avatar: true } } },
      },
    },
  });

  return {
    count: entries.length,
    needed: Math.max(0, 10 - entries.length),
    players: entries.map((entry) => ({
      id: entry.playerId,
      name: entry.player.displayName,
      initials: entry.player.displayName.slice(0, 2).toUpperCase(),
      joinedAt: entry.joinedAt,
    })),
  };
}

export async function joinQueue(playerId: string) {
  const existing = await prisma.queueEntry.findFirst({
    where: { playerId, status: "WAITING" },
  });

  if (existing) {
    throw new Error("ALREADY_IN_QUEUE");
  }

  const entry = await prisma.queueEntry.create({
    data: { playerId, status: "WAITING" },
  });

  const count = await prisma.queueEntry.count({ where: { status: "WAITING" } });
  const matchesCreated = count >= 10 ? await processQueueMatchmaking() : [];
  const remaining = await prisma.queueEntry.count({ where: { status: "WAITING" } });

  return {
    entry,
    count: remaining,
    ready: remaining >= 10,
    matchesCreated,
  };
}

export async function leaveQueue(playerId: string) {
  await prisma.queueEntry.updateMany({
    where: { playerId, status: "WAITING" },
    data: { status: "LEFT", leftAt: new Date() },
  });

  const count = await prisma.queueEntry.count({ where: { status: "WAITING" } });
  return { count };
}
