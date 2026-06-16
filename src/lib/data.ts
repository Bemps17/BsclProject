import { MatchStatus } from "@/generated/prisma/client";
import { getSessionUser } from "@/lib/auth";
import { isBackendEnabled } from "@/lib/backend";
import { BSCL } from "@/lib/constants";
import { rankTierToKey } from "@/lib/ranks";
import { prisma } from "@/lib/prisma";
import type { LeaderboardEntry } from "@/lib/match-display";

export type { LeaderboardEntry };

const EMPTY_STATS = {
  playerCount: 0,
  matchCount: 0,
  teamCount: 0,
  queueCount: 0,
  liveMatches: 0,
  todayMatches: 0,
  season: {
    number: BSCL.season.number,
    week: BSCL.season.week,
    endsAt: new Date(Date.now() + BSCL.season.daysLeft * 86_400_000),
  },
};

export async function getActiveSeason() {
  if (!isBackendEnabled()) return null;
  return prisma.season.findFirst({
    where: { active: true },
    orderBy: { number: "desc" },
  });
}

export async function getPlatformStats() {
  if (!isBackendEnabled()) return EMPTY_STATS;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [playerCount, matchCount, teamCount, queueCount, liveMatches, todayMatches, season] =
    await Promise.all([
      prisma.player.count(),
      prisma.match.count({ where: { status: "CONFIRMED" } }),
      prisma.team.count(),
      prisma.queueEntry.count({ where: { status: "WAITING" } }),
      prisma.match.count({ where: { status: "LIVE" } }),
      prisma.match.count({
        where: { createdAt: { gte: todayStart } },
      }),
      getActiveSeason(),
    ]);

  return {
    playerCount,
    matchCount,
    teamCount,
    queueCount,
    liveMatches,
    todayMatches,
    season,
  };
}

export async function getLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  if (!isBackendEnabled()) return [];

  const sessionUser = await getSessionUser();
  const currentPlayerId = sessionUser?.player?.id;

  const players = await prisma.player.findMany({
    orderBy: { elo: "desc" },
    take: limit,
    select: {
      id: true,
      displayName: true,
      rank: true,
      elo: true,
      wins: true,
      losses: true,
    },
  });

  return players.map((p, i) => ({
    position: i + 1,
    id: p.id,
    name: p.displayName,
    rank: p.rank,
    rankKey: rankTierToKey(p.rank),
    elo: p.elo,
    winRate:
      p.wins + p.losses > 0 ? Math.round((p.wins / (p.wins + p.losses)) * 100) : 0,
    me: p.id === currentPlayerId,
  }));
}

export async function getMatches(limit = 50) {
  if (!isBackendEnabled()) return [];
  return prisma.match.findMany({
    orderBy: { number: "desc" },
    take: limit,
    include: { teams: true },
  });
}

export async function getLiveMatches(limit = 10) {
  if (!isBackendEnabled()) return [];
  return prisma.match.findMany({
    where: { status: { in: ["LIVE", "SUBMITTED", "DRAFT"] } },
    orderBy: { number: "desc" },
    take: limit,
    include: { teams: true },
  });
}

export async function getTeams() {
  if (!isBackendEnabled()) return [];
  return prisma.team.findMany({
    orderBy: { wins: "desc" },
    include: {
      captain: { select: { displayName: true } },
      _count: { select: { members: true } },
    },
  });
}

export async function getCurrentPlayerProfile() {
  if (!isBackendEnabled()) return null;

  const user = await getSessionUser();
  if (!user?.player) return null;

  const [leaderboardPosition, recentMatches] = await Promise.all([
    prisma.player.count({
      where: { elo: { gt: user.player.elo } },
    }),
    prisma.matchPlayer.findMany({
      where: { playerId: user.player.id },
      orderBy: { match: { createdAt: "desc" } },
      take: 5,
      include: {
        match: { include: { teams: true } },
      },
    }),
  ]);

  return {
    user,
    player: user.player,
    rankPosition: leaderboardPosition + 1,
    recentMatches,
  };
}

export async function getAdminStats() {
  if (!isBackendEnabled()) {
    return { users: 0, openTickets: 0, activeBans: 0, pendingMatches: 0 };
  }

  const [users, openTickets, activeBans, pendingMatches] = await Promise.all([
    prisma.user.count(),
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.sanction.count({ where: { type: { in: ["BAN", "TEMP_BAN"] }, active: true } }),
    prisma.match.count({
      where: { status: { in: ["SUBMITTED", "DISPUTED"] as MatchStatus[] } },
    }),
  ]);

  return { users, openTickets, activeBans, pendingMatches };
}

export { formatMatchScore, matchStatusVariant } from "@/lib/match-display";
