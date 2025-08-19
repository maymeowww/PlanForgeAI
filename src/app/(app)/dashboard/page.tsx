// src/app/dashboard/page.tsx

import KpiCard from "@/src/components/KpiCard";
import ProgressRing from "@/src/components/ProgressRing";
import SectionCard from "@/src/components/SectionCard";
import MachineStatus from "@/src/components/MachineStatus";
import ActiveAlarms from "@/src/components/ActiveAlarms";
import ProductionChart from "@/src/components/ProductionChart";
import { dashboardKpis } from "@/lib/data";

/* --------------------------------------
  🔁 Reusable UI Block Components
--------------------------------------*/

// กล่องแสดง OEE วงกลมใหญ่
const OverallOeeCard = () => (
  <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6 border border-gray-200 kpi-card">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Overall OEE</h3>
      <div className="text-2xl">📊</div>
    </div>
    <div className="relative w-24 h-24 mx-auto mb-4">
      <ProgressRing percent={75} color="#10b981" />
    </div>
    <div className="text-center">
      <p className="text-sm text-gray-600">Target: 85%</p>
      <p className="text-sm text-warning">-10% from target</p>
    </div>
  </div>
);

// กล่องย่อยของ OEE: Availability, Performance, Quality
const OeeComponentCard = ({
  title,
  percent,
  color,
  label,
  value,
  valueClass,
}: {
  title: string;
  percent: number;
  color: string;
  label: string;
  value: string;
  valueClass: string;
}) => (
  <div className="text-center">
    <div className="relative w-20 h-20 mx-auto mb-3">
      <ProgressRing percent={percent} color={color} />
    </div>
    <h4 className="font-semibold text-gray-900">{title}</h4>
    <p className="text-sm text-gray-600">{label}</p>
    <p className={`text-sm ${valueClass}`}>{value}</p>
  </div>
);

// กล่องรวมของ OEE ย่อย
const OeeComponentsCard = () => (
  <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-6 border border-gray-200 kpi-card">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">OEE Components</h3>
    <div className="grid grid-cols-3 gap-6">
      <OeeComponentCard
        title="Availability"
        percent={80}
        color="#2563eb"
        label="Planned vs Actual"
        value="480/600 min"
        valueClass="text-primary"
      />
      <OeeComponentCard
        title="Performance"
        percent={90}
        color="#f59e0b"
        label="Actual vs Ideal"
        value="1080/1200 pcs"
        valueClass="text-warning"
      />
      <OeeComponentCard
        title="Quality"
        percent={97}
        color="#10b981"
        label="Good vs Total"
        value="1048/1080 pcs"
        valueClass="text-success"
      />
    </div>
  </div>
);

/* --------------------------------------
  📄 Main Page Component
--------------------------------------*/

export default function Page() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <OverallOeeCard />
        <OeeComponentsCard />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardKpis.map((k) => (
          <KpiCard
            key={k.title}
            title={k.title}
            value={k.value}
            subtitle={k.subtitle}
            icon={k.icon as unknown as React.ReactNode}
            accent={k.accent as any}
          />
        ))}
      </div>

      {/* Machine Status & Alarms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MachineStatus />
        <ActiveAlarms />
      </div>

      {/* Production Trend */}
      <SectionCard title="Production Trend (Last 24 Hours)">
        <ProductionChart />
      </SectionCard>
    </div>
  );
}
