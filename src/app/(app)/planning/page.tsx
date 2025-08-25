// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import clsx from "clsx";

// import Card from "@/src/components/shared/card/Card";
// import SuggestionCard from "./components/SuggestionCard";
// import MaterialCard from "./components/MaterialCard";
// import CapacityCard from "./components/CapacityCard";
// import DropSlot from "./components/DropSlot";
// import PageHeader from "@/src/components/layout/PageHeader";

// /** ---------- Types ---------- */
// type OrderItem = {
//   id: string;           // e.g. WO-2024-006
//   product: string;      // e.g. Product F
//   qty: number;          // e.g. 300
//   due: string;          // e.g. 2024-12-20
//   priority?: "high" | "normal";
// };

// type Slot = {
//   id: string;
//   label: string;        // e.g. "14:30 - 18:00"
//   kind?: "maintenance" | "info" | "open"; // visual only
//   orderId?: string;     // occupied by which order
// };

// type Line = "A" | "B" | "C";
// type ScheduleState = Record<Line, Slot[]>;

// /** ---------- Mock data ---------- */
// const initialOrders: OrderItem[] = [
//   { id: "WO-2024-006", product: "Product F", qty: 300, due: "2024-12-20", priority: "high" },
//   { id: "WO-2024-007", product: "Product G", qty: 450, due: "2024-12-22" },
//   { id: "WO-2024-008", product: "Product H", qty: 200, due: "2024-12-25" },
//   { id: "WO-2024-009", product: "Product A", qty: 600, due: "2024-12-28" },
//   { id: "WO-2024-010", product: "Product B", qty: 350, due: "2024-12-30" },
// ];

// const initialSchedule: ScheduleState = {
//   A: [
//     { id: "A-current", label: "Current", kind: "info" },
//     { id: "A-next", label: "14:30 - 18:00", kind: "open" },
//     { id: "A-maint", label: "Preventive • 30 min (16:30-17:00)", kind: "maintenance" },
//     { id: "A-after", label: "17:00 - 20:00", kind: "open" },
//   ],
//   B: [
//     { id: "B-current", label: "Current (behind -2 hrs)", kind: "info" },
//     { id: "B-next", label: "16:00 - 20:00", kind: "open" },
//     { id: "B-evening", label: "20:00 - 24:00", kind: "open" },
//   ],
//   C: [
//     { id: "C-repair", label: "Issue: Material Jam (Downtime 12m)", kind: "maintenance" },
//     { id: "C-after", label: "After repair - 18:00", kind: "open" },
//     { id: "C-evening", label: "18:00 - 22:00", kind: "open" },
//   ],
// };

// // mock compatibility
// const compatible: Record<Line, string[]> = {
//   A: ["Product A", "Product F", "Product G", "Product B"],
//   B: ["Product F", "Product B", "Product H"],
//   C: ["Product A", "Product H"],
// };

// const workOrders = [
//   { id: "WO-2024-021", product: "Product A", qty: 1200, done: 750, line: "Line A", status: "Running" as const },
//   { id: "WO-2024-022", product: "Product B", qty: 800, done: 320, line: "Line B", status: "Low Efficiency" as const },
//   { id: "WO-2024-023", product: "Product H", qty: 200, done: 0, line: "Line C", status: "Stopped" as const },
//   { id: "WO-2024-024", product: "Product F", qty: 600, done: 0, line: "Line A", status: "Queued" as const },
// ];

// function ProgressBar({ value }: { value: number }) {
//   return (
//     <div className="h-2 w-full rounded-full bg-gray-100">
//       <div
//         className="h-2 rounded-full bg-emerald-500"
//         style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
//       />
//     </div>
//   );
// }

// function StatusBadge({
//   color = "gray",
//   children,
// }: {
//   color?: "emerald" | "amber" | "rose" | "sky" | "gray";
//   children: React.ReactNode;
// }) {
//   const map: Record<string, string> = {
//     emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
//     amber: "bg-amber-50 text-amber-700 ring-amber-200",
//     rose: "bg-rose-50 text-rose-700 ring-rose-200",
//     sky: "bg-sky-50 text-sky-700 ring-sky-200",
//     gray: "bg-gray-50 text-gray-700 ring-gray-200",
//   };
//   return (
//     <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ring-1 ${map[color]}`}>
//       {children}
//     </span>
//   );
// }

// export default function PlanningPage() {
//   const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
//   const [schedule, setSchedule] = useState<ScheduleState>(initialSchedule);
//   const [dragOrderId, setDragOrderId] = useState<string | null>(null);

//   const [aiDraftVisible, setAiDraftVisible] = useState(false);
//   const [saveEnabled, setSaveEnabled] = useState(false);

//   const [hasShadow, setHasShadow] = useState(false); // เงา header เมื่อสกอลล์

