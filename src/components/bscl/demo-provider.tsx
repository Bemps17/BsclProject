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
import { DemoLaunchModal } from "@/components/bscl/demo-launch-modal";
import { discordTag } from "@/lib/discord-sim";
import {
  buildDemoLeaderboard,
  type LocalMatch,
} from "@/lib/local-matchmaker";
import {
  acceptDemoSession,
  advanceLocalDraft,
  confirmLocalMatchResult,
  fillBotsAndStartMatch,
  fillQueueWithBots,
  getLocalState,
  joinLocalQueue,
  leaveLocalQueue,
  localDemoStats,
  localPlayerMatches,
  localQueueSnapshot,
  resetDemoData,
  submitLocalMatchResult,
  subscribeLocalState,
  tryCreateLocalMatch,
  type LocalPlayer,
  type LocalState,
} from "@/lib/local-store";
import type { RankKey } from "@/lib/constants";
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
  sessionAccepted: boolean;
  shellUser: DemoShellUser;
  queue: ReturnType<typeof localQueueSnapshot>;
  stats: ReturnType<typeof localDemoStats>;
  matches: LocalMatch[];
  myMatches: LocalMatch[];
  leaderboard: ReturnType<typeof buildDemoLeaderboard>;
  refresh: () => void;
  acceptSession: () => void;
  exitDemo: () => void;
  joinQueue: () => void;
  leaveQueue: () => void;
  fillBots: () => void;
  startMatch: () => void;
  fillBotsAndMatch: () => void;
  advanceDraft: (matchId: string) => void;
  submitMatch: (matchId: string, alphaScore: number, bravoScore: number) => void;
  confirmMatch: (matchId: string, asPlayerId?: string) => void;
  resetAll: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

const EMPTY_STATE: LocalState = {
  player: null,
  queue: [],
  inQueue: false,
  matches: [],
  matchCounter: 0,
  sessionAccepted: false,
};

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocalState>(() =>
    typeof window === "undefined" ? EMPTY_STATE : getLocalState(),
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
  const stats = useMemo(() => localDemoStats(), [state]);
  const myMatches = useMemo(
    () => (state.player ? localPlayerMatches(state.player.id) : []),
    [state.player, state.matches],
  );
  const leaderboard = useMemo(
    () =>
      buildDemoLeaderboard(
        state.player
          ? {
              id: state.player.id,
              displayName: state.player.displayName,
              elo: state.player.elo,
              rankKey: state.player.rankKey,
              wins: state.player.wins,
              losses: state.player.losses,
            }
          : null,
      ),
    [state.player],
  );

  const value = useMemo(
    (): DemoContextValue => ({
      state,
      player: state.player,
      sessionAccepted: state.sessionAccepted,
      shellUser,
      queue,
      stats,
      matches: state.matches,
      myMatches,
      leaderboard,
      refresh,
      acceptSession: () => {
        acceptDemoSession();
        refresh();
      },
      exitDemo: () => {
        resetDemoData();
        refresh();
      },
      joinQueue: () => {
        joinLocalQueue();
        refresh();
      },
      leaveQueue: () => {
        leaveLocalQueue();
        refresh();
      },
      fillBots: () => {
        fillQueueWithBots();
        refresh();
      },
      startMatch: () => {
        tryCreateLocalMatch();
        refresh();
      },
      fillBotsAndMatch: () => {
        fillBotsAndStartMatch();
        refresh();
      },
      advanceDraft: (matchId) => {
        advanceLocalDraft(matchId);
        refresh();
      },
      submitMatch: (matchId, alphaScore, bravoScore) => {
        submitLocalMatchResult(matchId, alphaScore, bravoScore);
        refresh();
      },
      confirmMatch: (matchId, asPlayerId) => {
        confirmLocalMatchResult(matchId, asPlayerId);
        refresh();
      },
      resetAll: () => {
        resetDemoData();
        refresh();
      },
    }),
    [state, shellUser, queue, stats, myMatches, leaderboard, refresh],
  );

  return (
    <DemoContext.Provider value={value}>
      <DemoLaunchModal
        open={!state.sessionAccepted}
        onLaunch={() => value.acceptSession()}
      />
      {children}
    </DemoContext.Provider>
  );
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
