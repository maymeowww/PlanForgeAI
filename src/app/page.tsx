// import KpiCard from "@/src/components/KpiCard";
// import ProgressRing from "@/src/components/ProgressRing";
// import SectionCard from "@/src/components/SectionCard";
// import MachineStatus from "@/src/components/MachineStatus";
// import ActiveAlarms from "@/src/components/ActiveAlarms";
// import ProductionChart from "@/src/components/ProductionChart";
// import { dashboardKpis } from "@/lib/data";

// export default function Page() {
//   return (
//     <div className="space-y-8">
//       {/* OEE Overview */}
//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6 border border-gray-200 kpi-card">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-gray-900">Overall OEE</h3>
//             <div className="text-2xl">📊</div>
//           </div>
//           <div className="relative w-24 h-24 mx-auto mb-4">
//             <ProgressRing percent={75} color="#10b981" />
//           </div>
//           <div className="text-center">
//             <p className="text-sm text-gray-600">Target: 85%</p>
//             <p className="text-sm text-warning">-10% from target</p>
//           </div>
//         </div>

//         <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-6 border border-gray-200 kpi-card">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">OEE Components</h3>
//           <div className="grid grid-cols-3 gap-6">
//             <div className="text-center">
//               <div className="relative w-20 h-20 mx-auto mb-3">
//                 <ProgressRing percent={80} color="#2563eb" />
//               </div>
//               <h4 className="font-semibold text-gray-900">Availability</h4>
//               <p className="text-sm text-gray-600">Planned vs Actual</p>
//               <p className="text-sm text-primary">480/600 min</p>
//             </div>

//             <div className="text-center">
//               <div className="relative w-20 h-20 mx-auto mb-3">
//                 <ProgressRing percent={90} color="#f59e0b" />
//               </div>
//               <h4 className="font-semibold text-gray-900">Performance</h4>
//               <p className="text-sm text-gray-600">Actual vs Ideal</p>
//               <p className="text-sm text-warning">1080/1200 pcs</p>
//             </div>

//             <div className="text-center">
//               <div className="relative w-20 h-20 mx-auto mb-3">
//                 <ProgressRing percent={97} color="#10b981" />
//               </div>
//               <h4 className="font-semibold text-gray-900">Quality</h4>
//               <p className="text-sm text-gray-600">Good vs Total</p>
//               <p className="text-sm text-success">1048/1080 pcs</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Key Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {dashboardKpis.map((k) => (
//           <KpiCard
//             key={k.title}
//             title={k.title}
//             value={k.value}
//             subtitle={k.subtitle}
//             icon={k.icon as unknown as React.ReactNode}
//             accent={k.accent as any}
//           />
//         ))}
//       </div>

//       {/* Machine Status & Alarms */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <MachineStatus />
//         <ActiveAlarms />
//       </div>

//       {/* Production Trend */}
//       <SectionCard title="Production Trend (Last 24 Hours)">
//         <ProductionChart />
//       </SectionCard>
//     </div>
//   );
// }

import { redirect } from "next/navigation";

export default function Home() {
  // redirect ไป login ทันที
  redirect("/auth/login");
}