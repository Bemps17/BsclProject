"use client";

import type { RankKey } from "@/lib/constants";
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
};

const DEFAULT_STATE: LocalState = {
  player: null,
  queue: [],
  inQueue: false,
};

function readState(): LocalState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) } as LocalState;
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
  const state = readState();
  writeState({ ...state, player: null, inQueue: false });
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

export function localQueueSnapshot(): { count: number; needed: number; players: LocalQueuePlayer[] } {
  const { queue } = readState();
  const count = queue.length;
  return { count, needed: Math.max(0, 10 - count), players: queue };
}
