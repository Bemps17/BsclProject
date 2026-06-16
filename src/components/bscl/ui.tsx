import { cn } from "@/lib/utils";
import { RANK_LABELS, RANK_STYLES, type RankKey } from "@/lib/constants";

export function RankBadge({
  rank,
  className,
}: {
  rank: RankKey;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide font-[family-name:var(--font-rajdhani)]",
        RANK_STYLES[rank],
        className,
      )}
    >
      {RANK_LABELS[rank]}
    </span>
  );
}

export function Tag({
  children,
  variant = "blue",
  className,
}: {
  children: React.ReactNode;
  variant?: "blue" | "green" | "gold" | "muted" | "red";
  className?: string;
}) {
  const styles = {
    blue: "bg-[rgba(0,102,255,.1)] text-[#0066FF] border-[rgba(0,102,255,.22)]",
    green: "bg-[rgba(34,197,94,.1)] text-[#22C55E] border-[rgba(34,197,94,.25)]",
    gold: "bg-[rgba(245,158,11,.1)] text-[#F59E0B] border-[rgba(245,158,11,.25)]",
    muted: "bg-[#162032] text-[#6B7280] border-[#1E2D45]",
    red: "bg-[rgba(239,68,68,.1)] text-[#EF4444] border-[rgba(239,68,68,.25)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
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
    <div className="relative overflow-hidden rounded-[10px] border border-[#1E2D45] bg-[#111827] p-3.5">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-[#0066FF]" />
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">
        {label}
      </div>
      <div
        className={cn(
          "font-[family-name:var(--font-rajdhani)] text-[28px] font-bold leading-none text-white",
          valueClassName,
        )}
      >
        {value}
      </div>
      {sub && (
        <div className={cn("mt-0.5 text-[11px] text-[#6B7280]", subClassName)}>{sub}</div>
      )}
    </div>
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
    <div
      className={cn(
        "rounded-xl border border-[#1E2D45] bg-[#111827] p-4",
        className,
      )}
    >
      {children}
    </div>
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
    <div className="mb-3.5 flex items-center justify-between">
      <h2 className="flex items-center gap-1.5 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold tracking-wide">
        {title}
        {accent && <span className="text-[#0066FF]">{accent}</span>}
      </h2>
      {action}
    </div>
  );
}

export function LogoHex({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-[30px] w-[30px] text-[11px]" : "h-9 w-9 text-xs";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-[#0066FF] shadow-[0_0_12px_rgba(0,102,255,.28)]",
        s,
      )}
      style={{ clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }}
    >
      <span className="font-[family-name:var(--font-rajdhani)] font-bold text-white">BS</span>
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
  const win = result === "win";
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-[#1E2D45] bg-[#162032] px-3 py-2.5">
      <span
        className={cn(
          "min-w-[38px] rounded px-2 py-0.5 text-center font-[family-name:var(--font-rajdhani)] text-[11px] font-bold",
          win
            ? "border border-[rgba(34,197,94,.28)] bg-[rgba(34,197,94,.14)] text-[#22C55E]"
            : "border border-[rgba(239,68,68,.25)] bg-[rgba(239,68,68,.12)] text-[#EF4444]",
        )}
      >
        {win ? "WIN" : "LOSS"}
      </span>
      <span className="font-[family-name:var(--font-jetbrains)] text-sm font-bold tracking-widest">
        {score}
      </span>
      <span className="flex-1 pl-1 text-[11px] text-[#6B7280]">{meta}</span>
      {delta != null && (
        <span
          className={cn(
            "font-[family-name:var(--font-jetbrains)] text-[13px] font-bold",
            delta >= 0 ? "text-[#22C55E]" : "text-[#EF4444]",
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
    <p className="py-6 text-center text-[13px] text-[#6B7280]">{message}</p>
  );
}