//   // header shadow on scroll
//   useEffect(() => {
//     const onScroll = () => setHasShadow(window.scrollY > 4);
//     onScroll();
//     window.addEventListener("scroll", onScroll, { passive: true });
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   // header KPI mock
//   const kpis = [
//     { icon: "📋", label: "Active Plans", value: "12", sub: "3 lines running", color: "primary" },
//     { icon: "✅", label: "Plan Efficiency", value: "94%", sub: "+2% vs target", color: "success" },
//     { icon: "⏰", label: "Pending Orders", value: String(orders.length), sub: "Need scheduling", color: "warning" },
//     { icon: "🎯", label: "AI Suggestions", value: "5", sub: "Optimization ready", color: "primary" },
//   ] as const;

//   /** ---------- Actions ---------- */
//   const onAIGenerate = () => setAiDraftVisible(true);

//   const onApproveDraft = () => {
//     const draftPick = orders.find((o) => o.id === "WO-2024-006");
//     if (!draftPick) return;

//     if (compatible["B"].includes(draftPick.product)) {
//       setSchedule((prev) => ({
//         ...prev,
//         B: prev.B.map((s) => (s.id === "B-next" ? { ...s, orderId: draftPick.id } : s)),
//       }));
//       setOrders((prev) => prev.filter((o) => o.id !== draftPick.id));
//       setSaveEnabled(true);
//     }
//     setAiDraftVisible(false);
//   };

//   const onRejectDraft = () => setAiDraftVisible(false);

//   const onNewPlan = () => {
//     alert("Open Create Plan modal (stub)");
//   };

//   const onSavePlan = () => {
//     alert("Plan saved!");
//     setSaveEnabled(false);
//   };

//   /** ---------- Drag & Drop ---------- */
//   const handleDragStart = (orderId: string) => setDragOrderId(orderId);
//   const handleDragEnd = () => setDragOrderId(null);

//   const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault(); // allow drop
//   };

//   const handleDrop = (line: Line, slotId: string) => {
//     if (!dragOrderId) return;

//     const order = orders.find((o) => o.id === dragOrderId);
//     if (!order) return;

//     // compatibility check
//     if (!compatible[line].includes(order.product)) {
//       alert(`❌ ${order.product} ไม่ compatible กับ Line ${line}`);
//       return;
//     }

//     // block placing on maintenance/info
//     const slot = schedule[line].find((s) => s.id === slotId);
//     if (!slot || slot.kind === "maintenance" || slot.kind === "info") return;

//     // ถ้าช่องว่าง → วางได้
//     setSchedule((prev) => ({
//       ...prev,
//       [line]: prev[line].map((s) => (s.id === slotId ? { ...s, orderId: dragOrderId } : s)),
//     }));
//     // เอาออกจาก pending
//     setOrders((prev) => prev.filter((o) => o.id !== dragOrderId));
//     setSaveEnabled(true);
//     setDragOrderId(null);
//   };

//   /** ---------- Derived ---------- */
//   const utilization = useMemo(() => {
//     const toPct = (line: Line) => {
//       const total = schedule[line].filter((s) => s.kind === "open").length;
//       const used = schedule[line].filter((s) => s.kind === "open" && s.orderId).length;
//       if (total === 0) return 0;
//       return Math.round((used / total) * 100);
//     };
//     return { A: toPct("A"), B: toPct("B"), C: toPct("C") };
//   }, [schedule]);

//   return (
//     <div>
//       {/* Header */}
//       <PageHeader 
//         title="AI Production Planning"
//         actions={
//           <>
//             <button className="inline-flex items-center rounded-lg bg-purple-600 px-5 py-2 text-white hover:opacity-90 transition">
//               🤖AI Generate Plan
//             </button>
//             <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:opacity-90 transition">
//               + New Plan
//             </button>
//             <button className="inline-flex items-center rounded-lg bg-green-600 px-5 py-2 text-white hover:opacity-90 transition">
//               Save Plan
//             </button>
//           </>
//         }
//       />
      
