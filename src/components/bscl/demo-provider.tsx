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
import type { LocalTeam, LocalTicket, LocalTournament } from "@/lib/local-demo-data";
import { SEED_TEAMS, SEED_TICKETS, SEED_TOURNAMENTS } from "@/lib/local-demo-data";
import {
  acceptDemoSession,
  advanceLocalDraft,
  confirmLocalMatchResult,
  createLocalTeam,
  createLocalTicket,
  disputeLocalMatchResult,
  fillBotsAndStartMatch,
  fillQueueWithBots,
  getLocalState,
  joinLocalQueue,
  joinLocalTeam,
  leaveLocalQueue,
  leaveLocalTeam,
  localAdminStats,
  localDemoStats,
  localPlayerMatches,
  localQueueSnapshot,
  registerLocalTournament,
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
  adminStats: ReturnType<typeof localAdminStats>;
  matches: LocalMatch[];
  myMatches: LocalMatch[];
  teams: LocalTeam[];
  tournaments: LocalTournament[];
  tickets: LocalTicket[];
  playerTeamId: string | null;
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
  disputeMatch: (matchId: string) => void;
  createTeam: (tag: string, name: string) => void;
  joinTeam: (teamId: string) => void;
  leaveTeam: () => void;
  registerTournament: (tournamentId: string) => void;
  openTicket: (subject: string, matchId?: string) => void;
  resetAll: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

const EMPTY_STATE: LocalState = {
  player: null,
  queue: [],
  inQueue: false,
  matches: [],
  matchCounter: 0,
  teams: SEED_TEAMS,
  tournaments: SEED_TOURNAMENTS,
  tickets: SEED_TICKETS,
  ticketCounter: SEED_TICKETS.length,
  playerTeamId: null,
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
  const adminStats = useMemo(() => localAdminStats(), [state]);
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
      adminStats,
      matches: state.matches,
      myMatches,
      teams: state.teams,
      tournaments: state.tournaments,
      tickets: state.tickets,
      playerTeamId: state.playerTeamId,
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
      disputeMatch: (matchId) => {
        disputeLocalMatchResult(matchId);
        refresh();
      },
      createTeam: (tag, name) => {
        createLocalTeam(tag, name);
        refresh();
      },
      joinTeam: (teamId) => {
        joinLocalTeam(teamId);
        refresh();
      },
      leaveTeam: () => {
        leaveLocalTeam();
        refresh();
      },
      registerTournament: (tournamentId) => {
        registerLocalTournament(tournamentId);
        refresh();
      },
      openTicket: (subject, matchId) => {
        createLocalTicket(subject, matchId);
        refresh();
      },
      resetAll: () => {
        resetDemoData();
        refresh();
      },
    }),
    [state, shellUser, queue, stats, adminStats, myMatches, leaderboard, refresh],
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
