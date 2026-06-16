"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoHex } from "@/components/bscl/ui";
import { DemoExitButton } from "@/components/bscl/demo-exit-button";
import { isMobileMorePath } from "@/components/bscl/more-menu";
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
  more: "more",
};

function NavLink({
  href,
  label,
  icon,
  badge,
  badgeRed,
  active,
  demoMode,
}: {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  badgeRed?: boolean;
  active: boolean;
  demoMode?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
        active
          ? demoMode
            ? "-ml-0.5 border-l-2 border-[#F59E0B] bg-[rgba(245,158,11,.12)] text-[#F59E0B] shadow-[inset_0_0_18px_rgba(245,158,11,.08)]"
            : "-ml-0.5 border-l-2 border-[#0066FF] bg-[rgba(0,102,255,.1)] text-[#0066FF] shadow-[inset_0_0_18px_rgba(0,102,255,.06)]"
          : demoMode
            ? "text-[#6B7280] hover:bg-[rgba(245,158,11,.08)] hover:text-[#E5E7EB]"
            : "text-[#6B7280] hover:bg-[rgba(0,102,255,.1)] hover:text-[#E5E7EB]",
      )}
    >
      <span className="w-[15px] shrink-0 text-center opacity-80">{icon}</span>
      <span className="truncate">{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            "ml-auto rounded-full px-1.5 py-px text-[9px] font-bold text-white",
            badgeRed ? "bg-[#EF4444]" : demoMode ? "bg-[#F59E0B]" : "bg-[#0066FF]",
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
        className={cn(
          "flex items-center justify-center rounded-lg border bg-[#162032] p-2.5 text-xs font-semibold transition",
          demoMode
            ? "border-[rgba(245,158,11,.35)] text-[#F59E0B] hover:border-[#F59E0B]"
            : "border-[#1E2D45] text-[#0066FF] hover:border-[#0066FF]",
        )}
      >
        {demoMode ? t.common.guestSignIn : t.common.signInDiscord}
      </Link>
    );
  }

  return (
    <Link
      href="/profile"
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-[#1E2D45] bg-[#162032] p-2.5 transition",
        demoMode ? "hover:border-[#F59E0B]" : "hover:border-[#0066FF]",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-[family-name:var(--font-rajdhani)] text-sm font-bold text-[#0B0B0B]",
          demoMode
            ? "border-[#F59E0B] bg-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,.35)]"
            : "border-[#0066FF] bg-[#0066FF] text-white shadow-[0_0_10px_rgba(0,102,255,.28)]",
        )}
      >
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
    <aside
      className={cn(
        "hidden md:col-start-1 md:row-span-2 md:row-start-1 md:flex md:min-h-0 md:flex-col md:overflow-y-auto md:border-r md:bg-[#111827] lg:w-[252px]",
        demoMode ? "border-[rgba(245,158,11,.25)]" : "border-[#1E2D45]",
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center gap-2.5 border-b px-4",
          demoMode ? "border-[rgba(245,158,11,.25)]" : "border-[#1E2D45]",
        )}
      >
        <LogoHex />
        <div className="font-[family-name:var(--font-rajdhani)] text-base font-bold tracking-wide text-white">
          <span className={demoMode ? "text-[#F59E0B]" : "text-[#0066FF]"}>BSCL</span>.gg
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
                  demoMode={demoMode}
                />
              );
            })}
            {demoMode && section === "platform" && (
              <NavLink
                href="/demo"
                label={t.nav.demo}
                icon="◎"
                active={pathname === "/demo"}
                demoMode={demoMode}
              />
            )}
          </div>
        );
      })}

      <div
        className={cn(
          "mt-auto shrink-0 border-t p-3",
          demoMode ? "border-[rgba(245,158,11,.25)]" : "border-[#1E2D45]",
        )}
      >
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
    <header
      className={cn(
        "sticky top-0 z-[100] flex h-14 shrink-0 items-center gap-2 border-b bg-[#111827]/95 px-3 backdrop-blur-sm supports-[backdrop-filter]:bg-[#111827]/80 md:static md:col-start-2 md:row-start-1 md:gap-4 md:px-6 md:backdrop-blur-none lg:px-8",
        demoMode ? "border-[rgba(245,158,11,.25)]" : "border-[#1E2D45]",
      )}
    >
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
              className="rounded-full border border-[rgba(245,158,11,.45)] bg-[rgba(245,158,11,.15)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#F59E0B] sm:px-2 sm:text-[10px]"
              title={t.demo.modeLabel}
            >
              {t.demo.modeLabel}
            </span>
            <DemoExitButton />
          </>
        )}

        <div
          className="hidden items-center gap-1.5 rounded-full border border-[#1E2D45] bg-[#162032] px-2 py-1 text-[11px] text-[#6B7280] lg:flex"
          title={t.common.online}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22C55E] shadow-[0_0_5px_#22C55E]" />
          {t.common.online}
        </div>

        <Link
          href="/play"
          aria-label={t.common.joinQueue}
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition active:scale-[.97] sm:h-auto sm:w-auto sm:px-3.5 sm:py-1.5 sm:text-xs sm:font-semibold",
            demoMode
              ? "bg-[#F59E0B] text-[#0B0B0B] shadow-[0_0_14px_rgba(245,158,11,.35)]"
              : "bg-[#0066FF] text-white shadow-[0_0_14px_rgba(0,102,255,.28)]",
          )}
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

