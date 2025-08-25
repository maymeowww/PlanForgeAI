import { cls } from "@/src/lib/utils";

interface InventoryItem {
  code: string; // e.g., RM-ABS-01
  current: number;
  capacity: number;
  status: "ok" | "warn" | "low";
}

export default function MaterialCard() {
  const data: InventoryItem[] = [
    { code: "RM-ABS-01", current: 1240, capacity: 10000, status: "low" },
    { code: "RM-PLA-02", current: 4200, capacity: 6000, status: "ok" },
    { code: "RM-NYL-09", current: 2300, capacity: 3500, status: "warn" },
  ];
  const barCls = (s: InventoryItem["status"]) => (s === "ok" ? "bg-emerald-500" : s === "warn" ? "bg-amber-500" : "bg-rose-500");
  const labelCls = (s: InventoryItem["status"]) => (s === "ok" ? "text-emerald-600 dark:text-emerald-400" : s === "warn" ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400");

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-800 shadow p-4">
      <h2 className="font-semibold mb-3">วัตถุดิบ & สต๊อก</h2>
      <div className="space-y-3">
        {data.map((it) => {
          const pct = Math.round((it.current / it.capacity) * 100);
          return (
            <div key={it.code}>
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium">{it.code}</div>
                <div className="text-slate-500 dark:text-slate-400">{it.current.toLocaleString()} / {it.capacity.toLocaleString()} kg</div>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div className={cls("h-full", barCls(it.status))} style={{ width: `${pct}%` }} />
              </div>
              <div className={cls("mt-1 text-xs", labelCls(it.status))}>
                {it.status === "ok" ? "เพียงพอ" : it.status === "warn" ? "เฝ้าระวัง" : "ต่ำกว่าขีดจำกัด (Min 20%)"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}