//       <div className="max-w-6xl mx-auto px-6 py-6">
//         {/* AI Draft Status */}
//         {aiDraftVisible && (
//           <div className="mb-6 rounded-lg border border-purple-200/60 bg-purple-50 p-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
//                   <span className="text-sm text-white">🤖</span>
//                 </div>
//                 <div>
//                   <h4 className="font-semibold text-gray-900">AI Draft Plan Ready</h4>
//                   <p className="text-sm text-gray-600">
//                     AI generated an optimized plan based on due dates and machine compatibility.
//                   </p>
//                 </div>
//               </div>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={onApproveDraft}
//                   className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
//                 >
//                   ✅ Approve
//                 </button>
//                 <button
//                   onClick={onRejectDraft}
//                   className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
//                 >
//                   ❌ Reject
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* KPI Overview */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           {kpis.map((kpi, i) => (
//             <Card
//               key={i}
//               icon={kpi.icon}
//               title={kpi.label}
//               value={kpi.value}
//               subtitle={kpi.sub}
//               accent={kpi.color}
//             />
//           ))}
//         </div>

//         {/* Pending Orders & Drag & Drop Schedule */}
//         <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
//           {/* Pending Orders */}
//           <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
//             <h3 className="mb-4 text-lg font-semibold text-gray-900">Pending Orders</h3>
//             <div className="space-y-3" id="pendingOrders">
//               {orders.map((o) => {
//                 const isHigh = o.priority === "high";
//                 return (
//                   <div
//                     key={o.id}
//                     draggable
//                     onDragStart={() => handleDragStart(o.id)}
//                     onDragEnd={handleDragEnd}
//                     className={`cursor-move rounded-lg border p-3 ${
//                       isHigh
//                         ? "border-yellow-400/30 bg-yellow-50"
//                         : "border-gray-200 bg-gray-50"
//                     }`}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <div className="font-medium text-gray-900">{o.id}</div>
//                         <div className="text-sm text-gray-600">
//                           {o.product} • {o.qty} pcs
//                         </div>
//                         <div
//                           className={`text-xs ${
//                             isHigh ? "text-yellow-600" : "text-gray-500"
//                           }`}
//                         >
//                           Due: {new Date(o.due).toLocaleDateString()}
//                           {isHigh && " (High Priority)"}
//                         </div>
//                       </div>
//                       <div className="text-gray-400">⋮⋮</div>
//                     </div>
//                   </div>
//                 );
//               })}
//               {orders.length === 0 && (
//                 <div className="rounded-lg border border-dashed border-gray-300 p-3 text-center text-sm text-gray-500">
//                   All orders scheduled ✅
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Drag & Drop Production Schedule */}
//           <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
//             <div className="mb-6 flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Drag &amp; Drop Production Schedule
//               </h3>
//               <div className="flex space-x-2">
//                 <button className="rounded bg-blue-600 px-3 py-1 text-xs text-white">Today</button>
//                 <button className="rounded bg-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-300">
//                   Week
//                 </button>
//                 <button className="rounded bg-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-300">
//                   Month
//                 </button>
//               </div>
//             </div>

//             <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-gray-600">
//               💡 <strong>How to use:</strong> Drag orders from <em>Pending Orders</em> and drop them
//               into the slots below. The system checks machine compatibility automatically.
//             </div>

//             {/* Lines */}
//             <div className="space-y-6">
//               {/* Line A */}
//               <div className="rounded-lg border border-gray-200 p-4">
//                 <div className="mb-4 flex items-center justify-between">
//                   <div className="flex items-center space-x-3">
//                     <div className="h-3 w-3 rounded-full bg-green-600"></div>
//                     <h4 className="font-semibold text-gray-900">Line A - Injection Molding</h4>
//                     <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
//                       Running
//                     </span>
//                   </div>
//                   <div className="text-sm text-gray-600">
//                     Capacity: 150 pcs/hr • Compatible: A, F, G, B
//                   </div>
//                 </div>

//                 {/* แนวนอน + ความกว้างเท่ากันทุกช่อง */}
//                 <div className="flex space-x-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
//                   {schedule.A.map((s) => (
//                     <div key={s.id} className="w-[260px] flex-none">
//                       <DropSlot
//                         line="A"
//                         slot={s}
//                         onDragOver={handleDragOver}
//                         onDrop={handleDrop}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Line B */}
//               <div className="rounded-lg border border-gray-200 p-4">
//                 <div className="mb-4 flex items-center justify-between">
//                   <div className="flex items-center space-x-3">
//                     <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
//                     <h4 className="font-semibold text-gray-900">Line B - Assembly</h4>
//                     <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
//                       Low Efficiency
//                     </span>
//                   </div>
//                   <div className="text-sm text-gray-600">
//                     Capacity: 120 pcs/hr • Compatible: F, B, H
//                   </div>
//                 </div>

//                 <div className="flex space-x-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
//                   {schedule.B.map((s) => (
//                     <div key={s.id} className="w-[260px] flex-none">
//                       <DropSlot
//                         line="B"
//                         slot={s}
//                         onDragOver={handleDragOver}
//                         onDrop={handleDrop}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Line C */}
//               <div className="rounded-lg border border-gray-200 p-4">
//                 <div className="mb-4 flex items-center justify-between">
//                   <div className="flex items-center space-x-3">
//                     <div className="h-3 w-3 rounded-full bg-red-600"></div>
//                     <h4 className="font-semibold text-gray-900">Line C - Packaging</h4>
//                     <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
//                       Stopped
//                     </span>
//                   </div>
//                   <div className="text-sm text-gray-600">
//                     Capacity: 200 pcs/hr • Compatible: A, H
//                   </div>
//                 </div>

//                 <div className="flex space-x-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
//                   {schedule.C.map((s) => (
//                     <div key={s.id} className="w-[260px] flex-none">
//                       <DropSlot
//                         line="C"
//                         slot={s}
//                         onDragOver={handleDragOver}
//                         onDrop={handleDrop}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Planning Tools */}
//         <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
//           {/* Capacity Planning */}
//           <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
//             <h3 className="mb-4 text-lg font-semibold text-gray-900">Capacity Planning</h3>
//             <div className="space-y-4">
//               <CapacityCard
//                 title="Line A Utilization"
//                 detail="Open slots planned / available"
//                 percent={utilization.A}
//                 hint={utilization.A >= 90 ? "Optimal" : utilization.A >= 70 ? "Good" : "Under-utilized"}
//                 color={utilization.A >= 90 ? "success" : "warning"}
//               />
//               <CapacityCard
//                 title="Line B Utilization"
//                 detail="Open slots planned / available"
//                 percent={utilization.B}
//                 hint={utilization.B >= 90 ? "Optimal" : utilization.B >= 70 ? "Good" : "Under-utilized"}
//                 color={utilization.B >= 90 ? "success" : "warning"}
//               />
//               <CapacityCard
//                 title="Line C Utilization"
//                 detail="Open slots planned / available"
//                 percent={utilization.C}
//                 hint={utilization.C === 0 ? "Stopped" : "Check"}
//                 color={utilization.C === 0 ? "danger" : "warning"}
//               />

//               <button className="flex w-full items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
//                 <span className="mr-2">🤖</span>
//                 Optimize Capacity Allocation
//               </button>
//             </div>
//           </div>

//           {/* Material Requirements */}
//           <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
//             <h3 className="mb-4 text-lg font-semibold text-gray-900">Material Requirements</h3>
//             <div className="space-y-4">
//               <MaterialCard
//                 name="Raw Material A"
//                 required="500 kg"
//                 available="750 kg"
//                 status="Sufficient"
//                 color="success"
//               />
//               <MaterialCard
//                 name="Raw Material B"
//                 required="300 kg"
//                 available="320 kg"
//                 status="Low stock"
//                 color="warning"
//               />
//               <MaterialCard
//                 name="Packaging Material"
//                 required="1000 units"
//                 available="200 units"
//                 status="Shortage"
//                 color="danger"
//               />
//               <button className="w-full rounded-lg bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600">
//                 Generate Purchase Orders
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* AI Optimization Suggestions */}
//         <div className="rounded-lg border border-purple-200/60 bg-purple-50 p-6">
//           <div className="mb-4 flex items-center">
//             <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
//               <span className="text-xl text-white">🤖</span>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900">AI Optimization Suggestions</h3>
//           </div>

//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
//             <SuggestionCard
//               icon="💡"
//               color="success"
//               title="Schedule Optimization"
//               text="Move WO-003 to Line A after maintenance to reduce overall completion time by 2 hours."
//             />
//             <SuggestionCard
//               icon="⚡"
//               color="warning"
//               title="Efficiency Boost"
//               text="Reduce setup time on Line B by batching similar products. Potential 15% efficiency gain."
//             />
//             <SuggestionCard
//               icon="📊"
//               color="primary"
//               title="Resource Balancing"
//               text="Redistribute workload to balance line utilization and reduce bottlenecks."
//             />
//           </div>
//         </div>

//         <section className="lg:col-span-7">
//              <div className="rounded-xl border bg-white p-4 shadow-sm">
//                <div className="flex items-center justify-between mb-3">
//                  <h2 className="text-lg font-semibold">Work Orders</h2>
//                  <div className="text-sm text-gray-500">{workOrders.length} orders</div>
//                </div>
//                <div className="overflow-hidden rounded-lg border">
//                  <table className="min-w-full divide-y divide-gray-200 text-sm">
//                    <thead className="bg-gray-50">
//                      <tr className="text-gray-600">
//                        <th className="px-4 py-2 text-left font-medium">WO</th>
//                        <th className="px-4 py-2 text-left font-medium">Product</th>
//                        <th className="px-4 py-2 text-right font-medium">Done / Plan</th>
//                        <th className="px-4 py-2 text-left font-medium">Line</th>
//                        <th className="px-4 py-2 text-left font-medium">Status</th>
//                      </tr>
//                    </thead>
//                    <tbody className="divide-y divide-gray-100 bg-white">
//                      {workOrders.map((w) => {
//                        const pct = Math.round((w.done / w.qty) * 100);
//                       return (
//                         <tr key={w.id} className="hover:bg-gray-50">
//                           <td className="px-4 py-2 font-medium text-gray-900">{w.id}</td>
//                           <td className="px-4 py-2 text-gray-700">{w.product}</td>
//                           <td className="px-4 py-2">
//                             <div className="flex items-center justify-end gap-2">
//                               <span className="text-gray-700 tabular-nums">
//                                 {w.done}/{w.qty}
//                               </span>
//                               <div className="w-28">
//                                 <ProgressBar value={pct} />
//                               </div>
//                               <span className="w-10 text-right tabular-nums text-gray-500">
//                                 {pct}%
//                               </span>
//                             </div>
//                           </td>
//                           <td className="px-4 py-2 text-gray-700">{w.line}</td>
//                           <td className="px-4 py-2">
//                             {w.status === "Running" && (
//                               <StatusBadge color="emerald">Running</StatusBadge>
//                             )}
//                             {w.status === "Low Efficiency" && (
//                               <StatusBadge color="amber">Low Efficiency</StatusBadge>
//                             )}
//                             {w.status === "Stopped" && (
//                               <StatusBadge color="rose">Stopped</StatusBadge>
//                             )}
//                             {w.status === "Queued" && (
//                               <StatusBadge color="sky">Queued</StatusBadge>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </section>
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useMemo, useRef, useState } from "react";

