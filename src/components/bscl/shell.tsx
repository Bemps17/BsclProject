"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoHex } from "@/components/bscl/ui";
import { useDemoOptional } from "@/components/bscl/demo-provider";
import { LanguageSwitcher, useT } from "@/components/bscl/locale-provider";
import { NAV_ITEMS, type RankKey } from "@/lib/constants";
import type { Translations } from "@/lib/i18n";

export type ShellUser = {
  name: string;
  initials: string;
  rankKey: RankKey;
  elo: number;
} | null;

const NAV_LABEL_KEYS: Record<string, keyof Translations["nav"]> = {
  home: "home",
  play: "play",
  rankings: "rankings",
  teams: "teams",
  tournaments: "tournaments",
  matches: "matches",
  profile: "profile",
  tickets: "tickets",
  admin: "admin",
};

function NavLink({
  href,
  label,
  icon,
  badge,
  badgeRed,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  badgeRed?: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
        active
          ? "-ml-0.5 border-l-2 border-[#0066FF] bg-[rgba(0,102,255,.1)] text-[#0066FF] shadow-[inset_0_0_18px_rgba(0,102,255,.06)]"
          : "text-[#6B7280] hover:bg-[rgba(0,102,255,.1)] hover:text-[#E5E7EB]",
      )}
    >
      <span className="w-[15px] shrink-0 text-center opacity-80">{icon}</span>
      <span className="truncate">{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            "ml-auto rounded-full px-1.5 py-px text-[9px] font-bold text-white",
            badgeRed ? "bg-[#EF4444]" : "bg-[#0066FF]",
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function UserTile({ user, demoMode }: { user: ShellUser; demoMode?: boolean }) {
  const t = useT();

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center justify-center rounded-lg border border-[#1E2D45] bg-[#162032] p-2.5 text-xs font-semibold text-[#0066FF] transition hover:border-[#0066FF]"
      >
        {demoMode ? t.common.guestSignIn : t.common.signInDiscord}
      </Link>
    );
  }

  return (
    <Link
      href="/profile"
      className="flex items-center gap-2.5 rounded-lg border border-[#1E2D45] bg-[#162032] p-2.5 transition hover:border-[#0066FF]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#0066FF] bg-[#0066FF] font-[family-name:var(--font-rajdhani)] text-sm font-bold text-white shadow-[0_0_10px_rgba(0,102,255,.28)]">
        {user.initials}
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold">{user.name}</div>
        <div className="truncate text-[11px] font-semibold text-[#F59E0B]">
          ◆ {t.ranks[user.rankKey]} · {user.elo} {t.common.elo}
        </div>
      </div>
    </Link>
  );
}

export function Sidebar({ user, demoMode }: { user: ShellUser; demoMode?: boolean }) {
  const pathname = usePathname();
  const t = useT();
  const sections = ["platform", "account", "staff"] as const;

  return (
    <aside className="hidden md:col-start-1 md:row-span-2 md:row-start-1 md:flex md:min-h-0 md:flex-col md:overflow-y-auto md:border-r md:border-[#1E2D45] md:bg-[#111827] lg:w-[252px]">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[#1E2D45] px-4">
        <LogoHex />
        <div className="font-[family-name:var(--font-rajdhani)] text-base font-bold tracking-wide text-white">
          <span className="text-[#0066FF]">BSCL</span>.gg
        </div>
      </div>

      {sections.map((section) => {
        const items = NAV_ITEMS.filter((n) => n.section === section);
        if (items.length === 0) return null;
        return (
          <div key={section} className="px-2.5 pt-4">
            <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
              {t.sections[section]}
            </div>
            {items.map((item) => {
              const labelKey = NAV_LABEL_KEYS[item.id];
              const label = labelKey ? t.nav[labelKey] : item.label;
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={label}
                  icon={item.icon}
                  badge={item.badge}
                  badgeRed={item.badgeRed}
                  active={pathname === item.href}
                />
              );
            })}
          </div>
        );
      })}

      <div className="mt-auto shrink-0 border-t border-[#1E2D45] p-3">
        <UserTile user={user} demoMode={demoMode} />
      </div>
    </aside>
  );
}

