// lib/api.ts
// import axios from "axios";

// export const getHolidays = async () => {
//   const res = await axios.get("/api/holidays");
//   return res.data;
// };

// export const getShifts = async () => {
//   const res = await axios.get("/api/shifts");
//   return res.data;
// };

// export const getBreaks = async () => {
//   const res = await axios.get("/api/breaks");
//   return res.data;
// };

// export const getOTRules = async () => {
//   const res = await axios.get("/api/ot-rules");
//   return res.data;
// };

// export const getSetupMatrix = async () => {
//   const res = await axios.get("/api/setup-matrix");
//   return res.data;
// };

// export const getConstraints = async () => {
//   const res = await axios.get("/api/constraints");
//   return res.data;
// };

// export const getMaintenances = async () => {
//   const res = await axios.get("/api/maintenances");
//   return res.data;
// };


// =========== Setting ===============

import type { Holiday, Shift, BreakRow, OTRules, SetupRule, Constraints, MaintWin } from "@/src/types";

const mockHolidays: Holiday[] = [
  { start_date: "2025-12-31", end_date: "2026-01-01", description: "New Year's Day", is_recurring: true },
  { start_date: "2025-04-13", end_date: "2025-04-15", description: "Songkran Festival", is_recurring: true },
];

const mockShifts: Shift[] = [
  { code: "A", start: "08:00", end: "17:00", lines: ["Assembly", "Packing"] },
  { code: "B", start: "20:00", end: "05:00", lines: ["Assembly"] },
];

const mockBreaks: BreakRow[] = [
  { shift_code: "A", start: "12:00", end: "13:00" },
  { shift_code: "B", start: "00:00", end: "00:30" },
];

const mockOTRules: OTRules = {
  daily_cap_hours: 2,
  allow_weekend_ot: true,
  default_setup_min: 10,
  default_buffer_min: 30,
};

const mockSetupMatrix: SetupRule[] = [
  { from: "P1", to: "P2", setup_min: 12 },
  { from: "P2", to: "P3", setup_min: 18 },
];

const mockConstraints: Constraints = {
  enforce_maintenance: true,
  enforce_material_ready: true,
  material_ready_offset_min: 0,
  freeze_window_min: 120,
};

const mockMaint: MaintWin[] = [
  { machine_id: "M2", start_dt: "2025-08-20T13:00", end_dt: "2025-08-20T15:00", type: "PM", note: "quarterly" },
  { machine_id: "M1", start_dt: "2025-08-22T09:00", end_dt: "2025-08-22T10:00", type: "Unplanned", note: "vibration" },
];

// Mock APIs
export const getHolidays = async () => mockHolidays;
export const getShifts = async () => mockShifts;
export const getBreaks = async () => mockBreaks;
export const getOTRules = async () => mockOTRules;
export const getSetupMatrix = async () => mockSetupMatrix;
export const getConstraints = async () => mockConstraints;
export const getMaintenances = async () => mockMaint;