// =============================
// Types
// =============================
export type Strategy = "deadline" | "cost" | "hybrid";

export interface Job {
  id: string;
  product: string;
  durationMin: number; // process time at speedFactor=1
  due: string; // YYYY-MM-DD
  capable: string[]; // machine IDs that can run
}

export interface Machine {
  id: string;
  speedFactor: number; // >1 faster
  setupMin: number;
}

export interface PlanItem {
  jobId: string;
  product: string;
  machineId: string;
  start: string; // ISO
  end: string;   // ISO
  durationMin: number;
  setupMin: number;
  due: string;   // ISO
  late: boolean;
}

// =============================
// Helpers (work calendar with breaks)
// =============================
const cls = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");
const fmtHM = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const toISO = (d: Date) => d.toISOString();
const fromISO = (s: string) => new Date(s);
const addMin = (d: Date, m: number) => new Date(d.getTime() + m * 60000);

function asDate(date: string, time = "08:00"): Date { return new Date(`${date}T${time}:00`); }
function sameDay(a: Date, b: Date) { return a.toDateString() === b.toDateString(); }

export type TimeRange = { start: string; end: string }; // HH:mm on a given day

export interface WorkCalendar {
  dayStart: string; // HH:mm
  dayEnd: string;   // HH:mm
  breaks: TimeRange[]; // daily recurring
}

