import { MatchStatus } from "@/generated/prisma/client";
import {
  PLACEMENT_MATCHES,
  calculateEloDelta,
  getRankFromElo,
} from "@/lib/elo";
import { canConfirmMatch } from "@/lib/match";
import { teamAverageElo } from "@/lib/team-balance";
import type { MatchScoreInput } from "@/lib/validators/match";
import { prisma } from "@/lib/prisma";

export class MatchLifecycleError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT",
  ) {
    super(message);
    this.name = "MatchLifecycleError";
  }
}

function assertCaptain(
  playerId: string,
  captainAlpha: string | null,
  captainBravo: string | null,
) {
  if (playerId !== captainAlpha && playerId !== captainBravo) {
    throw new MatchLifecycleError("Only match captains can perform this action", "FORBIDDEN");
  }
}

export async function submitMatchResult(
  matchId: string,
  playerId: string,
  scores: MatchScoreInput,
) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new MatchLifecycleError("Match not found", "NOT_FOUND");
  if (match.status !== "LIVE") {
    throw new MatchLifecycleError("Match is not live", "INVALID_STATE");
  }

  assertCaptain(playerId, match.captainAlpha, match.captainBravo);

  return prisma.match.update({
    where: { id: matchId },
    data: {
      alphaScore: scores.alphaScore,
      bravoScore: scores.bravoScore,
      status: "SUBMITTED",
      submittedBy: playerId,
    },
  });
}

export async function confirmMatchResult(matchId: string, playerId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      players: { include: { player: true } },
    },
  });

  if (!match) throw new MatchLifecycleError("Match not found", "NOT_FOUND");

  if (match.status === "CONFIRMED") {
    return { match, alreadyConfirmed: true as const };
  }

  if (!match.submittedBy || !canConfirmMatch(match.submittedBy, playerId, match.status)) {
    throw new MatchLifecycleError("Cannot confirm this match", "FORBIDDEN");
  }

  assertCaptain(playerId, match.captainAlpha, match.captainBravo);

  if (match.alphaScore == null || match.bravoScore == null) {
    throw new MatchLifecycleError("Match scores missing", "INVALID_STATE");
  }

  const alphaWon = match.alphaScore > match.bravoScore;
  const alphaPlayers = match.players.filter((p) => p.side === "ALPHA");
  const bravoPlayers = match.players.filter((p) => p.side === "BRAVO");
  const alphaAvg = teamAverageElo(alphaPlayers.map((p) => p.player));
  const bravoAvg = teamAverageElo(bravoPlayers.map((p) => p.player));

  const updated = await prisma.$transaction(async (tx) => {
    const fresh = await tx.match.findUnique({ where: { id: matchId } });
    if (!fresh) throw new MatchLifecycleError("Match not found", "NOT_FOUND");
    if (fresh.status === "CONFIRMED") return fresh;

    for (const mp of match.players) {
      const onAlpha = mp.side === "ALPHA";
      const won = onAlpha ? alphaWon : !alphaWon;
      const opponentAvg = onAlpha ? bravoAvg : alphaAvg;
      const player = mp.player;

      const placementProtection = !player.placementComplete;
      const delta = calculateEloDelta(player.elo, opponentAvg, won, placementProtection);
      const newElo = player.elo + delta;
      const newRank = getRankFromElo(newElo);
      const placementMatches = Math.min(
        PLACEMENT_MATCHES,
        player.placementMatches + (player.placementComplete ? 0 : 1),
      );
      const placementComplete =
        player.placementComplete || placementMatches >= PLACEMENT_MATCHES;

      await tx.player.update({
        where: { id: player.id },
        data: {
          elo: newElo,
          mmr: newElo,
          peakElo: Math.max(player.peakElo, newElo),
          rank: newRank,
          wins: won ? player.wins + 1 : player.wins,
          losses: won ? player.losses : player.losses + 1,
          placementMatches,
          placementComplete,
        },
      });

      await tx.matchPlayer.update({
        where: { id: mp.id },
        data: { eloDelta: delta },
      });

      await tx.eloHistory.create({
        data: {
          playerId: player.id,
          matchId,
          oldElo: player.elo,
          newElo,
          delta,
          reason: won ? "match_win" : "match_loss",
        },
      });
    }

    return tx.match.update({
      where: { id: matchId },
      data: {
        status: "CONFIRMED",
        confirmedBy: playerId,
      },
    });
  });

  return { match: updated, alreadyConfirmed: false as const };
}

export async function disputeMatchResult(
  matchId: string,
  playerId: string,
  userId: string,
  reason?: string,
) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new MatchLifecycleError("Match not found", "NOT_FOUND");
  if (match.status !== "SUBMITTED") {
    throw new MatchLifecycleError("Only submitted matches can be disputed", "INVALID_STATE");
  }

  assertCaptain(playerId, match.captainAlpha, match.captainBravo);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.match.update({
      where: { id: matchId },
      data: {
        status: "DISPUTED" satisfies MatchStatus,
        disputedAt: new Date(),
      },
    });

    await tx.ticket.create({
      data: {
        category: "MATCH_DISPUTE",
        subject: `Match dispute — #M-${String(match.number).padStart(3, "0")}`,
        body: reason?.trim() || "Captain disputed the submitted score.",
        creatorId: userId,
        matchId,
      },
    });

    return updated;
  });
}
