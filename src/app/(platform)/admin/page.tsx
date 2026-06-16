import { Card, StatCell, Tag } from "@/components/bscl/ui";

const PANELS = [
  ["👥", "Players", "Manage, ban, roles"],
  ["🏆", "Tournaments", "Brackets, results"],
  ["📋", "Matches", "Override, disputes"],
  ["📰", "News", "Publish, edit"],
  ["🔔", "Sanctions", "Bans, mutes, warns"],
  ["📊", "Audit Log", "All activity"],
  ["⚙️", "Season Config", "ELO, resets"],
  ["🤖", "Bot Status", "Discord controls"],
];

export default function AdminPage() {
  return (
    <>
      <div className="flex items-center gap-2">
        <h2 className="font-[family-name:var(--font-rajdhani)] text-[22px] font-bold">Admin Panel</h2>
        <Tag variant="red">Staff Only</Tag>
      </div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCell label="Users" value="1,247" />
        <StatCell label="Tickets" value="7" valueClassName="text-[#EF4444]" />
        <StatCell label="Bans" value="3" />
        <StatCell label="Pending" value="2" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {PANELS.map(([icon, title, sub]) => (
          <Card key={title} className="flex cursor-pointer items-center gap-2.5 p-3.5">
            <span className="text-[22px]">{icon}</span>
            <div>
              <div className="text-[13px] font-semibold">{title}</div>
              <div className="text-[11px] text-[#6B7280]">{sub}</div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
