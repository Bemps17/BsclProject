"use client";

import {
  Card as ShadcnCard,
  CardAction,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useT } from "@/components/bscl/locale-provider";
import { RANK_STYLES, type RankKey } from "@/lib/constants";

export { Button, ButtonLink, buttonVariants } from "@/components/ui/button";
export { Input } from "@/components/ui/input";
export { Label } from "@/components/ui/label";
export {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const TAG_VARIANTS = {
  blue: "border-primary/25 bg-primary/10 text-primary",
  green: "border-chart-2/30 bg-chart-2/10 text-chart-2",
  gold: "border-chart-3/30 bg-chart-3/10 text-chart-3",
  muted: "border-border bg-secondary text-muted-foreground",
  red: "border-destructive/30 bg-destructive/10 text-destructive",
} as const;

export function RankBadge({
  rank,
  className,
}: {
  rank: RankKey;
  className?: string;
}) {
  const t = useT();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 font-[family-name:var(--font-rajdhani)] text-[10px] font-bold tracking-wide",
        RANK_STYLES[rank],
        className,
      )}
    >
      {t.ranks[rank]}
    </span>
  );
}

export function Tag({
  children,
  variant = "blue",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof TAG_VARIANTS;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("rounded-md text-[10px]", TAG_VARIANTS[variant], className)}>
      {children}
    </Badge>
  );
}

export function StatCell({
  label,
  value,
  sub,
  subClassName,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  subClassName?: string;
  valueClassName?: string;
}) {
  return (
    <ShadcnCard size="sm" className="relative overflow-hidden ring-border/60">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
      <div className="flex flex-col gap-1 px-3 py-3.5">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        <div
          className={cn(
            "font-[family-name:var(--font-rajdhani)] text-[28px] font-bold leading-none text-foreground",
            valueClassName,
          )}
        >
          {value}
        </div>
        {sub && (
          <div className={cn("text-[11px] text-muted-foreground", subClassName)}>{sub}</div>
        )}
      </div>
    </ShadcnCard>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ShadcnCard className={cn("gap-3 ring-border/60", className)}>
      <div className="flex flex-col gap-3 px-4">{children}</div>
    </ShadcnCard>
  );
}

export function CardHeader({
  title,
  accent,
  action,
}: {
  title: string;
  accent?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <CardTitle className="flex items-center gap-1.5 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold tracking-wide">
        {title}
        {accent && <span className="text-primary">{accent}</span>}
      </CardTitle>
      {action && <CardAction className="static col-auto row-auto self-auto justify-self-auto">{action}</CardAction>}
    </div>
  );
}

export function LogoHex({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "size-[30px] text-[11px]" : "size-9 text-xs";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-primary shadow-[0_0_12px_color-mix(in_oklch,var(--primary),transparent_72%)]",
        s,
      )}
      style={{ clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }}
    >
      <span className="font-[family-name:var(--font-rajdhani)] font-bold text-primary-foreground">BS</span>
    </div>
  );
}

export function MatchRow({
  result,
  score,
  meta,
  delta,
}: {
  result: "win" | "loss";
  score: string;
  meta: string;
  delta?: number;
}) {
  const t = useT();
  const win = result === "win";
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary px-3 py-2.5">
      <Badge
        variant="outline"
        className={cn(
          "min-w-[38px] justify-center rounded px-2 font-[family-name:var(--font-rajdhani)] text-[11px] font-bold",
          win
            ? "border-chart-2/30 bg-chart-2/10 text-chart-2"
            : "border-destructive/30 bg-destructive/10 text-destructive",
        )}
      >
        {win ? t.common.win : t.common.loss}
      </Badge>
      <span className="font-[family-name:var(--font-jetbrains)] text-sm font-bold tracking-widest">
        {score}
      </span>
      <span className="flex-1 pl-1 text-[11px] text-muted-foreground">{meta}</span>
      {delta != null && (
        <span
          className={cn(
            "font-[family-name:var(--font-jetbrains)] text-[13px] font-bold",
            delta >= 0 ? "text-chart-2" : "text-destructive",
          )}
        >
          {delta >= 0 ? `+${delta}` : delta}
        </span>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <Empty className="border-border bg-transparent py-6">
      <EmptyDescription className="text-[13px]">{message}</EmptyDescription>
    </Empty>
  );
}

export function TableScroll({
  children,
  minWidth = 480,
  className,
}: {
  children: React.ReactNode;
  minWidth?: number;
  className?: string;
}) {
  return (
    <ScrollArea className={cn("-mx-1 w-full", className)}>
      <div style={{ minWidth }}>{children}</div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
