"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ButtonLink, LogoHex } from "@/components/bscl/ui";
import { DemoExitButton } from "@/components/bscl/demo-exit-button";
import { NavIcon, Play } from "@/components/bscl/icons";
import { isMobileMorePath } from "@/components/bscl/more-menu";
import { useDemoOptional } from "@/components/bscl/demo-provider";
import { LanguageSwitcher, useT } from "@/components/bscl/locale-provider";
import { NAV_ITEMS, type RankKey } from "@/lib/constants";
import type { NavIconId } from "@/lib/nav-icons";
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
  more: "more",
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
  icon: NavIconId;
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
          ? "-ml-0.5 border-l-2 border-primary bg-primary/12 text-primary shadow-[inset_0_0_18px_color-mix(in_oklch,var(--primary),transparent_92%)]"
          : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
      )}
    >
      <NavIcon name={icon} className="h-[15px] w-[15px] opacity-80" />
      <span className="truncate">{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            "ml-auto rounded-full px-1.5 py-px text-[9px] font-bold text-primary-foreground",
            badgeRed ? "bg-destructive" : "bg-primary",
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
      <ButtonLink
        href={demoMode ? "/demo" : "/login"}
        variant="outline"
        className="w-full"
      >
        {demoMode ? t.common.guestSignIn : t.common.signInDiscord}
      </ButtonLink>
    );
  }

  return (
    <Link
      href="/profile"
      className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary p-2.5 transition hover:border-primary"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary font-[family-name:var(--font-rajdhani)] text-sm font-bold text-primary-foreground shadow-[0_0_10px_color-mix(in_oklch,var(--primary),transparent_65%)]">
        {user.initials}
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold">{user.name}</div>
        <div className="truncate text-[11px] font-semibold text-primary">
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
    <aside className="hidden md:col-start-1 md:row-span-2 md:row-start-1 md:flex md:min-h-0 md:flex-col md:overflow-y-auto md:border-r md:border-border md:bg-sidebar lg:w-[252px]">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
        <LogoHex />
        <div className="font-[family-name:var(--font-rajdhani)] text-base font-bold tracking-wide text-foreground">
          <span className="text-primary">BSCL</span>.gg
        </div>
      </div>

      {sections.map((section) => {
        const items = NAV_ITEMS.filter((n) => n.section === section);
        if (items.length === 0) return null;
        return (
          <div key={section} className="px-2.5 pt-4">
            <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
            {demoMode && section === "platform" && (
              <NavLink
                href="/demo"
                label={t.nav.demo}
                icon="demo"
                active={pathname === "/demo"}
              />
            )}
          </div>
        );
      })}

      <div className="mt-auto shrink-0 border-t border-border p-3">
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
    <header className="sticky top-0 z-[100] flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/95 px-3 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80 md:static md:col-start-2 md:row-start-1 md:gap-4 md:px-6 md:backdrop-blur-none lg:px-8">
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
          <>
            <span
              className="rounded-full border border-primary/45 bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary sm:px-2 sm:text-[10px]"
              title={t.demo.modeLabel}
            >
              {t.demo.modeLabel}
            </span>
            <DemoExitButton />
          </>
        )}

        <div
          className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary px-2 py-1 text-[11px] text-muted-foreground lg:flex"
          title={t.common.online}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-2 shadow-[0_0_5px_var(--chart-2)]" />
          {t.common.online}
        </div>

        <ButtonLink
          href="/play"
          size="sm"
          className="h-8 w-8 shrink-0 px-0 shadow-[0_0_14px_color-mix(in_oklch,var(--primary),transparent_65%)] sm:h-auto sm:w-auto sm:px-3.5"
          aria-label={t.common.joinQueue}
        >
          <Play className="sm:hidden" aria-hidden strokeWidth={2} />
          <span className="hidden max-w-[9rem] truncate sm:inline">{t.common.joinQueue}</span>
        </ButtonLink>
      </div>
    </header>
  );
}

export function Tabbar() {
  const pathname = usePathname();
  const t = useT();
  const tabs = NAV_ITEMS.filter((n) => n.mobile);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[200] flex h-[calc(4rem+env(safe-area-inset-bottom,0px))] border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-sm supports-[backdrop-filter]:bg-card/80 md:hidden">
      {tabs.map((tab) => {
        const active =
          tab.id === "more" ? isMobileMorePath(pathname) : pathname === tab.href;
        const labelKey = NAV_LABEL_KEYS[tab.id];
        const label =
          tab.id === "profile" ? t.nav.me : labelKey ? t.nav[labelKey] : tab.label;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 pt-1 text-[9px] font-semibold uppercase tracking-wide transition-colors sm:gap-1 sm:text-[10px]",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            {active && (
              <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b bg-primary shadow-[0_0_8px_color-mix(in_oklch,var(--primary),transparent_65%)]" />
            )}
            <NavIcon
              name={tab.icon}
              className={cn("h-5 w-5 transition-transform sm:h-[22px] sm:w-[22px]", active && "scale-110")}
            />
            <span className="max-w-full truncate">{label}</span>
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
  const t = useT();
  const resolvedUser = demoMode ? (demo?.shellUser ?? null) : user;

  return (
    <div
      data-demo-mode={demoMode ? "true" : undefined}
      className={cn(
        "relative flex min-h-dvh min-h-svh flex-col md:grid md:h-dvh md:min-h-0 md:grid-cols-[240px_minmax(0,1fr)] md:grid-rows-[56px_minmax(0,1fr)] md:overflow-hidden lg:grid-cols-[252px_minmax(0,1fr)]",
        demoMode && "demo-mode-root",
      )}
    >
      <a href="#main" className="skip-link">
        {t.common.skipToContent}
      </a>
      {demoMode && (
        <div className="fixed inset-x-0 top-0 z-[250] h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent md:hidden" aria-hidden />
      )}
      <Sidebar user={resolvedUser} demoMode={demoMode} />
      <Topbar demoMode={demoMode} />
      <main
        id="main"
        tabIndex={-1}
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-4 pb-[calc(4rem+env(safe-area-inset-bottom,0px)+1rem)] md:col-start-2 md:row-start-2 md:p-6 md:pb-6 lg:p-8",
          demoMode && "demo-mode-main",
        )}
      >
        <div className="mx-auto flex w-full max-w-none flex-col gap-4 md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
          {children}
        </div>
      </main>
      <Tabbar />
    </div>
  );
}
