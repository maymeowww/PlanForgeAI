import { cls } from "@/src/lib/utils";

export default function AlertsList() {
  const alerts = [
    { tone: "rose", title: "ORD-1012 เสี่ยงล่าช้า", desc: "ขาดวัตถุดิบ RM-ABS-01 (คงเหลือ 12%)" },
    { tone: "amber", title: "MC-07 Maintenance 14:00–16:00", desc: "แนะนำปรับคิวงานไป MC-05" },
    { tone: "blue", title: "Plan A ลด OT ได้ 1.5 ชม.", desc: "AI แนะนำเปลี่ยนลำดับ ORD-1007 ↔ ORD-1005" },
  ] as const;
  const toneMap: Record<typeof alerts[number]["tone"], string> = {
    rose: "bg-rose-50 dark:bg-rose-900/20",
    amber: "bg-amber-50 dark:bg-amber-900/20",
    blue: "bg-blue-50 dark:bg-blue-900/20",
  };
  const dotMap: Record<typeof alerts[number]["tone"], string> = {
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    blue: "bg-blue-600",
  };
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">การแจ้งเตือน (Alerts)</h3>
        <button className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1">ดูทั้งหมด</button>
      </div>
      <ul className="space-y-2">
        {alerts.map((a) => (
          <li key={a.title} className={cls("flex items-start gap-2 rounded-lg p-3", toneMap[a.tone])}>
            <span className={cls("mt-0.5 inline-block w-2 h-2 rounded-full", dotMap[a.tone])} />
            <div className="text-sm">
              <p className="font-medium">{a.title}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{a.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
