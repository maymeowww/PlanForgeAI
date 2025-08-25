import { cls } from "@/src/lib/utils";
import { useState } from "react";

type MachineStatus = "Active" | "Idle" | "Setup" | "Maintenance";

interface Machine {
  id: string;
  status: MachineStatus;
  next?: string; // e.g., "ORD-1007 (14:10)"
  utilization?: number; // 0..100
  progress?: number; // 0..100 (for setup)
}

function MachineCard({ m }: { m: Machine }) {
  const badge = (s: MachineStatus) => {
    if (s === "Active") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    if (s === "Setup") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    if (s === "Maintenance") return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
    return "bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200";
  };
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{m.id}</h4>
        <span className={cls("text-xs px-2 py-0.5 rounded-full", badge(m.status))}>{m.status}</span>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{m.next ?? (m.status === "Idle" ? "Waiting job" : "")}</p>
      <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div className={cls("h-full", m.status === "Setup" ? "bg-amber-500" : m.status === "Active" ? "bg-blue-600" : "bg-slate-400")} style={{ width: `${m.status === "Setup" ? (m.progress ?? 0) : (m.utilization ?? 0)}%` }} />
      </div>
      <div className="mt-2 text-xs text-slate-500">{m.status === "Setup" ? `Progress ${m.progress ?? 0}%` : `Utilization ${m.utilization ?? 0}%`}</div>
    </div>
  );
}


export default function MachineStatus() {
  const [filter, setFilter] = useState<MachineStatus | "ทั้งหมด">("ทั้งหมด");
  const machines: Machine[] = [
    { id: "MC-01", status: "Active", next: "Next: ORD-1007 (14:10)", utilization: 86 },
    { id: "MC-02", status: "Setup", next: "Changeover 12 min", progress: 48 },
    { id: "MC-03", status: "Idle", utilization: 12 },
  ];
  const list = machines.filter((m) => (filter === "ทั้งหมด" ? true : m.status === filter));

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-800 shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">สถานะเครื่องจักร (Machine Status)</h2>
        <div className="flex items-center gap-2">
          {(["ทั้งหมด", "Active", "Idle", "Maintenance", "Setup"] as const).map((k) => (
            <button key={k} className={cls("text-xs rounded-lg border px-2 py-1", filter === k ? "bg-slate-100 dark:bg-slate-700 border-slate-400 dark:border-slate-600" : "border-slate-300 dark:border-slate-700")} onClick={() => setFilter(k as any)}>
              {k}
            </button>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((m) => (
          <MachineCard key={m.id} m={m} />
        ))}
      </div>
    </section>
  );
}