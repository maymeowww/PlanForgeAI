"use client";

import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

import Card from "@/src/components/shared/card/Card";
import SuggestionCard from "./components/SuggestionCard";
import MaterialCard from "./components/MaterialCard";
import CapacityCard from "./components/CapacityCard";
import DropSlot from "./components/DropSlot";
import PageHeader from "@/src/components/layout/PageHeader";

/** ---------- Types ---------- */
type OrderItem = {
  id: string;           // e.g. WO-2024-006
  product: string;      // e.g. Product F
  qty: number;          // e.g. 300
  due: string;          // e.g. 2024-12-20
  priority?: "high" | "normal";
};

type Slot = {
  id: string;
  label: string;        // e.g. "14:30 - 18:00"
  kind?: "maintenance" | "info" | "open"; // visual only
  orderId?: string;     // occupied by which order
};

type Line = "A" | "B" | "C";
type ScheduleState = Record<Line, Slot[]>;

/** ---------- Mock data ---------- */
const initialOrders: OrderItem[] = [
  { id: "WO-2024-006", product: "Product F", qty: 300, due: "2024-12-20", priority: "high" },
  { id: "WO-2024-007", product: "Product G", qty: 450, due: "2024-12-22" },
  { id: "WO-2024-008", product: "Product H", qty: 200, due: "2024-12-25" },
  { id: "WO-2024-009", product: "Product A", qty: 600, due: "2024-12-28" },
  { id: "WO-2024-010", product: "Product B", qty: 350, due: "2024-12-30" },
];

const initialSchedule: ScheduleState = {
  A: [
    { id: "A-current", label: "Current", kind: "info" },
    { id: "A-next", label: "14:30 - 18:00", kind: "open" },
    { id: "A-maint", label: "Preventive • 30 min (16:30-17:00)", kind: "maintenance" },
    { id: "A-after", label: "17:00 - 20:00", kind: "open" },
  ],
  B: [
    { id: "B-current", label: "Current (behind -2 hrs)", kind: "info" },
    { id: "B-next", label: "16:00 - 20:00", kind: "open" },
    { id: "B-evening", label: "20:00 - 24:00", kind: "open" },
  ],
  C: [
    { id: "C-repair", label: "Issue: Material Jam (Downtime 12m)", kind: "maintenance" },
    { id: "C-after", label: "After repair - 18:00", kind: "open" },
    { id: "C-evening", label: "18:00 - 22:00", kind: "open" },
  ],
};

// mock compatibility
const compatible: Record<Line, string[]> = {
  A: ["Product A", "Product F", "Product G", "Product B"],
  B: ["Product F", "Product B", "Product H"],
  C: ["Product A", "Product H"],
};

