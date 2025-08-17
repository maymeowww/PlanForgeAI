"use client";

import { useState } from "react";
import ImportButton from "@/src/components/ImportButton";
import OrderCard, { PendingOrder } from "@/src/components/planning/OrderCard";
import ScheduleLane, { LaneItem } from "@/src/components/planning/ScheduleLane";
import Badge from "@/src/components/planning/Badge";

/* ---------- การ์ด KPI ด้านบน ---------- */
function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border bg-white px-5 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
          <span className="text-lg">{icon}</span>
        </div>
        <div className="min-w-0">
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-2xl font-semibold leading-7">{value}</div>
          {subtitle && <div className="text-xs text-primary mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

export default function PlanningPage() {
  /* ---------- Pending Orders (ซ้าย) ---------- */
  const [orders, setOrders] = useState<PendingOrder[]>([
    { id: "WO-2024-006", product: "Product F", qty: 300, due: "Dec 20", note: "High Priority" },
    { id: "WO-2024-007", product: "Product G", qty: 450, due: "Dec 22" },
    { id: "WO-2024-008", product: "Product H", qty: 200, due: "Dec 25" },
    { id: "WO-2024-009", product: "Product A", qty: 600, due: "Dec 28" },
    { id: "WO-2024-010", product: "Product B", qty: 350, due: "Dec 30" },
  ]);

  /* ---------- Lanes (ขวา) ---------- */
  const [laneA, setLaneA] = useState<LaneItem[]>([
    { type: "current", title: "Current: WO-2024-001", product: "Product A", progress: "750/1000 pcs", meta: "Est. Complete: 14:30" },
    { type: "maintenance", title: "Maintenance", meta: "Preventive • 30 min\n16:30–17:00" },
  ]);
  const [laneB, setLaneB] = useState<LaneItem[]>([
    { type: "current", title: "Current: WO-2024-002", product: "Product B", progress: "320/800 pcs", meta: "Behind schedule: -2 hrs" },
  ]);
  const [laneC, setLaneC] = useState<LaneItem[]>([
    { type: "issue", title: "Issue: Material Jam", meta: "Downtime: 12 minutes\nTechnician dispatched" },
  ]);

  const insertToSlots = (items: LaneItem[], item: LaneItem, slotIndex: number) => {
    const arr = [...items];
    arr.splice(Math.min(slotIndex + 1, arr.length), 0, item);
    return arr;
  };

  const handleDropToLane = (lane: "A" | "B" | "C", orderId: string, slotIndex: number) => {
    const o = orders.find((x) => x.id === orderId);
    if (!o) return;

    const newItem: LaneItem = {
      type: "order",
      title: o.id,
      product: o.product,
      progress: `${o.qty} pcs`,
      meta: `Dropped to slot ${slotIndex + 1}`,
    };

    if (lane === "A") setLaneA((prev) => insertToSlots(prev, newItem, slotIndex));
    if (lane === "B") setLaneB((prev) => insertToSlots(prev, newItem, slotIndex));
    if (lane === "C") setLaneC((prev) => insertToSlots(prev, newItem, slotIndex));

    setOrders((prev) => prev.filter((x) => x.id !== orderId));
  };

  const resetPending = () => {
    setOrders([
      { id: "WO-2024-006", product: "Product F", qty: 300, due: "Dec 20", note: "High Priority" },
      { id: "WO-2024-007", product: "Product G", qty: 450, due: "Dec 22" },
      { id: "WO-2024-008", product: "Product H", qty: 200, due: "Dec 25" },
      { id: "WO-2024-009", product: "Product A", qty: 600, due: "Dec 28" },
      { id: "WO-2024-010", product: "Product B", qty: 350, due: "Dec 30" },
    ]);
  };

  /* ---------- ข้อมูลส่วนล่าง Capacity & Materials ---------- */
  const capacity = [
    { line: "Line A Utilization", planned: 8, available: 8, percent: 100, status: "Optimal", color: "text-emerald-600" },
    { line: "Line B Utilization", planned: 6.5, available: 8, percent: 81, status: "Under-utilized", color: "text-amber-500" },
    { line: "Line C Utilization", planned: 0, available: 8, percent: 0, status: "Stopped", color: "text-rose-500" },
  ];

  const materials = [
    { name: "Raw Material A", required: "500 kg", available: "750 kg", note: "Sufficient", color: "text-emerald-600" },
    { name: "Raw Material B", required: "300 kg", available: "320 kg", note: "Low stock", color: "text-amber-500" },
    { name: "Packaging Material", required: "1000 units", available: "200 units", note: "Shortage", color: "text-rose-500" },
  ];

  const handleOptimizeCapacity = () => {
    console.log("Optimize Capacity Allocation");
  };
  const handleGeneratePO = () => {
    console.log("Generate Purchase Orders");
  };

  /* ---------- UI ---------- */
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      {/* หัวหน้าเพจ + ปุ่ม + KPI */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">AI Production Planning</h1>
        <div className="flex flex-wrap gap-2">
          <ImportButton
            label="Import CSV/Excel"
            onFilesSelected={(files) => {
              // TODO: parse ไฟล์แล้ว map ใส่ orders / lanes
              console.log("planning import:", files[0]?.name);
            }}
          />
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#8b5cf6] px-4 py-2 text-white hover:opacity-90">
            🤖 AI Generate Plan
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2 text-white hover:opacity-90">
            + New Plan
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#10b981] px-4 py-2 text-white hover:opacity-90">
            Save Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<span>📄</span>} title="Active Plans" value="12" subtitle="3 lines running" />
        <StatCard icon={<span>✅</span>} title="Plan Efficiency" value="94%" subtitle="+2% vs target" />
        <StatCard icon={<span>⏰</span>} title="Pending Orders" value={`${orders.length}`} subtitle="Need scheduling" />
        <StatCard icon={<span>🎯</span>} title="AI Suggestions" value="5" subtitle="Optimization ready" />
      </div>

      {/* คอนเทนต์หลัก 2 คอลัมน์ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Pending Orders */}
        <section className="lg:col-span-4 flex flex-col">
          <div className="rounded-xl border bg-white p-4 shadow-sm h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-3">Pending Orders</h2>
            <div className="space-y-3">
              {orders.map((o, idx) => (
                <OrderCard key={o.id} order={o} active={idx === 0} />
              ))}
              {orders.length === 0 && (
                <div className="rounded-lg border p-4 text-center text-gray-500 bg-white">
                  No pending orders — Good job! 🎉
                </div>
              )}
            </div>
            <div className="mt-4">
              <button onClick={resetPending} className="text-sm text-gray-600 hover:text-gray-800 underline">
                Reset demo
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT: Schedule Board */}
        <section className="lg:col-span-8">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Drag &amp; Drop Production Schedule</h2>
              <div className="flex gap-2">
                <button className="rounded-md border px-3 py-1 text-xs bg-primary/10 text-primary">Today</button>
                <button className="rounded-md border px-3 py-1 text-xs">Week</button>
                <button className="rounded-md border px-3 py-1 text-xs">Month</button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 text-[13px] text-blue-700 rounded-md p-3 mb-4">
              <span className="mr-2">💡</span>
              <span className="font-medium">How to use:</span>{" "}
              Drag orders from <span className="font-medium">“Pending Orders”</span> แล้ววางในช่องฝั่งขวา
              ระบบจะเช็คความเข้ากันได้ให้อัตโนมัติ
            </div>

            <div className="space-y-5">
              <ScheduleLane
                title="Line A - Injection Molding"
                rightMeta={<span className="text-xs text-gray-500">Capacity: 150 pcs/hr • Compatible: A, F, G, B</span>}
                status={<Badge color="green" text="Running" />}
                items={laneA}
                slots={[{ label: "14:30 - 18:00" }, { label: "17:00 - 20:00" }]}
                laneId="A"
                onDropOrder={handleDropToLane}
              />
              <ScheduleLane
                title="Line B - Assembly"
                rightMeta={<span className="text-xs text-gray-500">Capacity: 120 pcs/hr • Compatible: F, B, H</span>}
                status={<Badge color="amber" text="Low Efficiency" />}
                items={laneB}
                slots={[{ label: "16:00 - 20:00" }, { label: "20:00 - 24:00" }]}
                laneId="B"
                onDropOrder={handleDropToLane}
              />
              <ScheduleLane
                title="Line C - Packaging"
                rightMeta={<span className="text-xs text-gray-500">Capacity: 200 pcs/hr • Compatible: A, H</span>}
                status={<Badge color="rose" text="Stopped" />}
                items={laneC}
                slots={[{ label: "After repair - 18:00" }, { label: "18:00 - 22:00" }]}
                laneId="C"
                onDropOrder={handleDropToLane}
              />
            </div>
          </div>
        </section>
      </div>

      {/* SECTION: Capacity & Material (ใต้ Pending/DragDrop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capacity Planning */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Capacity Planning</h3>
          <div className="space-y-3">
            {capacity.map((c) => (
              <div key={c.line} className="rounded-lg bg-gray-50/60 border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-800">{c.line}</div>
                  <div className={`font-semibold ${c.color}`}>{c.percent}%</div>
                </div>
                <div className="text-sm text-gray-600">
                  {c.planned} hours planned / {c.available} hours available
                </div>
                <div className="text-xs text-gray-400">{c.status}</div>
              </div>
            ))}
          </div>
          <button
            onClick={handleOptimizeCapacity}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#8b5cf6] px-4 py-2 text-white hover:opacity-90"
          >
            <span>🤖</span> Optimize Capacity Allocation
          </button>
        </div>

        {/* Material Requirements */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Material Requirements</h3>
          <div className="space-y-3">
            {materials.map((m) => (
              <div key={m.name} className="rounded-lg bg-gray-50/60 border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-800">{m.name}</div>
                  <div className="text-right">
                    <div className={`font-semibold ${m.color}`}>Available: {m.available}</div>
                    <div className="text-[12px] text-gray-400">{m.note}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">Required: {m.required}</div>
              </div>
            ))}
          </div>
          <button
            onClick={handleGeneratePO}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#f59e0b] px-4 py-2 text-white hover:opacity-90"
          >
            Generate Purchase Orders
          </button>
        </div>
      </div>
    </main>
  );
}
