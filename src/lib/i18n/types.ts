export type Locale = "en" | "fr";

export type Translations = {
  nav: {
    home: string;
    play: string;
    rankings: string;
    teams: string;
    tournaments: string;
    matches: string;
    profile: string;
    tickets: string;
    admin: string;
    me: string;
  };
  sections: {
    platform: string;
    account: string;
    staff: string;
  };
  pages: Record<
    | "/"
    | "/play"
    | "/rankings"
    | "/teams"
    | "/profile"
    | "/matches"
    | "/tournaments"
    | "/tickets"
    | "/admin",
    string
  >;
  ranks: {
    elite: string;
    diamond: string;
    plat: string;
    gold: string;
    silver: string;
    bronze: string;
  };
  common: {
    online: string;
    joinQueue: string;
    all: string;
    signInDiscord: string;
    guestSignIn: string;
    demoBadge: string;
    signIn: string;
    player: string;
    rank: string;
    win: string;
    loss: string;
    vs: string;
    active: string;
    matches: string;
    days: string;
    needed: string;
    create: string;
    verified: string;
    staffOnly: string;
    demo: string;
    elo: string;
  };
  home: {
    seasonLive: string;
    heroLine1: string;
    heroLine2: string;
    heroDesc: string;
    joinPug: string;
    leaderboard: string;
    players: string;
    teams: string;
    season: string;
    seasonWeek: string;
    endsIn: string;
    softReset: string;
    queue: string;
    today: string;
    myElo: string;
    winRate: string;
    overall: string;
    recentResults: string;
    noMatches: string;
    topPlayers: string;
    weekAccent: string;
    noLeaderboard: string;
    localGuest: string;
    demoProfile: string;
  };
  play: {
    inQueue: string;
    avgWait: string;
    live: string;
    collectingData: string;
    demoMode: string;
    pugTitle: string;
    filling: string;
    readyDraft: string;
    join: string;
    leave: string;
    footerLive: string;
    footerDemo: string;
    howItWorks: string;
    steps: [string, string, string][];
    activeMatches: string;
    noActiveMatches: string;
    failJoin: string;
    failLeave: string;
  };
  rankings: {
    players: string;
    topElo: string;
    yourElo: string;
    yourRank: string;
    all: string;
    elite: string;
    diamond: string;
    plat: string;
    gold: string;
    winPct: string;
    emptyBracket: string;
  };
  teams: {
    title: string;
    registered: string;
    recruiting: string;
    createTeam: string;
    empty: string;
    members: string;
    captain: string;
  };
  matches: {
    title: string;
    id: string;
    alpha: string;
    score: string;
    bravo: string;
    status: string;
    empty: string;
  };
  profile: {
    currentElo: string;
    rankPosition: string;
    peak: string;
    matches: string;
    wins: string;
    losses: string;
    rankProgress: string;
    toElite: string;
    matchHistory: string;
    noMatches: string;
    myTeam: string;
    notInTeam: string;
    createOrJoin: string;
    manage: string;
    account: string;
    supportTickets: string;
    tournaments: string;
    adminPanel: string;
    staff: string;
    discord: string;
    localOnly: string;
    guestProfile: string;
    clearProfile: string;
    tryQueue: string;
    noMatchesDemo: string;
    savedBrowser: string;
  };
  login: {
    discordDesc: string;
    discordCta: string;
    demoDesc: string;
    displayName: string;
    demoCta: string;
    nameRequired: string;
    saveFailed: string;
  };
  admin: {
    title: string;
    users: string;
    tickets: string;
    bans: string;
    pending: string;
    panels: { title: string; sub: string }[];
  };
  tournaments: {
    title: string;
    prizePool: string;
    winner: string;
    register: string;
    bracket: string;
    results: string;
    statusOpen: string;
    statusCheckIn: string;
    statusEnded: string;
  };
  tickets: {
    title: string;
    new: string;
    myTickets: string;
    statusOpen: string;
    statusAnswered: string;
    statusClosed: string;
  };
  matchStatus: {
    LIVE: string;
    SUBMITTED: string;
    DRAFT: string;
    CONFIRMED: string;
    DISPUTED: string;
    CANCELLED: string;
  };
};