export default function PlanningPage() {
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [schedule, setSchedule] = useState<ScheduleState>(initialSchedule);
  const [dragOrderId, setDragOrderId] = useState<string | null>(null);

  const [aiDraftVisible, setAiDraftVisible] = useState(false);
  const [saveEnabled, setSaveEnabled] = useState(false);

  const [hasShadow, setHasShadow] = useState(false); // เงา header เมื่อสกอลล์

  // header shadow on scroll
  useEffect(() => {
    const onScroll = () => setHasShadow(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // header KPI mock
  const kpis = [
    { icon: "📋", label: "Active Plans", value: "12", sub: "3 lines running", color: "primary" },
    { icon: "✅", label: "Plan Efficiency", value: "94%", sub: "+2% vs target", color: "success" },
    { icon: "⏰", label: "Pending Orders", value: String(orders.length), sub: "Need scheduling", color: "warning" },
    { icon: "🎯", label: "AI Suggestions", value: "5", sub: "Optimization ready", color: "primary" },
  ] as const;

  /** ---------- Actions ---------- */
  const onAIGenerate = () => setAiDraftVisible(true);

  const onApproveDraft = () => {
    const draftPick = orders.find((o) => o.id === "WO-2024-006");
    if (!draftPick) return;

    if (compatible["B"].includes(draftPick.product)) {
      setSchedule((prev) => ({
        ...prev,
        B: prev.B.map((s) => (s.id === "B-next" ? { ...s, orderId: draftPick.id } : s)),
      }));
      setOrders((prev) => prev.filter((o) => o.id !== draftPick.id));
      setSaveEnabled(true);
    }
    setAiDraftVisible(false);
  };

  const onRejectDraft = () => setAiDraftVisible(false);

  const onNewPlan = () => {
    alert("Open Create Plan modal (stub)");
  };

  const onSavePlan = () => {
    alert("Plan saved!");
    setSaveEnabled(false);
  };

  /** ---------- Drag & Drop ---------- */
  const handleDragStart = (orderId: string) => setDragOrderId(orderId);
  const handleDragEnd = () => setDragOrderId(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = (line: Line, slotId: string) => {
    if (!dragOrderId) return;

    const order = orders.find((o) => o.id === dragOrderId);
    if (!order) return;

    // compatibility check
    if (!compatible[line].includes(order.product)) {
      alert(`❌ ${order.product} ไม่ compatible กับ Line ${line}`);
      return;
    }

    // block placing on maintenance/info
    const slot = schedule[line].find((s) => s.id === slotId);
    if (!slot || slot.kind === "maintenance" || slot.kind === "info") return;

    // ถ้าช่องว่าง → วางได้
    setSchedule((prev) => ({
      ...prev,
      [line]: prev[line].map((s) => (s.id === slotId ? { ...s, orderId: dragOrderId } : s)),
    }));
    // เอาออกจาก pending
    setOrders((prev) => prev.filter((o) => o.id !== dragOrderId));
    setSaveEnabled(true);
    setDragOrderId(null);
  };

  /** ---------- Derived ---------- */
  const utilization = useMemo(() => {
    const toPct = (line: Line) => {
      const total = schedule[line].filter((s) => s.kind === "open").length;
      const used = schedule[line].filter((s) => s.kind === "open" && s.orderId).length;
      if (total === 0) return 0;
      return Math.round((used / total) * 100);
    };
    return { A: toPct("A"), B: toPct("B"), C: toPct("C") };
  }, [schedule]);

  return (
    <div>
      {/* Header */}
      <PageHeader 
        title="AI Production Planning"
        actions={
          <>
            <button className="inline-flex items-center rounded-lg bg-purple-600 px-5 py-2 text-white hover:opacity-90 transition">
              🤖AI Generate Plan
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:opacity-90 transition">
              + New Plan
            </button>
            <button className="inline-flex items-center rounded-lg bg-green-600 px-5 py-2 text-white hover:opacity-90 transition">
              Save Plan
            </button>
          </>
        }
      />
      
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* AI Draft Status */}
        {aiDraftVisible && (
          <div className="mb-6 rounded-lg border border-purple-200/60 bg-purple-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
                  <span className="text-sm text-white">🤖</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">AI Draft Plan Ready</h4>
                  <p className="text-sm text-gray-600">
                    AI generated an optimized plan based on due dates and machine compatibility.
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={onApproveDraft}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={onRejectDraft}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KPI Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, i) => (
            <Card
              key={i}
              icon={kpi.icon}
              title={kpi.label}
              value={kpi.value}
              subtitle={kpi.sub}
              accent={kpi.color}
            />
          ))}
        </div>

        {/* Pending Orders & Drag & Drop Schedule */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Pending Orders */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Pending Orders</h3>
            <div className="space-y-3" id="pendingOrders">
              {orders.map((o) => {
                const isHigh = o.priority === "high";
                return (
                  <div
                    key={o.id}
                    draggable
                    onDragStart={() => handleDragStart(o.id)}
                    onDragEnd={handleDragEnd}
                    className={`cursor-move rounded-lg border p-3 ${
                      isHigh
                        ? "border-yellow-400/30 bg-yellow-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{o.id}</div>
                        <div className="text-sm text-gray-600">
                          {o.product} • {o.qty} pcs
                        </div>
                        <div
                          className={`text-xs ${
                            isHigh ? "text-yellow-600" : "text-gray-500"
                          }`}
                        >
                          Due: {new Date(o.due).toLocaleDateString()}
                          {isHigh && " (High Priority)"}
                        </div>
                      </div>
                      <div className="text-gray-400">⋮⋮</div>
                    </div>
                  </div>
                );
              })}
              {orders.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 p-3 text-center text-sm text-gray-500">
                  All orders scheduled ✅
                </div>
              )}
            </div>
          </div>

          {/* Drag & Drop Production Schedule */}
          <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Drag &amp; Drop Production Schedule
              </h3>
              <div className="flex space-x-2">
                <button className="rounded bg-blue-600 px-3 py-1 text-xs text-white">Today</button>
                <button className="rounded bg-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-300">
                  Week
                </button>
                <button className="rounded bg-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-300">
                  Month
                </button>
              </div>
            </div>

            <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-gray-600">
              💡 <strong>How to use:</strong> Drag orders from <em>Pending Orders</em> and drop them
              into the slots below. The system checks machine compatibility automatically.
            </div>

            {/* Lines */}
            <div className="space-y-6">
              {/* Line A */}
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-green-600"></div>
                    <h4 className="font-semibold text-gray-900">Line A - Injection Molding</h4>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                      Running
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Capacity: 150 pcs/hr • Compatible: A, F, G, B
                  </div>
                </div>

                {/* แนวนอน + ความกว้างเท่ากันทุกช่อง */}
                <div className="flex space-x-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
                  {schedule.A.map((s) => (
                    <div key={s.id} className="w-[260px] flex-none">
                      <DropSlot
                        line="A"
                        slot={s}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Line B */}
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <h4 className="font-semibold text-gray-900">Line B - Assembly</h4>
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                      Low Efficiency
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Capacity: 120 pcs/hr • Compatible: F, B, H
                  </div>
                </div>

                <div className="flex space-x-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
                  {schedule.B.map((s) => (
                    <div key={s.id} className="w-[260px] flex-none">
                      <DropSlot
                        line="B"
                        slot={s}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Line C */}
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-red-600"></div>
                    <h4 className="font-semibold text-gray-900">Line C - Packaging</h4>
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                      Stopped
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Capacity: 200 pcs/hr • Compatible: A, H
                  </div>
                </div>

                <div className="flex space-x-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
                  {schedule.C.map((s) => (
                    <div key={s.id} className="w-[260px] flex-none">
                      <DropSlot
                        line="C"
                        slot={s}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Planning Tools */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Capacity Planning */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Capacity Planning</h3>
            <div className="space-y-4">
              <CapacityCard
                title="Line A Utilization"
                detail="Open slots planned / available"
                percent={utilization.A}
                hint={utilization.A >= 90 ? "Optimal" : utilization.A >= 70 ? "Good" : "Under-utilized"}
                color={utilization.A >= 90 ? "success" : "warning"}
              />
              <CapacityCard
                title="Line B Utilization"
                detail="Open slots planned / available"
                percent={utilization.B}
                hint={utilization.B >= 90 ? "Optimal" : utilization.B >= 70 ? "Good" : "Under-utilized"}
                color={utilization.B >= 90 ? "success" : "warning"}
              />
              <CapacityCard
                title="Line C Utilization"
                detail="Open slots planned / available"
                percent={utilization.C}
                hint={utilization.C === 0 ? "Stopped" : "Check"}
                color={utilization.C === 0 ? "danger" : "warning"}
              />

              <button className="flex w-full items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
                <span className="mr-2">🤖</span>
                Optimize Capacity Allocation
              </button>
            </div>
          </div>

          {/* Material Requirements */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Material Requirements</h3>
            <div className="space-y-4">
              <MaterialCard
                name="Raw Material A"
                required="500 kg"
                available="750 kg"
                status="Sufficient"
                color="success"
              />
              <MaterialCard
                name="Raw Material B"
                required="300 kg"
                available="320 kg"
                status="Low stock"
                color="warning"
              />
              <MaterialCard
                name="Packaging Material"
                required="1000 units"
                available="200 units"
                status="Shortage"
                color="danger"
              />
              <button className="w-full rounded-lg bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600">
                Generate Purchase Orders
              </button>
            </div>
          </div>
        </div>

        {/* AI Optimization Suggestions */}
        <div className="rounded-lg border border-purple-200/60 bg-purple-50 p-6">
          <div className="mb-4 flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
              <span className="text-xl text-white">🤖</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Optimization Suggestions</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SuggestionCard
              icon="💡"
              color="success"
              title="Schedule Optimization"
              text="Move WO-003 to Line A after maintenance to reduce overall completion time by 2 hours."
            />
            <SuggestionCard
              icon="⚡"
              color="warning"
              title="Efficiency Boost"
              text="Reduce setup time on Line B by batching similar products. Potential 15% efficiency gain."
            />
            <SuggestionCard
              icon="📊"
              color="primary"
              title="Resource Balancing"
              text="Redistribute workload to balance line utilization and reduce bottlenecks."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
