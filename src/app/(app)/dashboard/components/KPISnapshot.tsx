export default function KPISnapshot() {
  const items = [
    { label: "Lead Time (avg)", value: "6.4 h" },
    { label: "On-time Delivery", value: "93%" },
    { label: "Setup Loss", value: "11%" },
    { label: "OT (hrs)", value: "2.0" },
  ];
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 shadow p-4">
      <h3 className="font-semibold mb-2">KPI Snapshot</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((x) => (
          <div key={x.label} className="rounded-xl bg-slate-50 dark:bg-slate-700 p-3">
            <div className="text-xs text-slate-500">{x.label}</div>
            <div className="text-lg font-semibold">{x.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}