export function Topbar({ demoMode }: { demoMode?: boolean }) {
  const pathname = usePathname();
  const t = useT();
  const pageKey = pathname as keyof Translations["pages"];
  const title = t.pages[pageKey] ?? "BSCL";

  return (
    <header className="sticky top-0 z-[100] flex h-14 shrink-0 items-center gap-2 border-b border-[#1E2D45] bg-[#111827]/95 px-3 backdrop-blur-sm supports-[backdrop-filter]:bg-[#111827]/80 md:static md:col-start-2 md:row-start-1 md:gap-4 md:px-6 md:backdrop-blur-none lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-none">
        <div className="flex min-w-0 items-center gap-2 md:hidden">
          <LogoHex size="sm" />
          <h1 className="truncate font-[family-name:var(--font-rajdhani)] text-[15px] font-bold leading-tight">
            {title}
          </h1>
        </div>
        <h1 className="hidden truncate font-[family-name:var(--font-rajdhani)] text-xl font-bold md:block lg:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <LanguageSwitcher />

        {demoMode && (
          <span
            className="hidden rounded-full border border-[rgba(245,158,11,.35)] bg-[rgba(245,158,11,.12)] px-2 py-0.5 text-[10px] font-semibold text-[#F59E0B] md:inline"
            title={t.common.demoBadge}
          >
            {t.common.demoBadge}
          </span>
        )}

        <div
          className="hidden items-center gap-1.5 rounded-full border border-[#1E2D45] bg-[#162032] px-2 py-1 text-[11px] text-[#6B7280] lg:flex"
          title={t.common.online}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22C55E] shadow-[0_0_5px_#22C55E]" />
          {t.common.online}
        </div>

        <span
          className="flex h-2 w-2 animate-pulse rounded-full bg-[#22C55E] shadow-[0_0_5px_#22C55E] lg:hidden"
          title={t.common.online}
          aria-label={t.common.online}
        />

        <Link
          href="/play"
          aria-label={t.common.joinQueue}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0066FF] text-sm font-bold text-white shadow-[0_0_14px_rgba(0,102,255,.28)] transition active:scale-[.97] sm:h-auto sm:w-auto sm:px-3.5 sm:py-1.5 sm:text-xs sm:font-semibold"
        >
          <span className="sm:hidden" aria-hidden>
            ▶
          </span>
          <span className="hidden max-w-[9rem] truncate sm:inline">{t.common.joinQueue}</span>
        </Link>
      </div>
    </header>
  );
}

export function Tabbar() {
  const pathname = usePathname();
  const t = useT();
  const tabs = NAV_ITEMS.filter((n) => n.mobile);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[200] flex h-[calc(4rem+env(safe-area-inset-bottom,0px))] border-t border-[#1E2D45] bg-[#111827]/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-sm supports-[backdrop-filter]:bg-[#111827]/80 md:hidden">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        const labelKey = NAV_LABEL_KEYS[tab.id];
        const label =
          tab.id === "profile" ? t.nav.me : labelKey ? t.nav[labelKey] : tab.label;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 pt-1 text-[9px] font-semibold uppercase tracking-wide transition-colors sm:gap-1 sm:text-[10px]",
              active ? "text-[#0066FF]" : "text-[#6B7280]",
            )}
          >
            {active && (
              <span className="absolute top-0 h-0.5 w-8 -translate-x-1/2 rounded-b bg-[#0066FF] shadow-[0_0_8px_rgba(0,102,255,.28)] left-1/2" />
            )}
            <span className={cn("text-lg leading-none transition-transform sm:text-xl", active && "scale-110")}>
              {tab.icon}
            </span>
            <span className="max-w-full truncate">{label}</span>
            {tab.badge !== undefined && (
              <span className="absolute right-[calc(50%-16px)] top-1.5 min-w-[14px] rounded-full bg-[#EF4444] px-1 text-center text-[9px] font-bold leading-[14px] text-white">
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  user,
  demoMode = false,
}: {
  children: React.ReactNode;
  user: ShellUser;
  demoMode?: boolean;
}) {
  const demo = useDemoOptional();
  const resolvedUser = demoMode ? (demo?.shellUser ?? null) : user;

  return (
    <div className="flex min-h-svh flex-col md:grid md:h-svh md:min-h-0 md:grid-cols-[240px_minmax(0,1fr)] md:grid-rows-[56px_minmax(0,1fr)] md:overflow-hidden lg:grid-cols-[252px_minmax(0,1fr)]">
      <Sidebar user={resolvedUser} demoMode={demoMode} />
      <Topbar demoMode={demoMode} />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-4 pb-[calc(4rem+env(safe-area-inset-bottom,0px)+1rem)] md:col-start-2 md:row-start-2 md:p-6 md:pb-6 lg:p-8">
        <div className="mx-auto flex w-full max-w-none flex-col gap-4 md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
          {children}
        </div>
      </main>
      <Tabbar />
    </div>
  );
}
