import { Card, Tag } from "@/components/bscl/ui";

export default function MatchesPage() {
  const rows = [
    ["#041", "ShadowK1ng+4", "LIVE", "Specter99+4", "Live", "green"],
    ["#040", "NightCrwlr+4", "LIVE", "AcidReign+4", "Live", "green"],
    ["#039", "FrostByte+4", "13–09", "VoidRuner+4", "Pending", "gold"],
    ["#038", "xGhost_BR+4", "13–07", "RazorEdge+4", "Confirmed", "green"],
    ["#037", "Specter99+4", "07–13", "ShadowK1ng+4", "Confirmed", "green"],
  ] as const;

  return (
    <Card>
      <h2 className="mb-3.5 font-[family-name:var(--font-rajdhani)] text-[15px] font-bold">
        Match History <span className="text-[#0066FF]">· S1</span>
      </h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#1E2D45] text-left text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
            <th className="px-2.5 py-2">ID</th>
            <th className="px-2.5 py-2">Alpha</th>
            <th className="px-2.5 py-2">Score</th>
            <th className="px-2.5 py-2">Bravo</th>
            <th className="px-2.5 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([id, alpha, score, bravo, status, variant]) => (
            <tr key={id}>
              <td className="border-b border-[#1E2D45] px-2.5 py-2.5 font-[family-name:var(--font-jetbrains)] text-[11px] text-[#6B7280]">{id}</td>
              <td className="border-b border-[#1E2D45] px-2.5 py-2.5">{alpha}</td>
              <td className={`border-b border-[#1E2D45] px-2.5 py-2.5 font-[family-name:var(--font-jetbrains)] font-bold ${score.includes("13–07") ? "text-[#22C55E]" : score === "07–13" ? "text-[#EF4444]" : ""}`}>
                {score}
              </td>
              <td className="border-b border-[#1E2D45] px-2.5 py-2.5">{bravo}</td>
              <td className="border-b border-[#1E2D45] px-2.5 py-2.5">
                <Tag variant={variant}>{status}</Tag>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