const DEFAULT_CAL: WorkCalendar = {
  dayStart: "08:00",
  dayEnd: "20:00",
  breaks: [
    { start: "10:00", end: "10:15" },
    { start: "12:00", end: "13:00" },
    { start: "15:00", end: "15:15" },
  ],
};

function at(date: Date, hm: string) { return new Date(`${date.toISOString().slice(0,10)}T${hm}:00`); }

function nextBreakAfter(t: Date, cal: WorkCalendar): { start: Date; end: Date } | null {
  const cand = cal.breaks
    .map((b) => ({ start: at(t, b.start), end: at(t, b.end) }))
    .filter((r) => r.end > t)
    .sort((a, b) => +a.start - +b.start)[0];
  return cand || null;
}

function advanceToWorkTime(t: Date, cal: WorkCalendar): Date {
  const dayStart = at(t, cal.dayStart);
  const dayEnd = at(t, cal.dayEnd);
  if (t < dayStart) return new Date(dayStart);
  if (t >= dayEnd) {
    const nd = new Date(dayStart); nd.setDate(nd.getDate() + 1); return nd;
  }
  const b = cal.breaks.find((br) => t >= at(t, br.start) && t < at(t, br.end));
  if (b) return at(t, b.end);
  return t;
}

function addWorkingMinutes(start: Date, minutes: number, cal: WorkCalendar): Date {
  let t = advanceToWorkTime(new Date(start), cal);
  let left = minutes;
  while (left > 0) {
    const dayStart = at(t, cal.dayStart);
    const dayEnd = at(t, cal.dayEnd);
    if (t >= dayEnd) { t = advanceToWorkTime(addMin(dayStart, 24*60), cal); continue; }
    const nextB = nextBreakAfter(t, cal);
    const segEnd = nextB ? (nextB.start > dayEnd ? dayEnd : nextB.start) : dayEnd;
    const segAvail = Math.max(0, Math.floor((+segEnd - +t) / 60000));
    if (segAvail >= left) { return addMin(t, left); }
    left -= segAvail;
    t = nextB ? new Date(nextB.end) : new Date(dayEnd);
    t = advanceToWorkTime(t, cal);
  }
  return t;
}

// =============================
// Seeds
// =============================
const MACHINES_SEED: Machine[] = [
  { id: "MC-01", speedFactor: 1.0, setupMin: 12 },
  { id: "MC-02", speedFactor: 1.2, setupMin: 10 },
  { id: "MC-03", speedFactor: 0.9, setupMin: 15 },
];

const JOBS_SEED: Job[] = [
  { id: "ORD-1001", product: "A", durationMin: 180, due: "2025-09-05", capable: ["MC-01", "MC-02"] },
  { id: "ORD-1002", product: "B", durationMin: 120, due: "2025-09-04", capable: ["MC-01", "MC-03"] },
  { id: "ORD-1003", product: "A", durationMin: 200, due: "2025-09-06", capable: ["MC-01", "MC-02"] },
  { id: "ORD-1004", product: "C", durationMin: 150, due: "2025-09-03", capable: ["MC-02", "MC-03"] },
  { id: "ORD-1005", product: "B", durationMin: 90,  due: "2025-09-04", capable: ["MC-01", "MC-03"] },
  { id: "ORD-1006", product: "C", durationMin: 240, due: "2025-09-07", capable: ["MC-02", "MC-03"] },
];