export function Tabbar({ demoMode }: { demoMode?: boolean }) {
  const pathname = usePathname();
  const t = useT();
  const tabs = NAV_ITEMS.filter((n) => n.mobile);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-[200] flex h-[calc(4rem+env(safe-area-inset-bottom,0px))] border-t bg-[#111827]/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-sm supports-[backdrop-filter]:bg-[#111827]/80 md:hidden",
        demoMode ? "border-[rgba(245,158,11,.25)]" : "border-[#1E2D45]",
      )}
    >
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
              active
                ? demoMode
                  ? "text-[#F59E0B]"
                  : "text-[#0066FF]"
                : "text-[#6B7280]",
            )}
          >
            {active && (
              <span
                className={cn(
                  "absolute top-0 h-0.5 w-8 -translate-x-1/2 rounded-b left-1/2",
                  demoMode
                    ? "bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,.35)]"
                    : "bg-[#0066FF] shadow-[0_0_8px_rgba(0,102,255,.28)]",
                )}
              />
            )}
            <span className={cn("text-lg leading-none transition-transform sm:text-xl", active && "scale-110")}>
              {tab.icon}
            </span>
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
  const resolvedUser = demoMode ? (demo?.shellUser ?? null) : user;

  return (
    <div
      data-demo-mode={demoMode ? "true" : undefined}
      className={cn(
        "flex min-h-svh flex-col md:grid md:h-svh md:min-h-0 md:grid-cols-[240px_minmax(0,1fr)] md:grid-rows-[56px_minmax(0,1fr)] md:overflow-hidden lg:grid-cols-[252px_minmax(0,1fr)]",
        demoMode && "demo-mode-root",
      )}
    >
      {demoMode && (
        <div className="fixed inset-x-0 top-0 z-[250] h-0.5 bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent md:hidden" aria-hidden />
      )}
      <Sidebar user={resolvedUser} demoMode={demoMode} />
      <Topbar demoMode={demoMode} />
      <main
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-4 pb-[calc(4rem+env(safe-area-inset-bottom,0px)+1rem)] md:col-start-2 md:row-start-2 md:p-6 md:pb-6 lg:p-8",
          demoMode && "demo-mode-main",
        )}
      >
        <div className="mx-auto flex w-full max-w-none flex-col gap-4 md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
          {children}
        </div>
      </main>
      <Tabbar demoMode={demoMode} />
    </div>
  );
}
