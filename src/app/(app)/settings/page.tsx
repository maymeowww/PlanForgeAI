"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Pencil,            // Edit
  Check,             // Save
  X,                 // Cancel
  Download,          // Export JSON (optional)
} from "lucide-react";
import clsx from "clsx";

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
  const [hasShadow, setHasShadow] = useState(false); // เงา header เมื่อสกอลล์

  // header shadow on scroll
  useEffect(() => {
    const onScroll = () => setHasShadow(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    // ถ้าต้องการ revert ค่ากลับ ให้เก็บ snapshot state ตอนกด Edit แล้ว set กลับที่นี่
  }

  const cell = "p-2 align-top";
  const th = "p-2 text-left text-xs font-semibold text-slate-500";
  const iconBtn =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition shadow-sm";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* ======= Sticky Header (มีเงาเมื่อสกอลล์) ======= */}
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

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  className={iconBtn}
                  title="Edit"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className={iconBtn}
                  title="Export JSON"
                  onClick={() => downloadJSON("project_settings.json", payload)}
                  aria-label="Export JSON"
                >
                  <Download className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  className={"inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"}
                  title="Save"
                  onClick={handleSave}
                  aria-label="Save"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  className={"inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"}
                  title="Cancel"
                  onClick={handleCancel}
                  aria-label="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* ======= Top Menu ======= */}
        <nav className="max-w-6xl mx-auto px-3 md:px-6 pb-2 overflow-x-auto">
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
                  className="inline-flex whitespace-nowrap items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-100"
                >
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ======= Content ======= */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* TIP: ใช้ fieldset disabled เพื่อ “ล็อก” ทั้งบล็อกตอนยังไม่ Edit */}
        {/* Calendar / Holidays */}
        <section id="cal" className="scroll-mt-24 bg-white border rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Calendar / Holidays</h2>
            <span className="text-xs rounded-full px-2 py-0.5 border bg-slate-50 text-slate-500">
              {isEditing ? "Editing" : "Read-only"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            รองรับ “ช่วงวันหลายวัน” และ “Recurring รายปี”
          </p>

          <fieldset disabled={!isEditing} className={!isEditing ? "opacity-80 select-none" : ""}>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className={th} style={{ width: 170 }}>Start</th>
                    <th className={th} style={{ width: 170 }}>End</th>
                    <th className={th}>Description</th>
                    <th className={th} style={{ width: 120 }}>Recurring</th>
                    <th className={th} style={{ width: 60 }} />
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((h, i) => (
                    <tr key={i} className="align-top">
                      <td className={cell}>
                        <input
                          type="date"
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          value={h.start_date}
                          onChange={(e) =>
                            setHolidays(holidays.map((x, j) => (j === i ? { ...x, start_date: e.target.value } : x)))
                          }
                        />
                      </td>
                      <td className={cell}>
                        <input
                          type="date"
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          value={h.end_date}
                          onChange={(e) =>
                            setHolidays(holidays.map((x, j) => (j === i ? { ...x, end_date: e.target.value } : x)))
                          }
                        />
                      </td>
                      <td className={cell}>
                        <input
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          placeholder="Description"
                          value={h.description}
                          onChange={(e) =>
                            setHolidays(holidays.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))
                          }
                        />
                      </td>
                      <td className={cell}>
                        <select
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          value={String(h.is_recurring)}
                          onChange={(e) =>
                            setHolidays(
                              holidays.map((x, j) => (j === i ? { ...x, is_recurring: toBool(e.target.value) } : x))
                            )
                          }
                        >
                          <option value="false">No</option>
                          <option value="true">Yes</option>
                        </select>
                      </td>
                      <td className={cell}>
                        <button
                          className="text-rose-600 hover:underline disabled:opacity-50"
                          onClick={() => setHolidays(holidays.filter((_, j) => j !== i))}
                          title="remove"
                          disabled={!isEditing}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-2">
              <button
                className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-sm disabled:opacity-50"
                onClick={() =>
                  setHolidays([...holidays, { start_date: "", end_date: "", description: "", is_recurring: false }])
                }
                disabled={!isEditing}
              >
                + Add Holiday
              </button>
            </div>
          </fieldset>
        </section>

        {/* Shifts & Breaks */}
        <section id="shifts" className="scroll-mt-35 bg-white border rounded-2xl shadow-sm p-4 mt-4">
          <h2 className="text-lg font-semibold">Shifts & Breaks</h2>
          <p className="text-xs text-slate-500 mb-3">นิยามกะทำงานและช่วงพัก</p>

          <fieldset disabled={!isEditing} className={!isEditing ? "opacity-80 select-none" : ""}>
            <h3 className="text-sm font-semibold text-slate-700">Shifts</h3>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className={th} style={{ width: 140 }}>Shift Code</th>
                    <th className={th} style={{ width: 180 }}>Start</th>
                    <th className={th} style={{ width: 180 }}>End</th>
                    <th className={th}>Lines (optional)</th>
                    <th className={th} style={{ width: 80 }} />
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((s, i) => (
                    <tr key={i}>
                      <td className={cell}>
                        <input
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          placeholder="A"
                          value={s.code}
                          onChange={(e) => setShifts(shifts.map((x, j) => (j === i ? { ...x, code: e.target.value } : x)))}
                        />
                      </td>
                      <td className={cell}>
                        <input
                          type="time"
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          value={s.start}
                          onChange={(e) => setShifts(shifts.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))}
                        />
                      </td>
                      <td className={cell}>
                        <input
                          type="time"
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          value={s.end}
                          onChange={(e) => setShifts(shifts.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))}
                        />
                      </td>
                      <td className={cell}>
                        <input
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          placeholder="Assembly,Packing"
                          value={s.lines.join(",")}
                          onChange={(e) =>
                            setShifts(
                              shifts.map((x, j) =>
                                j === i ? { ...x, lines: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) } : x
                              )
                            )
                          }
                        />
                      </td>
                      <td className={cell}>
                        <button
                          className="text-rose-600 hover:underline disabled:opacity-50"
                          onClick={() => setShifts(shifts.filter((_, j) => j !== i))}
                          disabled={!isEditing}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-sm disabled:opacity-50"
                onClick={() => setShifts([...shifts, { code: "", start: "08:00", end: "17:00", lines: [] }])}
                disabled={!isEditing}
              >
                + Add Shift
              </button>
            </div>

            <h3 className="text-sm font-semibold text-slate-700 mt-4">Breaks</h3>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className={th} style={{ width: 140 }}>Shift Code</th>
                    <th className={th} style={{ width: 180 }}>Break Start</th>
                    <th className={th} style={{ width: 180 }}>Break End</th>
                    <th className={th} style={{ width: 80 }} />
                  </tr>
                </thead>
                <tbody>
                  {breaks.map((b, i) => (
                    <tr key={i}>
                      <td className={cell}>
                        <input
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          placeholder="A"
                          value={b.shift_code}
                          onChange={(e) => setBreaks(breaks.map((x, j) => (j === i ? { ...x, shift_code: e.target.value } : x)))}
                        />
                      </td>
                      <td className={cell}>
                        <input
                          type="time"
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          value={b.start}
                          onChange={(e) => setBreaks(breaks.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))}
                        />
                      </td>
                      <td className={cell}>
                        <input
                          type="time"
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          value={b.end}
                          onChange={(e) => setBreaks(breaks.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))}
                        />
                      </td>
                      <td className={cell}>
                        <button
                          className="text-rose-600 hover:underline disabled:opacity-50"
                          onClick={() => setBreaks(breaks.filter((_, j) => j !== i))}
                          disabled={!isEditing}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-2">
              <button
                className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-sm disabled:opacity-50"
                onClick={() => setBreaks([...breaks, { shift_code: "", start: "12:00", end: "13:00" }])}
                disabled={!isEditing}
              >
                + Add Break
              </button>
            </div>
          </fieldset>
        </section>

        {/* OT / Setup / Buffer */}
        <section id="ot" className="scroll-mt-24 bg-white border rounded-2xl shadow-sm p-4 mt-4">
          <h2 className="text-lg font-semibold">OT Rules / Setup Time / Buffer</h2>
          <p className="text-xs text-slate-500 mb-3">กำหนดกฎ OT และค่าเริ่มต้น</p>

          <fieldset disabled={!isEditing} className={!isEditing ? "opacity-80 select-none" : ""}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-3">
                <span className="w-48 text-sm">OT Daily Cap (hours)</span>
                <input
                  type="number" min={0} step={0.5}
                  className="rounded-md border border-slate-300 px-2 py-1 w-32"
                  value={otRules.daily_cap_hours}
                  onChange={(e) => setOTRules({ ...otRules, daily_cap_hours: Number(e.target.value) || 0 })}
                />
              </label>

              <label className="flex items-center gap-3">
                <span className="w-48 text-sm">Allow Weekend OT</span>
                <select
                  className="rounded-md border border-slate-300 px-2 py-1 w-40"
                  value={String(otRules.allow_weekend_ot)}
                  onChange={(e) => setOTRules({ ...otRules, allow_weekend_ot: toBool(e.target.value) })}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>

              <label className="flex items-center gap-3">
                <span className="w-48 text-sm">Default Setup (min)</span>
                <input
                  type="number" min={0} step={1}
                  className="rounded-md border border-slate-300 px-2 py-1 w-32"
                  value={otRules.default_setup_min}
                  onChange={(e) => setOTRules({ ...otRules, default_setup_min: Number(e.target.value) || 0 })}
                />
              </label>

              <label className="flex items-center gap-3">
                <span className="w-48 text-sm">Default Buffer before Due (min)</span>
                <input
                  type="number" min={0} step={5}
                  className="rounded-md border border-slate-300 px-2 py-1 w-32"
                  value={otRules.default_buffer_min}
                  onChange={(e) => setOTRules({ ...otRules, default_buffer_min: Number(e.target.value) || 0 })}
                />
              </label>
            </div>

            <hr className="my-4" />

            <h3 className="text-sm font-semibold text-slate-700">Setup Matrix (product → product)</h3>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className={th} style={{ width: 170 }}>From Product</th>
                    <th className={th} style={{ width: 170 }}>To Product</th>
                    <th className={th} style={{ width: 160 }}>Setup (min)</th>
                    <th className={th} style={{ width: 80 }} />
                  </tr>
                </thead>
                <tbody>
                  {setupMatrix.map((r, i) => (
                    <tr key={i}>
                      <td className={cell}>
                        <input
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          placeholder="P1"
                          value={r.from}
                          onChange={(e) => setSetupMatrix(setupMatrix.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)))}
                        />
                      </td>
                      <td className={cell}>
                        <input
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          placeholder="P2"
                          value={r.to}
                          onChange={(e) => setSetupMatrix(setupMatrix.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)))}
                        />
                      </td>
                      <td className={cell}>
                        <input
                          type="number" min={0} step={1}
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          value={r.setup_min}
                          onChange={(e) =>
                            setSetupMatrix(setupMatrix.map((x, j) => (j === i ? { ...x, setup_min: Number(e.target.value) || 0 } : x)))
                          }
                        />
                      </td>
                      <td className={cell}>
                        <button
                          className="text-rose-600 hover:underline disabled:opacity-50"
                          onClick={() => setSetupMatrix(setupMatrix.filter((_, j) => j !== i))}
                          disabled={!isEditing}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-2">
              <button
                className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-sm disabled:opacity-50"
                onClick={() => setSetupMatrix([...setupMatrix, { from: "", to: "", setup_min: 10 }])}
                disabled={!isEditing}
              >
                + Add Rule
              </button>
            </div>
          </fieldset>
        </section>

        {/* Constraints */}
        <section id="constraints" className="scroll-mt-24 bg-white border rounded-2xl shadow-sm p-4 mt-4">
          <h2 className="text-lg font-semibold">Constraints (Maintenance, Material Ready)</h2>
          <fieldset disabled={!isEditing} className={!isEditing ? "opacity-80 select-none" : ""}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-3">
                <span className="w-56 text-sm">Enforce Maintenance Windows</span>
                <select
                  className="rounded-md border border-slate-300 px-2 py-1 w-40"
                  value={String(constraints.enforce_maintenance)}
                  onChange={(e) => setConstraints({ ...constraints, enforce_maintenance: toBool(e.target.value) })}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>

              <label className="flex items-center gap-3">
                <span className="w-56 text-sm">Enforce Material Ready</span>
                <select
                  className="rounded-md border border-slate-300 px-2 py-1 w-40"
                  value={String(constraints.enforce_material_ready)}
                  onChange={(e) => setConstraints({ ...constraints, enforce_material_ready: toBool(e.target.value) })}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>

              <label className="flex items-center gap-3">
                <span className="w-56 text-sm">Material Ready Offset (min)</span>
                <input
                  type="number" min={0} step={5}
                  className="rounded-md border border-slate-300 px-2 py-1 w-32"
                  value={constraints.material_ready_offset_min}
                  onChange={(e) => setConstraints({ ...constraints, material_ready_offset_min: Number(e.target.value) || 0 })}
                />
              </label>

              <label className="flex items-center gap-3">
                <span className="w-56 text-sm">Freeze Window (min)</span>
                <input
                  type="number" min={0} step={5}
                  className="rounded-md border border-slate-300 px-2 py-1 w-32"
                  value={constraints.freeze_window_min}
                  onChange={(e) => setConstraints({ ...constraints, freeze_window_min: Number(e.target.value) || 0 })}
                />
              </label>
            </div>
          </fieldset>
        </section>

        {/* Maintenance Windows */}
        <section id="maint" className="scroll-mt-24 bg-white border rounded-2xl shadow-sm p-4 mt-4">
          <h2 className="text-lg font-semibold">Maintenance Windows</h2>
          <fieldset disabled={!isEditing} className={!isEditing ? "opacity-80 select-none" : ""}>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className={th} style={{ width: 120 }}>Machine ID</th>
                    <th className={th} style={{ width: 220 }}>Start</th>
                    <th className={th} style={{ width: 220 }}>End</th>
                    <th className={th} style={{ width: 160 }}>Type</th>
                    <th className={th}>Note</th>
                    <th className={th} style={{ width: 80 }} />
                  </tr>
                </thead>
                <tbody>
                  {maint.map((m, i) => (
                    <tr key={i}>
                      <td className={cell}>
                        <input
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          placeholder="M1"
                          value={m.machine_id}
                          onChange={(e) => setMaint(maint.map((x, j) => (j === i ? { ...x, machine_id: e.target.value } : x)))}
                        />
                      </td>
                      <td className={cell}>
                        <input
                          type="datetime-local"
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          value={m.start_dt}
                          onChange={(e) => setMaint(maint.map((x, j) => (j === i ? { ...x, start_dt: e.target.value } : x)))}
                        />
                      </td>
                      <td className={cell}>
                        <input
                          type="datetime-local"
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          value={m.end_dt}
                          onChange={(e) => setMaint(maint.map((x, j) => (j === i ? { ...x, end_dt: e.target.value } : x)))}
                        />
                      </td>
                      <td className={cell}>
                        <select
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          value={m.type}
                          onChange={(e) => setMaint(maint.map((x, j) => (j === i ? { ...x, type: e.target.value as MaintWin["type"] } : x)))}
                        >
                          <option value="PM">PM</option>
                          <option value="Unplanned">Unplanned</option>
                        </select>
                      </td>
                      <td className={cell}>
                        <input
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          placeholder="note"
                          value={m.note}
                          onChange={(e) => setMaint(maint.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))}
                        />
                      </td>
                      <td className={cell}>
                        <button
                          className="text-rose-600 hover:underline disabled:opacity-50"
                          onClick={() => setMaint(maint.filter((_, j) => j !== i))}
                          disabled={!isEditing}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </fieldset>
        </section>
      </div>
    </div>
  );
}
