"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getLocalState,
  joinLocalQueue,
  leaveLocalQueue,
  localQueueSnapshot,
  subscribeLocalState,
  type LocalPlayer,
  type LocalState,
} from "@/lib/local-store";
import type { RankKey } from "@/lib/constants";
import { discordTag } from "@/lib/discord-sim";
import { playerInitials } from "@/lib/ranks";

export type DemoShellUser = {
  name: string;
  initials: string;
  rankKey: RankKey;
  elo: number;
} | null;

type DemoContextValue = {
  state: LocalState;
  player: LocalPlayer | null;
  shellUser: DemoShellUser;
  queue: ReturnType<typeof localQueueSnapshot>;
  refresh: () => void;
  joinQueue: () => void;
  leaveQueue: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocalState>(() =>
    typeof window === "undefined" ? { player: null, queue: [], inQueue: false } : getLocalState(),
  );

  const refresh = useCallback(() => {
    setState(getLocalState());
  }, []);

  useEffect(() => subscribeLocalState(refresh), [refresh]);

  const shellUser = useMemo((): DemoShellUser => {
    if (!state.player) return null;
    const { player } = state;
    const name =
      player.authMethod === "discord_sim" &&
      player.discordUsername &&
      player.discordDiscriminator
        ? discordTag({
            username: player.discordUsername,
            discriminator: player.discordDiscriminator,
          })
        : player.displayName;
    return {
      name,
      initials: playerInitials(player.displayName),
      rankKey: player.rankKey,
      elo: player.elo,
    };
  }, [state.player]);

  const queue = useMemo(() => localQueueSnapshot(), [state]);

  const value = useMemo(
    (): DemoContextValue => ({
      state,
      player: state.player,
      shellUser,
      queue,
      refresh,
      joinQueue: () => {
        joinLocalQueue();
        refresh();
      },
      leaveQueue: () => {
        leaveLocalQueue();
        refresh();
      },
    }),
    [state, shellUser, queue, refresh],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error("useDemo must be used within DemoProvider");
  }
  return ctx;
}

export function useDemoOptional() {
  return useContext(DemoContext);
}
