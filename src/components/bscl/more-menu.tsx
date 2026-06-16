"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DemoExitButton } from "@/components/bscl/demo-exit-button";
import { useDemoOptional } from "@/components/bscl/demo-provider";
import { useT } from "@/components/bscl/locale-provider";
import { Card, CardHeader } from "@/components/bscl/ui";
import type { ShellUser } from "@/components/bscl/shell";
import { ChevronRight, NavIcon } from "@/components/bscl/icons";
import { MOBILE_MORE_PATHS, NAV_ITEMS, type NavPage } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_LABEL_KEYS: Record<string, keyof import("@/lib/i18n").Translations["nav"]> = {
  home: "home",
  play: "play",
  rankings: "rankings",
  teams: "teams",
  tournaments: "tournaments",
  matches: "matches",
  profile: "profile",
  tickets: "tickets",
  admin: "admin",
  demo: "demo",
  more: "more",
};

function MoreNavItem({
  item,
  label,
  active,
  demoMode,
}: {
  item: NavPage;
  label: string;
  active: boolean;
  demoMode?: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-semibold transition",
        active
          ? demoMode
            ? "border-[rgba(245,158,11,.45)] bg-[rgba(245,158,11,.12)] text-[#F59E0B]"
            : "border-[rgba(0,102,255,.45)] bg-[rgba(0,102,255,.1)] text-[#0066FF]"
          : "border-[#1E2D45] bg-[#162032] text-[#E5E7EB] hover:border-[#2A3F5F]",
      )}
    >
      <NavIcon name={item.icon} className="h-5 w-5 opacity-90" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {item.badge !== undefined && (
        <span
          className={cn(
            "rounded-full px-1.5 py-px text-[9px] font-bold text-white",
            item.badgeRed ? "bg-[#EF4444]" : demoMode ? "bg-[#F59E0B]" : "bg-[#0066FF]",
          )}
        >
          {item.badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 text-[#6B7280]" aria-hidden strokeWidth={2} />
    </Link>
  );
}

export function MoreMenu({
  demoMode,
  user: serverUser,
}: {
  demoMode?: boolean;
  user?: ShellUser;
}) {
  const pathname = usePathname();
  const t = useT();
  const demo = useDemoOptional();
  const resolvedDemo = demoMode ?? Boolean(demo);
  const user = resolvedDemo ? (demo?.shellUser ?? null) : (serverUser ?? null);

  const sections = ["platform", "account", "staff"] as const;
  const primaryMobileHrefs = new Set(
    NAV_ITEMS.filter((n) => n.mobile && n.id !== "more").map((n) => n.href),
  );

  const extraItems: NavPage[] = NAV_ITEMS.filter(
    (n) => n.id !== "more" && !primaryMobileHrefs.has(n.href),
  );

  if (resolvedDemo) {
    extraItems.unshift({
      id: "demo",
      href: "/demo",
      label: "Demo",
      icon: "demo",
      section: "platform",
    });
  }

  return (
    <>
      {resolvedDemo && (
        <section className="rounded-xl border border-[rgba(245,158,11,.35)] bg-[rgba(245,158,11,.06)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">
            {t.demo.modeLabel}
          </p>
          <p className="mt-1 text-sm text-[#9CA3AF]">{t.more.demoHint}</p>
          <div className="mt-3">
            <DemoExitButton />
          </div>
        </section>
      )}

      {user && (
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-xl border border-[#1E2D45] bg-[#162032] p-4 transition",
            resolvedDemo ? "hover:border-[#F59E0B]" : "hover:border-[#0066FF]",
          )}
        >
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-[family-name:var(--font-rajdhani)] text-sm font-bold",
              resolvedDemo
                ? "border-[#F59E0B] bg-[#F59E0B] text-[#0B0B0B]"
                : "border-[#0066FF] bg-[#0066FF] text-white",
            )}
          >
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-xs text-[#F59E0B]">
              ◆ {t.ranks[user.rankKey]} · {user.elo} {t.common.elo}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-[#6B7280]" aria-hidden strokeWidth={2} />
        </Link>
      )}

      {!user && (
        <Link
          href="/login"
          className={cn(
            "flex items-center justify-center rounded-xl border px-4 py-3.5 text-sm font-semibold",
            resolvedDemo
              ? "border-[rgba(245,158,11,.35)] text-[#F59E0B]"
              : "border-[#1E2D45] text-[#0066FF]",
          )}
        >
          {resolvedDemo ? t.common.guestSignIn : t.common.signInDiscord}
        </Link>
      )}

      {sections.map((section) => {
        const items = extraItems.filter((n) => n.section === section);
        if (items.length === 0) return null;

        return (
          <Card key={section}>
            <CardHeader title={t.sections[section]} />
            <div className="space-y-2">
              {items.map((item) => {
                const labelKey = NAV_LABEL_KEYS[item.id];
                const label = labelKey ? t.nav[labelKey] : item.label;
                const active =
                  pathname === item.href ||
                  (item.id === "demo" && pathname === "/demo");
                return (
                  <MoreNavItem
                    key={item.href}
                    item={item}
                    label={label}
                    active={active}
                    demoMode={resolvedDemo}
                  />
                );
              })}
            </div>
          </Card>
        );
      })}

      <p className="pb-2 text-center text-[11px] text-[#6B7280]">{t.more.footerHint}</p>
    </>
  );
}

export function isMobileMorePath(pathname: string): boolean {
  return MOBILE_MORE_PATHS.some((p) => pathname === p);
}
