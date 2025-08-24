"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Pencil,    // Edit
  Check,     // Save
  X,         // Cancel
} from "lucide-react";
import IconButton from "@/src/components/shared/button/IconButton";
import HolidayCard from "./components/HolidayCard";
import ShiftBreakCard from "./components/ShiftBreakCard";
import OTCard from "./components/OTCard";
import ConstraintCard from "./components/ConstraintCard";
import MaintenanceCard from "./components/MaintenanceCard";
import PageHeader from "@/src/components/layout/PageHeader";

import type {
  Holiday,
  Shift,
  BreakRow,
  OTRules,
  SetupRule,
  Constraints,
  MaintWin,
} from "@/src/types";

import {
  getBreaks,
  getConstraints,
  getHolidays,
  getMaintenances,
  getOTRules,
  getSetupMatrix,
  getShifts,
} from "@/src/lib/api";

/* ---------- Helpers ---------- */
const toBool = (v: any) => String(v) === "true";

function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- Types ---------- */
interface SettingsPayload {
  calendar: { holidays: Holiday[] };
  shifts: { shifts: Shift[]; breaks: BreakRow[] };
  ot_rules: OTRules | null;
  setup_matrix: SetupRule[];
  constraints: Constraints | null;
  maintenance_windows: MaintWin[];
}

/* ========================================= */
export default function ProjectSettings() {
  const [isEditing, setIsEditing] = useState(false);

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [breaks, setBreaks] = useState<BreakRow[]>([]);
  const [otRules, setOTRules] = useState<OTRules | null>(null);
  const [setupMatrix, setSetupMatrix] = useState<SetupRule[]>([]);
  const [constraints, setConstraints] = useState<Constraints | null>(null);
  const [maint, setMaint] = useState<MaintWin[]>([]);

  useEffect(() => {
    const fetchMockData = async () => {
      const [
        holidaysData,
        shiftsData,
        breaksData,
        otRulesData,
        setupMatrixData,
        constraintsData,
        maintData,
      ] = await Promise.all([
        getHolidays(),
        getShifts(),
        getBreaks(),
        getOTRules(),
        getSetupMatrix(),
        getConstraints(),
        getMaintenances(),
      ]);

      setHolidays(holidaysData);
      setShifts(shiftsData);
      setBreaks(breaksData);
      setOTRules(otRulesData);
      setSetupMatrix(setupMatrixData);
      setConstraints(constraintsData);
      setMaint(maintData);
    };

    fetchMockData();
  }, []);

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
      if (
        !h.is_recurring &&
        h.start_date &&
        h.end_date &&
        new Date(h.start_date) > new Date(h.end_date)
      ) {
        errs.push(`Holiday row ${i + 1}: end date is before start date`);
      }
    });

    shifts.forEach((s, i) => {
      if (!s.code) errs.push(`Shift row ${i + 1}: code is empty`);
      if (s.start && s.end && s.start >= s.end)
        errs.push(`Shift ${s.code || "#" + (i + 1)}: start time >= end time`);
    });

    breaks.forEach((b, i) => {
      if (!b.shift_code) errs.push(`Break row ${i + 1}: shift code is empty`);
      if (b.start && b.end && b.start >= b.end)
        errs.push(`Break row ${i + 1}: start time >= end time`);
    });

    maint.forEach((m, i) => {
      if (!m.machine_id) errs.push(`Maintenance row ${i + 1}: machine id is empty`);
      if (m.start_dt && m.end_dt && m.start_dt >= m.end_dt)
        errs.push(`Maintenance row ${i + 1}: start datetime >= end datetime`);
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
                <Pencil className="h-4 w-4" />
              </IconButton>
            ) : (
              <>
                <IconButton tooltip="Save" onClick={handleSave} variant="ok">
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
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <HolidayCard holidays={holidays} setHolidays={setHolidays} isEditing={isEditing} />

        <ShiftBreakCard
          shifts={shifts}
          setShifts={setShifts}
          breaks={breaks}
          setBreaks={setBreaks}
          isEditing={isEditing}
        />

        <OTCard
          otRules={otRules}
          setOTRules={setOTRules}
          setupMatrix={setupMatrix}
          setSetupMatrix={setSetupMatrix}
          isEditing={isEditing}
          toBool={toBool}
        />

        <ConstraintCard
          constraints={constraints}
          setConstraints={setConstraints}
          isEditing={isEditing}
          toBool={toBool}
        />

        <MaintenanceCard maint={maint} setMaint={setMaint} isEditing={isEditing} />
      </div>
    </>
  );
}
