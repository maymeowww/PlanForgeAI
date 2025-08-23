"use client";

import { useEffect, useState } from "react";
import Card from "@/src/components/shared/card/Card";
import clsx from "clsx";
import MachineStatusCard from "./components/MachineStatus";

// ProgressRing component for SVG progress ring
function ProgressRing({
  radius,
  stroke,
  progress,
  color,
  trackColor = "#e5e7eb",
}: {
  radius: number;
  stroke: number;
  progress: number;
  color: string;
  trackColor?: string;
}) {
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="progress-ring">
      <circle
        stroke={trackColor}
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        className="progress-ring-circle transition-all duration-500"
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
}

// OverallOeeCard แก้ใหม่ตามที่คุณให้มา
const OverallOeeCard = () => {
  const percent = 75;
  return (
    <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6 border border-gray-200 kpi-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Overall OEE</h3>
        <div className="text-2xl">📊</div>
      </div>
      <div className="relative w-24 h-24 mx-auto mb-4">
        <ProgressRing radius={48} stroke={8} progress={percent} color="#10b981" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{percent}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">Target: 85%</p>
        <p className="text-sm text-yellow-600">-10% from target</p>
      </div>
    </div>
  );
};

// OeeComponentsCard แก้ใหม่ตามที่คุณให้มา
const oeeComponentsData = [
  {
    title: "Availability",
    percent: 80,
    color: "#2563eb",
    target: "Planned vs Actual",
    difference: "480/600 min",
    differenceColorClass: "text-blue-600", // ปรับสีตาม Tailwind
  },
  {
    title: "Performance",
    percent: 90,
    color: "#f59e0b",
    target: "Actual vs Ideal",
    difference: "1080/1200 pcs",
    differenceColorClass: "text-yellow-600",
  },
  {
    title: "Quality",
    percent: 97,
    color: "#10b981",
    target: "Good vs Total",
    difference: "1048/1080 pcs",
    differenceColorClass: "text-green-600",
  },
];

const OeeComponentsCard = () => (
  <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-6 border border-gray-200 kpi-card">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">OEE Components</h3>
    <div className="grid grid-cols-3 gap-6">
      {oeeComponentsData.map(({ title, percent, color, target, difference, differenceColorClass }) => (
        <div key={title} className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <ProgressRing radius={40} stroke={6} progress={percent} color={color} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-900">{percent}%</span>
            </div>
          </div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{target}</p>
          <p className={`text-sm ${differenceColorClass}`}>{difference}</p>
        </div>
      ))}
    </div>
  </div>
);

export default function DashboardPage() {
  const machines = [
    {
      id: "1",
      line: "Line A - Injection Molding",
      description: "Running",
      rate: "142 pcs/hr",
      oee: "78%",
      status: "success" as const,
      statusText: "Normal",
      extra: "Temp: 185°C",
    },
    {
      id: "2",
      line: "Line B - Assembly",
      description: "Running",
      rate: "98 pcs/hr",
      oee: "65%",
      status: "warning" as const,
      statusText: "Warning",
      extra: "Low efficiency",
    },
    {
      id: "3",
      line: "Line C - Packaging",
      description: "Stopped",
      rate: "0 pcs/hr",
      oee: "0%",
      status: "danger" as const,
      statusText: "Alarm",
      extra: "Jam detected",
    },
  ];

  const [hasShadow, setHasShadow] = useState(false);

  useEffect(() => {
    const onScroll = () => setHasShadow(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cardData = [
    { title: "NG Rate", value: "3.2%", subtitle: "+0.5% from yesterday", icon: "❌", accent: "danger" },
    { title: "Production Rate", value: "135", subtitle: "pcs/hour (+8%)", icon: "⚡", accent: "success" },
    { title: "Downtime", value: "45", subtitle: "minutes today", icon: "⏱️", accent: "warning" },
    { title: "Target Achievement", value: "92%", subtitle: "1104/1200 pcs", icon: "🎯", accent: "primary" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Header */}
      <header
        className={clsx(
          "py-2 sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70",
          hasShadow ? "shadow-sm" : "shadow-none"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-bold leading-tight">⚙️ Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-10">
          {/* OEE Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <OverallOeeCard />
            <OeeComponentsCard />
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cardData.map((card, index) => (
              <Card
                key={index}
                icon={<span>{card.icon}</span>}
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                accent={card.accent}
              />
            ))}
          </div>

          {/* Machine Status and Alarms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MachineStatusCard machines={machines} />
          </div>
        </div>
      </main>
    </div>
  );
}
