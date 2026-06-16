export const BSCL = {
  name: "Black Squad Competitive League",
  shortName: "BSCL",
  domain: "bscl.gg",
  season: { number: 1, week: 3, daysLeft: 41 },
} as const;

export const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/play": "Play — Find a Match",
  "/rankings": "Rankings",
  "/teams": "Teams",
  "/profile": "My Profile",
  "/matches": "Match History",
  "/tournaments": "Tournaments",
  "/tickets": "Support",
  "/admin": "Admin Panel",
  "/news": "News",
  "/rules": "Rules",
  "/faq": "FAQ",
  "/status": "Server Status",
};

export type NavPage = {
  id: string;
  href: string;
  label: string;
  icon: string;
  badge?: number;
  badgeRed?: boolean;
  section?: "platform" | "account" | "staff";
  mobile?: boolean;
};

export const NAV_ITEMS: NavPage[] = [
  { id: "home", href: "/", label: "Home", icon: "⬡", section: "platform", mobile: true },
  { id: "play", href: "/play", label: "Play", icon: "▶", badge: 3, section: "platform", mobile: true },
  { id: "rankings", href: "/rankings", label: "Rankings", icon: "◈", section: "platform", mobile: true },
  { id: "teams", href: "/teams", label: "Teams", icon: "◆", section: "platform", mobile: true },
  { id: "tournaments", href: "/tournaments", label: "Tournaments", icon: "◉", section: "platform" },
  { id: "matches", href: "/matches", label: "Match History", icon: "▣", section: "platform" },
  { id: "profile", href: "/profile", label: "My Profile", icon: "○", section: "account", mobile: true },
  { id: "tickets", href: "/tickets", label: "Support", icon: "□", badge: 1, badgeRed: true, section: "account" },
  { id: "admin", href: "/admin", label: "Admin", icon: "⚙", section: "staff" },
];

export const DEMO_LEADERBOARD = {
  all: [
    { pos: 1, name: "ShadowK1ng", rank: "elite" as const, elo: 2041, wr: "74%" },
    { pos: 2, name: "NightCrawler", rank: "elite" as const, elo: 1964, wr: "68%" },
    { pos: 3, name: "xGhost_BR", rank: "diamond" as const, elo: 1642, wr: "61%", me: true },
    { pos: 4, name: "Specter99", rank: "diamond" as const, elo: 1621, wr: "56%" },
    { pos: 5, name: "AcidReign", rank: "plat" as const, elo: 1542, wr: "52%" },
    { pos: 6, name: "FrostByte", rank: "plat" as const, elo: 1487, wr: "50%" },
    { pos: 7, name: "VoidRunner", rank: "gold" as const, elo: 1389, wr: "48%" },
    { pos: 8, name: "RazorEdge", rank: "gold" as const, elo: 1312, wr: "46%" },
  ],
};

export type RankKey = "elite" | "diamond" | "plat" | "gold" | "silver" | "bronze";

export const RANK_STYLES: Record<RankKey, string> = {
  bronze: "bg-[rgba(205,127,50,.14)] text-[#CD7F32] border border-[rgba(205,127,50,.3)]",
  silver: "bg-[rgba(192,192,192,.12)] text-[#C0C0C0] border border-[rgba(192,192,192,.28)]",
  gold: "bg-[rgba(245,158,11,.12)] text-[#F59E0B] border border-[rgba(245,158,11,.28)]",
  plat: "bg-[rgba(148,163,184,.12)] text-[#94A3B8] border border-[rgba(148,163,184,.28)]",
  diamond: "bg-[rgba(96,165,250,.12)] text-[#60A5FA] border border-[rgba(96,165,250,.28)]",
  elite: "bg-[rgba(0,102,255,.16)] text-[#4D99FF] border border-[rgba(0,102,255,.38)] shadow-[0_0_8px_rgba(0,102,255,.2)]",
};

export const RANK_LABELS: Record<RankKey, string> = {
  elite: "ELITE",
  diamond: "DIAMOND",
  plat: "PLAT",
  gold: "GOLD",
  silver: "SILVER",
  bronze: "BRONZE",
};
