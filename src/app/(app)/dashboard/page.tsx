"use client"
import PageHeader from "@/src/components/layout/PageHeader";
import React, { useEffect, useMemo, useState } from "react";
import GanttSection from "./components/Gantt";
import KPISnapshot from "./components/KPISnapshot";
import AlertsList from "./components/AlertsList";
import MachineStatus from "./components/MachineStatus";
import { cls } from "@/src/lib/utils";
import MaterialCard from "./components/MaterialCard";


type OverviewCardProps = {
  title?: string;
  value?: string;
  sub?: string;
  badge?: {
    text?: string;
    tone: "emerald" | "blue" | "amber" | "rose";
  };
};

function OverviewCard({ title, value, sub, badge }: OverviewCardProps) {
  const toneMap = {
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  } as const;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 shadow p-4 h-full flex flex-col gap-y-4">
  {/* Header */}
  <div className="flex items-center justify-between">
    <h3 className="text-sm text-slate-500 dark:text-slate-400">
      {title ?? "-"}
    </h3>
    {badge?.text && badge.tone && (
      <span
        className={cls(
          "text-xs px-2 py-0.5 rounded-full",
          toneMap[badge.tone]
        )}
      >
        {badge.text}
      </span>
    )}
  </div>

  {/* Value */}
  <p
    className={cls(
      "font-bold leading-tight text-center",
      "text-[clamp(1.75rem,4vw,2.5rem)]"
    )}
  >
    {value ?? "-"}
    {sub && (
      <span className="ml-1 text-sm font-medium text-slate-400">
        {sub}
      </span>
    )}
  </p>
    </div>
  );
}

function OverviewSection() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <OverviewCard title="Output (Today)" value="3,420" sub="pcs" badge={{ text: "+8% vs Plan", tone: "emerald" }} />
      <OverviewCard title="Machine Utilization" value="83%" badge={{ text: "12 Machines", tone: "blue" }} />
      <div className="rounded-2xl bg-white dark:bg-slate-800 shadow p-4">
        <h3 className="text-sm text-slate-500 dark:text-slate-400">Orders Status</h3>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "กำลังผลิต", value: 18, tone: "" },
            { label: "รอผลิต", value: 7, tone: "" },
            { label: "ล่าช้า", value: 3, tone: "text-rose-500" },
          ].map((x) => (
            <div key={x.label} className="rounded-xl bg-slate-50 dark:bg-slate-700 p-3">
              <div className="text-xs text-slate-500">{x.label}</div>
              <div className={cls("text-lg font-semibold", x.tone)}>{x.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white dark:bg-slate-800 shadow p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-slate-500 dark:text-slate-400">OEE (Today)</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">–2% vs Yesterday</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-center">74%</p>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
          <div><dt>Avail.</dt><dd className="font-semibold text-slate-700 dark:text-slate-200">88%</dd></div>
          <div><dt>Perf.</dt><dd className="font-semibold text-slate-700 dark:text-slate-200">84%</dd></div>
          <div><dt>Qual.</dt><dd className="font-semibold text-slate-700 dark:text-slate-200">99%</dd></div>
        </dl>
      </div>
    </section>
  );
}

export default function AIPlannerDashboard() {
  return (
    <>
      <PageHeader title="Dashboard"/>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <OverviewSection />
        <GanttSection/>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <KPISnapshot />
            <MachineStatus />
          </div>
          <aside className="space-y-6">
            <AlertsList />
            <MaterialCard />          
          </aside>
        </section>
       
      </main>
    </>
  );
}
