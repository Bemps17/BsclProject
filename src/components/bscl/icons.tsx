import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Bot,
  ChevronRight,
  Circle,
  ClipboardList,
  FlaskConical,
  History,
  Home,
  Menu,
  Medal,
  Newspaper,
  Play,
  Settings,
  Ticket,
  Trophy,
  User,
  Users,
  Zap,
} from "lucide-react";
import type { AppIconId, NavIconId } from "@/lib/nav-icons";
import { cn } from "@/lib/utils";

export type { AppIconId, NavIconId } from "@/lib/nav-icons";

const NAV_ICON_MAP: Record<NavIconId, LucideIcon> = {
  home: Home,
  play: Play,
  rankings: Medal,
  teams: Users,
  tournaments: Trophy,
  matches: History,
  profile: User,
  tickets: Ticket,
  admin: Settings,
  more: Menu,
  demo: FlaskConical,
};

const APP_ICON_MAP: Record<AppIconId, LucideIcon> = {
  ...NAV_ICON_MAP,
  zap: Zap,
  clipboard: ClipboardList,
};

type IconProps = {
  name: NavIconId | AppIconId;
  className?: string;
};

function renderIcon(Icon: LucideIcon, className?: string) {
  return <Icon className={cn("shrink-0", className)} aria-hidden strokeWidth={2} />;
}

export function NavIcon({ name, className }: { name: NavIconId; className?: string }) {
  return renderIcon(NAV_ICON_MAP[name], className);
}

export function AppIcon({ name, className }: IconProps) {
  return renderIcon(APP_ICON_MAP[name], className);
}

const ADMIN_PANEL_ICONS = [
  Users,
  Trophy,
  ClipboardList,
  Newspaper,
  Bell,
  BarChart3,
  Settings,
  Bot,
] as const satisfies readonly LucideIcon[];

export function AdminPanelIcon({ index, className }: { index: number; className?: string }) {
  const Icon = ADMIN_PANEL_ICONS[index] ?? Settings;
  return renderIcon(Icon, className);
}

export function BulletIcon({ className }: { className?: string }) {
  return renderIcon(Circle, cn("fill-current", className));
}

/** Discord brand mark — not available in Lucide. */
export function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("shrink-0", className)} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"
      />
    </svg>
  );
}

export { ChevronRight, Play };