// =============================
// Scheduler (break-aware)
// =============================
function runScheduler({
  jobs,
  machines,
  startAt,
  cutoffAt,
  strategy,
  prevPlan,
  cal,
}: {
  jobs: Job[];
  machines: Machine[];
  startAt: Date;
  cutoffAt: Date;
  strategy: Strategy;
  prevPlan?: Record<string, string[]>; // machineId -> sequence (also supports 'unassigned')
  cal: WorkCalendar;
}): { plan: PlanItem[]; lateCount: number } {
  // Build queues (skip unassigned for now)
  const queues: Record<string, string[]> = {};
  machines.forEach((m) => (queues[m.id] = prevPlan?.[m.id] ? [...prevPlan[m.id]] : []));

  const seeded = new Set(Object.values(queues).flat());
  let remaining = jobs.filter((j) => !seeded.has(j.id));

  // Sort remaining by strategy
  const score = (j: Job) => {
    if (strategy === "deadline") return new Date(j.due).getTime();
    if (strategy === "cost") return { A: 0, B: 1, C: 2 }[j.product as "A"|"B"|"C"] ?? 3;
    const wD=0.6,wC=0.4; const d=new Date(j.due).getTime(); const c=({A:0,B:1,C:2} as any)[j.product] ?? 3; return wD*d + wC*c*1e7;
  };
  remaining.sort((a,b)=>score(a)-score(b));

  // Greedy assign to earliest finishing capable machine
  const lastProduct: Record<string, string | null> = {}; machines.forEach((m)=>lastProduct[m.id]=null);
  const cursor: Record<string, Date> = {}; machines.forEach((m)=>cursor[m.id]=new Date(startAt));

  for (const j of remaining) {
    let best: { mid: string; start: Date; end: Date; setup: number } | null = null;
    for (const mid of j.capable) {
      const m = machines.find((x)=>x.id===mid)!;
      const setup = lastProduct[mid] && lastProduct[mid] !== j.product ? m.setupMin : 0;
      const st0 = advanceToWorkTime(cursor[mid], cal);
      const st = setup>0 ? advanceToWorkTime(addWorkingMinutes(st0, setup, cal), cal) : st0;
      const dur = Math.ceil(j.durationMin / m.speedFactor);
      const en = addWorkingMinutes(st, dur, cal);
      if (!best || en < best.end) best = { mid, start: st, end: en, setup };
    }
    queues[best!.mid].push(j.id);
    const m = machines.find((x)=>x.id===best!.mid)!;
    const dur = Math.ceil(j.durationMin / m.speedFactor);
    const afterSetup = best!.setup>0 ? addWorkingMinutes(best!.start, best!.setup, cal) : best!.start;
    cursor[best!.mid] = addWorkingMinutes(afterSetup, dur, cal);
    lastProduct[best!.mid] = j.product;
  }

  // Materialize plan in time order per machine
  const id2job: Record<string, Job> = Object.fromEntries(jobs.map((j)=>[j.id,j]));
  const plan: PlanItem[] = [];
  let lateCount = 0;
  machines.forEach((m)=>{
    let t = new Date(startAt); let last: string | null = null;
    for (const jid of queues[m.id]) {
      const j = id2job[jid]; if(!j) continue;
      const setup = last && last!==j.product ? m.setupMin : 0;
      if (setup>0) t = addWorkingMinutes(advanceToWorkTime(t, cal), setup, cal);
      const dur = Math.ceil(j.durationMin / m.speedFactor);
      const st = advanceToWorkTime(t, cal);
      const en = addWorkingMinutes(st, dur, cal);
      const due = asDate(j.due, "20:00");
      const late = en > due || en > cutoffAt;
      if (late) lateCount += 1;
      plan.push({ jobId: j.id, product: j.product, machineId: m.id, start: toISO(st), end: toISO(en), durationMin: dur, setupMin: setup, due: toISO(due), late });
      t = new Date(en); last = j.product;
    }
  });

  return { plan, lateCount };
}

