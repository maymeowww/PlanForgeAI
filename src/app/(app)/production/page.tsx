"use client";

import ImportButton from "@/src/components/shared/button/ImportButton";
import Card from "@/src/components/shared/card/Card";
import clsx from "clsx";
import { useEffect, useState } from "react";

/* ---------- small UI helpers ---------- */
function StatusBadge({
  color = "gray",
  children,
}: {
  color?: "emerald" | "amber" | "rose" | "sky" | "gray";
  children: React.ReactNode;
}) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    gray: "bg-gray-50 text-gray-700 ring-gray-200",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ring-1 ${map[color]}`}>
      {children}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-gray-100">
      <div
        className="h-2 rounded-full bg-emerald-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ===================== Production Page ===================== */
export default function ProductionPage() {
  const [hasShadow, setHasShadow] = useState(false);

  useEffect(() => {
    const onScroll = () => setHasShadow(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const workOrders = [
    { id: "WO-2024-021", product: "Product A", qty: 1200, done: 750, line: "Line A", status: "Running" as const },
    { id: "WO-2024-022", product: "Product B", qty: 800, done: 320, line: "Line B", status: "Low Efficiency" as const },
    { id: "WO-2024-023", product: "Product H", qty: 200, done: 0, line: "Line C", status: "Stopped" as const },
    { id: "WO-2024-024", product: "Product F", qty: 600, done: 0, line: "Line A", status: "Queued" as const },
  ];

  const lines = [
    { name: "Line A - Injection", rate: 92, oee: 85, down: 5 },
    { name: "Line B - Assembly", rate: 68, oee: 72, down: 18 },
    { name: "Line C - Packaging", rate: 0, oee: 0, down: 100 },
  ];

  const cardData = [
    { icon: "⚡", title: "Production Rate", value: "135", subtitle: "pcs/hour (+8%)" },
    { icon: "❌", title: "NG Rate", value: "3.2%", subtitle: "+0.5% from yesterday" },
    { icon: "⏱️", title: "Downtime", value: "45", subtitle: "minutes today" },
    { icon: "🎯", title: "Target Achievement", value: "92%", subtitle: "1104/1200 pcs" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* ====== Header (buttons in one line, no horizontal scroll) ====== */}
      <header
        className={clsx(
          "sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 py-2",
          hasShadow ? "shadow-sm" : "shadow-none"
        )}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-2">
          <h1 className="text-xl md:text-2xl font-bold leading-tight truncate">Production</h1>

          <div className="flex items-center gap-3 whitespace-nowrap">
            <button className="inline-flex items-center rounded-lg bg-purple-600 px-5 py-2 text-white hover:opacity-90 transition">
              AI Generate Plan
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:opacity-90 transition">
              + New Plan
            </button>
            <button className="inline-flex items-center rounded-lg bg-green-600 px-5 py-2 text-white hover:opacity-90 transition">
              Save Plan
            </button>

            <ImportButton
              label="Import CSV/Excel"
              onFilesSelected={(files) => {
                console.log("production import:", files[0]?.name);
              }}
            />
          </div>
        </div>
      </header>

      {/* ====== Body ====== */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardData.map((card, index) => (
            <Card
              key={index}
              icon={<span>{card.icon}</span>}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
            />
          ))}
        </div>

        {/* Main two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Work Orders */}
          <section className="lg:col-span-7">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Work Orders</h2>
                <div className="text-sm text-gray-500">{workOrders.length} orders</div>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-gray-600">
                      <th className="px-4 py-2 text-left font-medium">WO</th>
                      <th className="px-4 py-2 text-left font-medium">Product</th>
                      <th className="px-4 py-2 text-right font-medium">Done / Plan</th>
                      <th className="px-4 py-2 text-left font-medium">Line</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {workOrders.map((w) => {
                      const pct = Math.round((w.done / w.qty) * 100);
                      return (
                        <tr key={w.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-900">{w.id}</td>
                          <td className="px-4 py-2 text-gray-700">{w.product}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-gray-700 tabular-nums">
                                {w.done}/{w.qty}
                              </span>
                              <div className="w-28">
                                <ProgressBar value={pct} />
                              </div>
                              <span className="w-10 text-right tabular-nums text-gray-500">
                                {pct}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-gray-700">{w.line}</td>
                          <td className="px-4 py-2">
                            {w.status === "Running" && (
                              <StatusBadge color="emerald">Running</StatusBadge>
                            )}
                            {w.status === "Low Efficiency" && (
                              <StatusBadge color="amber">Low Efficiency</StatusBadge>
                            )}
                            {w.status === "Stopped" && (
                              <StatusBadge color="rose">Stopped</StatusBadge>
                            )}
                            {w.status === "Queued" && (
                              <StatusBadge color="sky">Queued</StatusBadge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* RIGHT: Line Performance */}
          <section className="lg:col-span-5">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Line Performance</h2>

              <div className="space-y-4">
                {lines.map((l) => (
                  <div key={l.name} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="font-semibold text-gray-800">{l.name}</div>
                      <StatusBadge color={l.rate > 80 ? "emerald" : l.rate > 0 ? "amber" : "rose"}>
                        {l.rate > 80 ? "Optimal" : l.rate > 0 ? "Attention" : "Stopped"}
                      </StatusBadge>
                    </div>

                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Output Rate</div>
                      <ProgressBar value={l.rate} />
                      <div className="text-xs text-gray-500 mt-1">{l.rate}%</div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">OEE</div>
                        <ProgressBar value={l.oee} />
                        <div className="text-xs text-gray-500 mt-1">{l.oee}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Downtime</div>
                        <ProgressBar value={l.down} />
                        <div className="text-xs text-gray-500 mt-1">{l.down}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Bottom actions */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              Use Import to update work orders and line performance from your MES / CSV / Excel.
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                Export Report
              </button>
              <button className="rounded-lg bg-[#10b981] px-4 py-2 text-sm text-white hover:opacity-90">
                Start Shift
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
