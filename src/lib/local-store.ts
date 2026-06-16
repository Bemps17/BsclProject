"use client";

import type { RankKey } from "@/lib/constants";
import {
  LOCAL_BOT_POOL,
  botQueueEntry,
  confirmLocalMatch,
  createMatchFromQueue,
  submitLocalScores,
  type LocalMatch,
} from "@/lib/local-matchmaker";
import { PUG_QUEUE_SIZE } from "@/lib/match";
import { playerInitials } from "@/lib/ranks";

const STORAGE_KEY = "bscl-local-v1";

export type LocalPlayer = {
  id: string;
  displayName: string;
  elo: number;
  rankKey: RankKey;
  wins: number;
  losses: number;
  peakElo: number;
  authMethod?: "guest" | "discord_sim";
  discordUsername?: string;
  discordDiscriminator?: string;
  avatarHue?: number;
};

export type LocalQueuePlayer = {
  id: string;
  name: string;
  initials: string;
};

export type LocalState = {
  player: LocalPlayer | null;
  queue: LocalQueuePlayer[];
  inQueue: boolean;
  matches: LocalMatch[];
  matchCounter: number;
};

const DEFAULT_STATE: LocalState = {
  player: null,
  queue: [],
  inQueue: false,
  matches: [],
  matchCounter: 0,
};

function readState(): LocalState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<LocalState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      matches: parsed.matches ?? [],
      matchCounter: parsed.matchCounter ?? 0,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: LocalState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("bscl-local-update"));
}

export function getLocalState(): LocalState {
  return readState();
}

export function subscribeLocalState(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener("bscl-local-update", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("bscl-local-update", handler);
    window.removeEventListener("storage", handler);
  };
}

export function createGuestPlayer(displayName: string): LocalPlayer {
  const trimmed = displayName.trim();
  if (!trimmed) {
    throw new Error("Display name required");
  }
  return {
    id: `local_${Date.now()}`,
    displayName: trimmed,
    elo: 1000,
    rankKey: "silver",
    wins: 0,
    losses: 0,
    peakElo: 1000,
  };
}

export function saveGuestPlayer(displayName: string): LocalPlayer {
  const player = createGuestPlayer(displayName);
  const state = readState();
  writeState({ ...state, player: { ...player, authMethod: "guest" } });
  return player;
}

export function saveSimulatedDiscordPlayer(account: {
  username: string;
  discriminator: string;
  hue: number;
}): LocalPlayer {
  const trimmed = account.username.trim();
  if (!trimmed) {
    throw new Error("Username required");
  }

  const player: LocalPlayer = {
    id: `discord_sim_${Date.now()}`,
    displayName: trimmed,
    elo: 1000,
    rankKey: "silver",
    wins: 0,
    losses: 0,
    peakElo: 1000,
    authMethod: "discord_sim",
    discordUsername: trimmed,
    discordDiscriminator: account.discriminator,
    avatarHue: account.hue,
  };

  const state = readState();
  writeState({ ...state, player });
  return player;
}

export function clearGuestPlayer() {
  writeState(DEFAULT_STATE);
}

export function resetDemoData() {
  writeState(DEFAULT_STATE);
}

export function joinLocalQueue(): LocalState {
  const state = readState();
  if (!state.player) {
    throw new Error("No local player");
  }
  if (state.inQueue) return state;

  const entry: LocalQueuePlayer = {
    id: state.player.id,
    name: state.player.displayName,
    initials: playerInitials(state.player.displayName),
  };

  const alreadyIn = state.queue.some((p) => p.id === entry.id);
  const queue = alreadyIn ? state.queue : [...state.queue, entry];

  const next = { ...state, queue, inQueue: true };
  writeState(next);
  return next;
}

export function leaveLocalQueue(): LocalState {
  const state = readState();
  if (!state.player) return state;

  const queue = state.queue.filter((p) => p.id !== state.player!.id);
  const next = { ...state, queue, inQueue: false };
  writeState(next);
  return next;
}

