// src/app/settings/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import clsx from "clsx";

import IconButton from "@/src/components/shared/button/IconButton";
import HolidayCard from "./components/HolidayCard";
import ShiftBreakCard from "./components/ShiftBreakCard";
import OTCard from "./components/OTCard";
import ConstraintCard from "./components/ConstraintCard";
import MaintenanceCard from "./components/MaintenanceCard";

/* ---------- Types ---------- */
type Holiday = { start_date: string; end_date: string; description: string; is_recurring: boolean };
type Shift = { code: string; start: string; end: string; lines: string[] };
type BreakRow = { shift_code: string; start: string; end: string };
type OTRules = { daily_cap_hours: number; allow_weekend_ot: boolean; default_setup_min: number; default_buffer_min: number };
type SetupRule = { from: string; to: string; setup_min: number };
type Constraints = { enforce_maintenance: boolean; enforce_material_ready: boolean; material_ready_offset_min: number; freeze_window_min: number };
type MaintWin = { machine_id: string; start_dt: string; end_dt: string; type: "PM" | "Unplanned"; note: string };

const toBool = (v: any) => String(v) === "true";

export default function ProjectSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [hasShadow, setHasShadow] = useState(false);
  const [active, setActive] = useState<
    "cal" | "shifts" | "ot" | "constraints" | "maint"
  >("cal");

  // header shadow
  useEffect(() => {
    const onScroll = () => setHasShadow(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // seed state
  const [holidays, setHolidays] = useState<Holiday[]>([
    { start_date: "2025-12-31", end_date: "2026-01-01", description: "New Year's Day", is_recurring: true },
    { start_date: "2025-04-13", end_date: "2025-04-15", description: "Songkran Festival", is_recurring: true },
  ]);
  const [shifts, setShifts] = useState<Shift[]>([
    { code: "A", start: "08:00", end: "17:00", lines: ["Assembly", "Packing"] },
    { code: "B", start: "20:00", end: "05:00", lines: ["Assembly"] },
  ]);
  const [breaks, setBreaks] = useState<BreakRow[]>([
    { shift_code: "A", start: "12:00", end: "13:00" },
    { shift_code: "B", start: "00:00", end: "00:30" },
  ]);
  const [otRules, setOTRules] = useState<OTRules>({
    daily_cap_hours: 2,
    allow_weekend_ot: true,
    default_setup_min: 10,
    default_buffer_min: 30,
  });
  const [setupMatrix, setSetupMatrix] = useState<SetupRule[]>([
    { from: "P1", to: "P2", setup_min: 12 },
    { from: "P2", to: "P3", setup_min: 18 },
  ]);
  const [constraints, setConstraints] = useState<Constraints>({
    enforce_maintenance: true,
    enforce_material_ready: true,
    material_ready_offset_min: 0,
    freeze_window_min: 120,
  });
  const [maint, setMaint] = useState<MaintWin[]>([
    { machine_id: "M2", start_dt: "2025-08-20T13:00", end_dt: "2025-08-20T15:00", type: "PM", note: "quarterly" },
    { machine_id: "M1", start_dt: "2025-08-22T09:00", end_dt: "2025-08-22T10:00", type: "Unplanned", note: "vibration" },
  ]);

  const th = "p-2 text-left text-xs font-semibold text-slate-500";
  const cell = "p-2 align-top";

  const sections = [
    { id: "cal" as const, label: "Calendar / Holidays", node: <HolidayCard holidays={holidays} setHolidays={setHolidays} isEditing={isEditing} /> },
    { id: "shifts" as const, label: "Shifts & Breaks", node: <ShiftBreakCard shifts={shifts} setShifts={setShifts} breaks={breaks} setBreaks={setBreaks} isEditing={isEditing} /> },
    { id: "ot" as const, label: "OT / Setup / Buffer", node: <OTCard otRules={otRules} setOTRules={setOTRules} setupMatrix={setupMatrix} setSetupMatrix={setSetupMatrix} isEditing={isEditing} toBool={toBool} /> },
    { id: "constraints" as const, label: "Constraints", node: <ConstraintCard constraints={constraints} setConstraints={setConstraints} isEditing={isEditing} toBool={toBool} /> },
    { id: "maint" as const, label: "Maintenance", node: <MaintenanceCard maint={maint} setMaint={setMaint} isEditing={isEditing} th={th} cell={cell} /> },
  ];

  const ordered = useMemo(() => {
    const first = sections.find((s) => s.id === active)!;
    const rest = sections.filter((s) => s.id !== active);
    return [first, ...rest];
  }, [active, sections]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header
        className={clsx(
          "py-2 sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70",
          hasShadow ? "shadow-sm" : "shadow-none"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold leading-tight">⚙️ Project Settings</h1>
            <p className="text-xs md:text-sm text-slate-600 truncate">
              กำหนดกะทำงาน, วันหยุด, OT/Setup/Buffer, ข้อจำกัด และบำรุงรักษา
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <IconButton tooltip="Edit" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" />
              </IconButton>
            ) : (
              <>
                <IconButton tooltip="Save" onClick={() => setIsEditing(false)} variant="ok">
                  <Check className="h-4 w-4" />
                </IconButton>
                <IconButton tooltip="Cancel" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                </IconButton>
              </>
            )}
          </div>
        </div>

        {/* Top Menu */}
        <nav className="max-w-6xl mx-auto px-3 md:px-6 pb-2 overflow-x-auto">
          <ul className="flex items-center gap-1 text-[13px]">
            {sections.map((it) => {
              const isActive = active === it.id;
              return (
                <li key={it.id}>
                  <button
                    type="button"
                    onClick={() => setActive(it.id)}
                    className={clsx(
                      "inline-flex whitespace-nowrap items-center rounded-lg border px-3 py-1.5",
                      isActive
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {it.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {ordered.map((sec) => (
          <div key={sec.id}>{sec.node}</div>
        ))}
      </div>
    </div>
  );
}