// =============================
// Main Page (Horizontal UI + Edit/Save + Lock Running)
// =============================
export default function PlanningSchedulingHorizontal() {
  const [strategy, setStrategy] = useState<Strategy>("hybrid");
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [startTime, setStartTime] = useState<string>("08:00");
  const [cutoffDate, setCutoffDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [cutoffTime, setCutoffTime] = useState<string>("20:00");
  const [cal] = useState<WorkCalendar>(DEFAULT_CAL);

  const [machines] = useState<Machine[]>(MACHINES_SEED);
  const [jobs] = useState<Job[]>(JOBS_SEED);

  // board with Unassigned lane
  const [board, setBoard] = useState<Record<string, string[]>>(()=>{
    const init: Record<string,string[]> = { unassigned: jobs.map(j=>j.id) };
    MACHINES_SEED.forEach(m=>init[m.id]=[]);
    return init;
  });

  // Edit mode (changes are staged in tempBoard)
  const [editMode, setEditMode] = useState(false);
  const [tempBoard, setTempBoard] = useState<Record<string,string[]>>(board);

  const activeBoard = editMode ? tempBoard : board;

  const startAt = useMemo(()=>asDate(startDate,startTime),[startDate,startTime]);
  const cutoffAt = useMemo(()=>asDate(cutoffDate,cutoffTime),[cutoffDate,cutoffTime]);

  const { plan, lateCount } = useMemo(()=>runScheduler({ jobs, machines, startAt, cutoffAt, strategy, prevPlan: activeBoard, cal }), [jobs, machines, startAt, cutoffAt, strategy, activeBoard, cal]);

  // ====== AI Auto-place (fills board from current AI plan order) ======
  const autoPlaceAI = () => {
    const next: Record<string,string[]> = { unassigned: [] } as any;
    machines.forEach(m=>next[m.id]=[]);
    // push by plan order; any not in plan remain unassigned
    const plannedIds = new Set<string>();
    plan.sort((a,b)=>+new Date(a.start)-+new Date(b.start)).forEach(p=>{ next[p.machineId].push(p.jobId); plannedIds.add(p.jobId); });
    const allIds = new Set(jobs.map(j=>j.id));
    next.unassigned = [...allIds].filter(id=>!plannedIds.has(id));
    editMode ? setTempBoard(next) : setBoard(next);
  };

  // ====== Drag & drop (enabled only in edit mode and not locked) ======
  const drag = useRef<{ jobId: string; from: string }|null>(null);
  const onDragStart = (jobId: string, from: string) => (e: React.DragEvent) => {
    if (!editMode) return; drag.current = { jobId, from }; e.dataTransfer.effectAllowed='move';
  };
  const onDragOver = (e: React.DragEvent) => { if(!editMode) return; e.preventDefault(); e.dataTransfer.dropEffect='move'; };
  const onDropRow = (to: string) => (e: React.DragEvent) => {
    if (!editMode) return; e.preventDefault(); const d=drag.current; if(!d) return;
    if (to!=='unassigned') { const j = jobs.find(x=>x.id===d.jobId)!; if(!j.capable.includes(to)){ alert(`เครื่อง ${to} ไม่รองรับงาน ${j.id}`); drag.current=null; return; } }
    setTempBoard(prev=>{ const next: Record<string,string[]> = Object.fromEntries(Object.entries(prev).map(([k,v])=>[k,[...v]])); next[d.from]=next[d.from].filter(id=>id!==d.jobId); next[to].push(d.jobId); return next; });
    drag.current=null;
  };

  // ====== Remove (X) back to Unassigned (only edit mode, not locked) ======
  const removeToUnassigned = (jid: string, from: string) => {
    setTempBoard(prev=>{ const next: Record<string,string[]> = Object.fromEntries(Object.entries(prev).map(([k,v])=>[k,[...v]])); next[from]=next[from].filter(id=>id!==jid); next.unassigned.push(jid); return next; });
  };

  // ====== Edit/Save controls ======
  const onEdit = () => { setTempBoard(board); setEditMode(true); };
  const onCancel = () => { setEditMode(false); setTempBoard(board); };
  const onSave = () => { setBoard(tempBoard); setEditMode(false); };

  // ====== Lock running job (now between start..end) ======
  const now = new Date();
  const isLocked = (jid: string, mid: string) => {
    const p = plan.find(x=>x.jobId===jid && x.machineId===mid);
    if (!p) return false;
    const s = fromISO(p.start), e = fromISO(p.end);
    return now >= s && now < e; // currently producing
  };

  // ====== Horizontal timeline calc ======
  const horizonMs = Math.max(1, +cutoffAt - +startAt);
  const xPos = (d: Date) => Math.max(0, Math.min(100, ((+d - +startAt) / horizonMs) * 100));
  const widthPct = (s: Date, e: Date) => Math.max(0.75, ( (+e - +s) / horizonMs) * 100 );

  // ====== Export ======
  const toCSVPlan = (rows: PlanItem[]) => [ ["jobId","product","machineId","start","end","durationMin","setupMin","due","late"].join(","), ...rows.map(p=>[p.jobId,p.product,p.machineId,p.start,p.end,p.durationMin,p.setupMin,p.due,p.late?1:0].join(",")) ].join("");
  const download = (name: string, text: string) => { const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type:'text/csv'})); a.download=name; a.click(); URL.revokeObjectURL(a.href); };

  // ====== Time ruler ticks (every hour) ======
  const ticks = useMemo(()=>{
    const arr: { left:number; label:string }[] = [];
    const t = new Date(startAt);
    t.setMinutes(0,0,0);
    while (+t <= +cutoffAt) {
      arr.push({ left: xPos(new Date(t)), label: fmtHM(t) });
      t.setHours(t.getHours()+1);
    }
    return arr;
  }, [startAt, cutoffAt]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 dark:bg-slate-900/70 border-b border-slate-200/70 dark:border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold">AI</div>
            <h1 className="text-lg sm:text-xl font-semibold">Planning & Scheduling — Horizontal</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={()=>download('plan.csv', toCSVPlan(plan))} className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2">Export Plan CSV</button>
            <button onClick={autoPlaceAI} className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2">Run AI Scheduler</button>
            {!editMode ? (
              <button onClick={onEdit} className="text-xs rounded-lg bg-blue-600 text-white px-3 py-2">Edit</button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={onCancel} className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2">Cancel</button>
                <button onClick={onSave} className="text-xs rounded-lg bg-emerald-600 text-white px-3 py-2">Save</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Controls */}
        <section className="rounded-2xl bg-white dark:bg-slate-800 shadow p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="text-xs text-slate-500">Strategy</label>
              <select value={strategy} onChange={(e)=>setStrategy(e.target.value as Strategy)} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
                <option value="deadline">Deadline-driven</option>
                <option value="cost">Cost-driven</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Start</label>
              <div className="flex items-center gap-2">
                <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
                <input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Cut-off</label>
              <div className="flex items-center gap-2">
                <input type="date" value={cutoffDate} onChange={(e)=>setCutoffDate(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
                <input type="time" value={cutoffTime} onChange={(e)=>setCutoffTime(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs text-slate-500">Late Jobs</div>
              <div className="text-xl font-semibold">{lateCount}</div>
            </div>
          </div>
        </section>

        {/* Horizontal Canvas */}
        <section className="rounded-2xl bg-white dark:bg-slate-800 shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
            {/* Unassigned pool */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Unassigned Jobs</h3>
                <span className="text-xs text-slate-500">{activeBoard.unassigned?.length || 0}</span>
              </div>
              <div onDragOver={onDragOver} onDrop={onDropRow('unassigned')} className="space-y-2 max-h-[520px] overflow-auto">
                {(activeBoard.unassigned||[]).map((jid)=>{
                  const j = jobs.find(x=>x.id===jid)!;
                  return (
                    <div key={jid} draggable={editMode} onDragStart={onDragStart(jid,'unassigned')} className={cls("rounded-lg p-3 shadow border text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700", !editMode && "opacity-60 cursor-not-allowed") }>
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{j.id} • P{j.product}</div>
                        <span className="text-xs text-slate-500">{j.durationMin}m</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">Capable: {j.capable.join(', ')}</div>
                      <div className="text-xs text-slate-500">Due {j.due}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* time ruler */}
              <div className="relative h-8">
                <div className="absolute inset-0 border-b border-slate-200 dark:border-slate-700" />
                {ticks.map((t,i)=> (
                  <div key={i} className="absolute -translate-x-1/2 text-[10px] text-slate-500" style={{ left: `${t.left}%` }}>{t.label}</div>
                ))}
              </div>

              <div className="space-y-3 overflow-x-auto">
                {machines.map((m)=>{
                  const rowPlan = plan.filter(p=>p.machineId===m.id).sort((a,b)=>+new Date(a.start)-+new Date(b.start));
                  return (
                    <div key={m.id} className="rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900/40">
                        <div className="font-medium">{m.id}</div>
                        <div className="text-xs text-slate-500">speed×{m.speedFactor} • setup {m.setupMin}m</div>
                      </div>
                      <div onDragOver={onDragOver} onDrop={onDropRow(m.id)} className="relative h-24">
                        {/* bars */}
                        {rowPlan.map((p)=>{
                          const s = fromISO(p.start), e = fromISO(p.end);
                          const left = xPos(s), w = widthPct(s,e);
                          const j = jobs.find(x=>x.id===p.jobId)!;
                          const locked = isLocked(p.jobId, p.machineId);
                          return (
                            <div key={p.jobId} draggable={editMode && !locked} onDragStart={onDragStart(p.jobId,m.id)}
                              className={cls("absolute top-2 h-16 rounded-lg shadow border px-3 py-2 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 overflow-hidden", p.late && "ring-1 ring-rose-400", !editMode && "cursor-default")}
                              style={{ left: `${left}%`, width: `${w}%`, minWidth: 80 }}>
                              <div className="flex items-center justify-between">
                                <div className="font-semibold text-[12px] truncate">{j.id} • P{j.product}</div>
                                {editMode && !locked ? (
                                  <button onClick={()=>removeToUnassigned(p.jobId, m.id)} className="text-[10px] px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">×</button>
                                ) : (
                                  <span className={cls("text-[10px] px-1 py-0.5 rounded", locked?"bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300":"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300")}>{locked?"Running":"Locked"}</span>
                                )}
                              </div>
                              <div className="mt-1 text-[11px] text-slate-500">{fmtHM(s)} – {fmtHM(e)} • {p.durationMin}m</div>
                              <div className="mt-1 text-[11px] text-slate-500">Due {sameDay(fromISO(p.due), s) ? fmtHM(fromISO(p.due)) : p.due.slice(0,10)} {p.late && <span className="ml-1 text-rose-600">• Late</span>}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