export function fillQueueWithBots(): LocalState {
  const state = readState();
  if (!state.player) {
    throw new Error("No local player");
  }

  let queue = [...state.queue];
  if (!queue.some((p) => p.id === state.player!.id)) {
    queue.push({
      id: state.player.id,
      name: state.player.displayName,
      initials: playerInitials(state.player.displayName),
    });
  }

  for (const bot of LOCAL_BOT_POOL) {
    if (queue.length >= PUG_QUEUE_SIZE) break;
    if (!queue.some((p) => p.id === bot.id)) {
      queue.push(botQueueEntry(bot));
    }
  }

  const next = { ...state, queue, inQueue: true };
  writeState(next);
  return next;
}

export function tryCreateLocalMatch(): LocalState {
  const state = readState();
  if (state.queue.length < PUG_QUEUE_SIZE) return state;

  const matchNumber = state.matchCounter + 1;
  const match = createMatchFromQueue(state.queue, matchNumber, state.player);
  if (!match) return state;

  const queueIds = new Set(match.players.map((p) => p.playerId));
  const queue = state.queue.filter((p) => !queueIds.has(p.id));
  const inQueue = state.player ? queue.some((p) => p.id === state.player!.id) : false;

  const next: LocalState = {
    ...state,
    queue,
    inQueue,
    matchCounter: matchNumber,
    matches: [match, ...state.matches],
  };
  writeState(next);
  return next;
}

export function fillBotsAndStartMatch(): LocalState {
  fillQueueWithBots();
  return tryCreateLocalMatch();
}

export function submitLocalMatchResult(
  matchId: string,
  alphaScore: number,
  bravoScore: number,
): LocalState {
  const state = readState();
  if (!state.player) throw new Error("No local player");

  const index = state.matches.findIndex((m) => m.id === matchId);
  if (index === -1) throw new Error("Match not found");

  const updated = submitLocalScores(
    state.matches[index],
    state.player.id,
    alphaScore,
    bravoScore,
  );

  const matches = [...state.matches];
  matches[index] = updated;
  const next = { ...state, matches };
  writeState(next);
  return next;
}

export function confirmLocalMatchResult(matchId: string, asPlayerId?: string): LocalState {
  const state = readState();
  const index = state.matches.findIndex((m) => m.id === matchId);
  if (index === -1) throw new Error("Match not found");

  const match = state.matches[index];
  const confirmerId =
    asPlayerId ??
    (state.player?.id === match.captainAlpha ? match.captainBravo : match.captainAlpha);

  const { match: confirmed, playerUpdate } = confirmLocalMatch(match, confirmerId, state.player);

  let player = state.player;
  if (player && playerUpdate) {
    player = {
      ...player,
      elo: playerUpdate.elo,
      rankKey: playerUpdate.rankKey,
      wins: playerUpdate.wins,
      losses: playerUpdate.losses,
      peakElo: playerUpdate.peakElo,
    };
  }

  const matches = [...state.matches];
  matches[index] = confirmed;
  const next = { ...state, player, matches };
  writeState(next);
  return next;
}

export function localQueueSnapshot(): { count: number; needed: number; players: LocalQueuePlayer[] } {
  const { queue } = readState();
  const count = queue.length;
  return { count, needed: Math.max(0, PUG_QUEUE_SIZE - count), players: queue };
}

export function localDemoStats() {
  const state = readState();
  const liveMatches = state.matches.filter((m) => m.status === "LIVE").length;
  const todayMatches = state.matches.filter((m) => {
    const created = new Date(m.createdAt);
    const now = new Date();
    return (
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth() &&
      created.getDate() === now.getDate()
    );
  }).length;

  return {
    queueCount: state.queue.length,
    liveMatches,
    todayMatches,
    matchCount: state.matches.length,
    playerCount: state.player ? LOCAL_BOT_POOL.length + 1 : LOCAL_BOT_POOL.length,
  };
}

export function localPlayerMatches(playerId: string): LocalMatch[] {
  return readState().matches.filter((m) => m.players.some((p) => p.playerId === playerId));
}

export { LOCAL_BOT_POOL, type LocalMatch };
