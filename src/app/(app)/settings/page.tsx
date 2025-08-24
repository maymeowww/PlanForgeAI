"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Pencil,            // Edit
  Check,             // Save
  X,                 // Cancel
  Download,          // Export JSON (optional)
} from "lucide-react";
import clsx from "clsx";
import IconButton from "@/src/components/shared/button/IconButton";
import HolidayCard from "./components/HolidayCard";
import ShiftBreakCard from "./components/ShiftBreakCard";
import OTCard from "./components/OTCard";
import ConstraintCard from "./components/ConstraintCard";
import MaintenanceCard from "./components/MaintenanceCard";
import PageHeader from "@/src/components/layout/PageHeader";

/* ---------- Types ---------- */
type Holiday = { start_date: string; end_date: string; description: string; is_recurring: boolean };
type Shift = { code: string; start: string; end: string; lines: string[] };
type BreakRow = { shift_code: string; start: string; end: string };
type OTRules = { daily_cap_hours: number; allow_weekend_ot: boolean; default_setup_min: number; default_buffer_min: number };
type SetupRule = { from: string; to: string; setup_min: number };
type Constraints = { enforce_maintenance: boolean; enforce_material_ready: boolean; material_ready_offset_min: number; freeze_window_min: number };
type MaintWin = { machine_id: string; start_dt: string; end_dt: string; type: "PM" | "Unplanned"; note: string };

type SettingsPayload = {
  calendar: { holidays: Holiday[] };
  shifts: { shifts: Shift[]; breaks: BreakRow[] };
  ot_rules: OTRules;
  setup_matrix: SetupRule[];
  constraints: Constraints;
  maintenance_windows: MaintWin[];
};

/* ---------- Helpers ---------- */
const toBool = (v: any) => String(v) === "true";

function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ========================================= */
export default function ProjectSettings() {
  const [isEditing, setIsEditing] = useState(false);

  // seed states
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
  const [otRules, setOTRules] = useState<OTRules>({ daily_cap_hours: 2, allow_weekend_ot: true, default_setup_min: 10, default_buffer_min: 30 });
  const [setupMatrix, setSetupMatrix] = useState<SetupRule[]>([
    { from: "P1", to: "P2", setup_min: 12 },
    { from: "P2", to: "P3", setup_min: 18 },
  ]);
  const [constraints, setConstraints] = useState<Constraints>({
    enforce_maintenance: true, enforce_material_ready: true, material_ready_offset_min: 0, freeze_window_min: 120,
  });
  const [maint, setMaint] = useState<MaintWin[]>([
    { machine_id: "M2", start_dt: "2025-08-20T13:00", end_dt: "2025-08-20T15:00", type: "PM", note: "quarterly" },
    { machine_id: "M1", start_dt: "2025-08-22T09:00", end_dt: "2025-08-22T10:00", type: "Unplanned", note: "vibration" },
  ]);

  const payload: SettingsPayload = useMemo(
    () => ({
      calendar: { holidays },
      shifts: { shifts, breaks },
      ot_rules: otRules,
      setup_matrix: setupMatrix,
      constraints,
      maintenance_windows: maint,
    }),
    [holidays, shifts, breaks, otRules, setupMatrix, constraints, maint]
  );

  function validateForm(): boolean {
    const errs: string[] = [];
    holidays.forEach((h, i) => {
      if (!h.start_date) errs.push(`Holiday row ${i + 1}: start date is empty`);
      if (!h.is_recurring && h.start_date && h.end_date && new Date(h.start_date) > new Date(h.end_date)) {
        errs.push(`Holiday row ${i + 1}: end < start`);
      }
    });
    shifts.forEach((s, i) => {
      if (!s.code) errs.push(`Shift row ${i + 1}: code is empty`);
      if (s.start && s.end && s.start >= s.end) errs.push(`Shift ${s.code || "#" + (i + 1)}: start >= end`);
    });
    breaks.forEach((b, i) => {
      if (!b.shift_code) errs.push(`Break row ${i + 1}: shift code is empty`);
      if (b.start && b.end && b.start >= b.end) errs.push(`Break row ${i + 1}: start >= end`);
    });
    maint.forEach((m, i) => {
      if (!m.machine_id) errs.push(`Maintenance row ${i + 1}: machine id is empty`);
      if (m.start_dt && m.end_dt && m.start_dt >= m.end_dt) errs.push(`Maintenance row ${i + 1}: start >= end`);
    });
    if (errs.length) {
      alert("พบปัญหา:\n- " + errs.join("\n- "));
      return false;
    }
    return true;
  }

  function handleSave() {
    if (!validateForm()) return;
    setIsEditing(false);
    downloadJSON("project_settings.json", payload);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  return (
    <>
      <PageHeader
        title="⚙️ Project Settings"
        description="กำหนดกะทำงาน, วันหยุด, OT/Setup/Buffer, ข้อจำกัด และบำรุงรักษา"
        actions={
          <div className="flex items-center gap-2">
            {!isEditing ? (              
              <IconButton tooltip="Edit" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4"/>
              </IconButton>
            ) : (
              <>
                <IconButton tooltip="Save" onClick={handleSave} variant='ok'>                  
                  <Check className="h-4 w-4" />
                </IconButton>        
                
                <IconButton tooltip="Cancel" onClick={handleCancel}>                  
                  <X className="h-4 w-4" />
                </IconButton>        
              </>
            )}
          </div>
        }
        tabs={
          <nav>
            <ul className="flex items-center gap-1 text-[13px]">
              {[
                { href: "#cal", label: "Calendar / Holidays" },
                { href: "#shifts", label: "Shifts & Breaks" },
                { href: "#ot", label: "OT / Setup / Buffer" },
                { href: "#constraints", label: "Constraints" },
                { href: "#maint", label: "Maintenance" },
              ].map((it) => (
                <li key={it.href}>
                  <a
                    href={it.href}
                    className="
                      inline-flex items-center whitespace-nowrap rounded-lg
                      border px-3 py-1.5
                      text-slate-700 bg-white border-slate-200
                      hover:bg-slate-50 hover:text-slate-900
                      dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600
                      dark:hover:bg-slate-700 dark:hover:text-white
                      transition-colors
                    "
                  >
                    {it.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        }
      />

      {/* ======= Content ======= */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <HolidayCard
          holidays={holidays}
          setHolidays={setHolidays}
          isEditing={isEditing}
        />

        <ShiftBreakCard
          shifts={shifts}
          setShifts={setShifts}
          breaks={breaks}
          setBreaks={setBreaks}
          isEditing={isEditing}
        />

        {/* OT / Setup / Buffer */}
        <OTCard
          otRules={otRules}
          setOTRules={setOTRules}
          setupMatrix={setupMatrix}
          setSetupMatrix={setSetupMatrix}
          isEditing={isEditing}
          toBool={toBool}
        />

        {/* Constraints */}
        <ConstraintCard
          constraints={constraints}
          setConstraints={setConstraints}
          isEditing={isEditing}
          toBool={toBool}
        />

        {/* Maintenance Windows */}
        <MaintenanceCard
          maint={maint}
          setMaint={setMaint}
          isEditing={isEditing}
        />
      </div>
    </>
  );
}
