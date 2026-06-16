import type { AppIconId } from "@/lib/nav-icons";

export type LocalTeam = {
  id: string;
  tag: string;
  name: string;
  wins: number;
  losses: number;
  recruiting: boolean;
  captainId: string;
  captainName: string;
  memberIds: string[];
};

export type LocalTicketStatus = "OPEN" | "ANSWERED" | "CLOSED";

export type LocalTicket = {
  id: string;
  number: number;
  subject: string;
  status: LocalTicketStatus;
  matchId?: string;
  createdAt: string;
};

export type LocalTournamentStatus = "OPEN" | "CHECK_IN" | "ENDED";

export type LocalTournament = {
  id: string;
  icon: AppIconId;
  name: string;
  meta: string;
  status: LocalTournamentStatus;
  prize: string;
  date: string;
  registered: boolean;
  primary: boolean;
  dim?: boolean;
};

export const SEED_TEAMS: LocalTeam[] = [
  {
    id: "team_apex",
    tag: "APX",
    name: "Apex Gaming",
    wins: 12,
    losses: 4,
    recruiting: true,
    captainId: "bot_apex",
    captainName: "ApexOne",
    memberIds: ["bot_apex", "bot_neo", "bot_shadow", "bot_vortex", "bot_ghost"],
  },
  {
    id: "team_nova",
    tag: "NVA",
    name: "Nova Clan",
    wins: 8,
    losses: 6,
    recruiting: false,
    captainId: "bot_nova",
    captainName: "NovaClutch",
    memberIds: ["bot_nova", "bot_frost", "bot_rift", "bot_blaze"],
  },
  {
    id: "team_rift",
    tag: "RFT",
    name: "Rift Kings",
    wins: 5,
    losses: 9,
    recruiting: true,
    captainId: "bot_rift",
    captainName: "RiftKing",
    memberIds: ["bot_rift", "bot_blaze"],
  },
];

export const SEED_TOURNAMENTS: LocalTournament[] = [
  {
    id: "tour_open_1",
    icon: "tournaments",
    name: "BSCL Open #1",
    meta: "16 Teams · Single Elim · BO3",
    status: "OPEN",
    prize: "$200",
    date: "Jun 22 · 8/16 teams",
    registered: false,
    primary: true,
  },
  {
    id: "tour_weekly_3",
    icon: "zap",
    name: "Weekly Cup #3",
    meta: "8 Teams · Double Elim · BO1",
    status: "CHECK_IN",
    prize: "$50",
    date: "Jun 17 · 8/8 teams",
    registered: false,
    primary: false,
  },
  {
    id: "tour_weekly_2",
    icon: "clipboard",
    name: "Weekly Cup #2",
    meta: "8 Teams · Single Elim · BO1",
    status: "ENDED",
    prize: "APEX Gaming",
    date: "Winner",
    registered: false,
    primary: false,
    dim: true,
  },
];

export const SEED_TICKETS: LocalTicket[] = [
  {
    id: "ticket_018",
    number: 18,
    subject: "Match Dispute — #M-034",
    status: "OPEN",
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    id: "ticket_012",
    number: 12,
    subject: "Technical — Bot not responding",
    status: "ANSWERED",
    createdAt: new Date(Date.now() - 172_800_000).toISOString(),
  },
  {
    id: "ticket_007",
    number: 7,
    subject: "General — Team transfer",
    status: "CLOSED",
    createdAt: new Date(Date.now() - 604_800_000).toISOString(),
  },
];
