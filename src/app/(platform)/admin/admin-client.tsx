"use client";

import { Card, StatCell, Tag } from "@/components/bscl/ui";
import { useT } from "@/components/bscl/locale-provider";

const PANEL_ICONS = ["👥", "🏆", "📋", "📰", "🔔", "📊", "⚙️", "🤖"];

export function AdminClient({
  stats,
}: {
  stats: {
    users: number;
    openTickets: number;
    activeBans: number;
    pendingMatches: number;
  };
}) {
  const t = useT();

  return (
    <>
      <div className="flex items-center gap-2">
        <h2 className="font-[family-name:var(--font-rajdhani)] text-[22px] font-bold">{t.admin.title}</h2>
        <Tag variant="red">{t.common.staffOnly}</Tag>
      </div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label={t.admin.users} value={stats.users} />
        <StatCell label={t.admin.tickets} value={stats.openTickets} valueClassName={stats.openTickets > 0 ? "text-[#EF4444]" : undefined} />
        <StatCell label={t.admin.bans} value={stats.activeBans} />
        <StatCell label={t.admin.pending} value={stats.pendingMatches} />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {t.admin.panels.map((panel, i) => (
          <Card key={panel.title} className="flex cursor-pointer items-center gap-2.5 p-3.5">
            <span className="text-[22px]">{PANEL_ICONS[i]}</span>
            <div>
              <div className="text-[13px] font-semibold">{panel.title}</div>
              <div className="text-[11px] text-[#6B7280]">{panel.sub}</div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
