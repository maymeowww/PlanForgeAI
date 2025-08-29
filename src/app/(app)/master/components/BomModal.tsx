"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Save } from "lucide-react";
import clsx from "clsx";

/** ===== Types ===== */
export type BomLine = {
  id: number | null;
  fg_code: string;
  component_code: string;
  usage: number;
  unit_code?: string;
  substitute?: string;
  scrap_pct?: number;
  remarks?: string;
};

type ThemeMode = "auto" | "light" | "dark";

type BomModalProps = {
  isOpen: boolean;
  onClose: () => void;
  bom?: Partial<BomLine>;
  onSave: (payload: BomLine) => void;
  fgOptions?: string[];
  unitOptions?: string[];
  /** "auto" = ตาม global; "dark"/"light" = บังคับโหมดเฉพาะ modal นี้ */
  theme?: ThemeMode;
};

/** ===== Helpers ===== */
const toNum = (v: string | number | undefined | null): number =>
  Number(v ?? 0) || 0;

const fieldBase =
  "w-full rounded-lg border px-3 py-2 outline-none transition-colors " +
  "border-gray-300 bg-white text-gray-900 " +
  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 " +
  "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 " +
  "dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40";

const labelCls = "mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200";

const BomModal: React.FC<BomModalProps> = ({
  isOpen,
  onClose,
  bom,
  onSave,
  fgOptions = [],
  unitOptions = ["pcs"],
  theme = "auto",
}) => {
  const [fgCode, setFgCode] = useState("");
  const [comp, setComp] = useState("");
  const [usage, setUsage] = useState<number>(0);
  const [unit, setUnit] = useState(unitOptions[0] ?? "pcs");
  const [sub, setSub] = useState("");
  const [scrap, setScrap] = useState<number>(0);
  const [remarks, setRemarks] = useState("");

  const isEdit = useMemo(() => !!bom?.id, [bom]);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFgCode(bom?.fg_code ?? "");
    setComp(bom?.component_code ?? "");
    setUsage(toNum(bom?.usage));
    setUnit(bom?.unit_code ?? (unitOptions[0] ?? "pcs"));
    setSub(bom?.substitute ?? "");
    setScrap(toNum(bom?.scrap_pct));
    setRemarks(bom?.remarks ?? "");
    setTimeout(() => firstFieldRef.current?.focus(), 0);
  }, [isOpen, bom, unitOptions]);

  const canSave = fgCode.trim() && comp.trim() && usage > 0;

  const handleSave = () => {
    if (!canSave) return alert("กรอก FG / Component / Usage ให้ครบถ้วน");
    onSave({
      id: (bom?.id ?? null) as number | null,
      fg_code: fgCode.trim(),
      component_code: comp.trim(),
      usage,
      unit_code: unit.trim(),
      substitute: sub.trim() || undefined,
      scrap_pct: scrap || undefined,
      remarks: remarks.trim() || undefined,
    });
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSave();
  };

  if (!isOpen) return null;

  // ถ้าบังคับ theme เป็น dark -> พันด้วย .dark เฉพาะ modal นี้
  const Themer: React.FC<{ children: React.ReactNode }> =
    theme === "dark"
      ? ({ children }) => <div className="dark">{children}</div>
      : ({ children }) => <>{children}</>;

  return (
    <Themer>
      <div
        className={clsx(
          "fixed inset-0 z-[1000] flex items-center justify-center p-4",
          "bg-black/40 dark:bg-black/60"
        )}
        onKeyDown={handleKeyDown}
      >
        <div
          className={clsx(
            "w-full max-w-2xl overflow-hidden rounded-xl shadow-xl",
            "bg-white text-gray-900",
            "dark:bg-gray-900 dark:text-gray-100"
          )}
        >
          {/* Header */}
          <div
            className={clsx(
              "flex items-center justify-between px-5 py-3 border-b",
              "border-gray-200 dark:border-gray-800"
            )}
          >
            <div className="text-lg font-bold">
              {isEdit ? "Edit BOM Line" : "New BOM Line"}
            </div>
            <button
              className={clsx(
                "rounded-md p-2 transition-colors",
                "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* FG */}
              <div>
                <label className={labelCls}>FG *</label>
                {fgOptions.length ? (
                  <select
                    className={fieldBase}
                    value={fgCode}
                    onChange={(e) => setFgCode(e.target.value)}
                  >
                    <option value="">-- เลือก FG --</option>
                    {fgOptions.map((fg) => (
                      <option key={fg} value={fg}>
                        {fg}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    ref={firstFieldRef}
                    className={fieldBase}
                    placeholder="เช่น ELEC-001"
                    value={fgCode}
                    onChange={(e) => setFgCode(e.target.value)}
                  />
                )}
              </div>

              {/* Component */}
              <div>
                <label className={labelCls}>Component *</label>
                <input
                  className={fieldBase}
                  placeholder="เช่น RM-010"
                  value={comp}
                  onChange={(e) => setComp(e.target.value)}
                />
              </div>

              {/* Usage */}
              <div>
                <label className={labelCls}>Usage *</label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  className={fieldBase}
                  placeholder="เช่น 1 หรือ 2.5"
                  value={Number.isNaN(usage) ? "" : usage}
                  onChange={(e) => setUsage(toNum(e.target.value))}
                />
              </div>

              {/* Unit */}
              <div>
                <label className={labelCls}>Unit</label>
                {unitOptions.length ? (
                  <select
                    className={fieldBase}
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={fieldBase}
                    placeholder="pcs / kg / m"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                )}
              </div>

              {/* Substitute */}
              <div>
                <label className={labelCls}>Substitute</label>
                <input
                  className={fieldBase}
                  placeholder="เช่น RM-011 (optional)"
                  value={sub}
                  onChange={(e) => setSub(e.target.value)}
                />
              </div>

              {/* Scrap % */}
              <div>
                <label className={labelCls}>Scrap %</label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  className={fieldBase}
                  placeholder="เช่น 1 หรือ 2.5"
                  value={Number.isNaN(scrap) ? "" : scrap}
                  onChange={(e) => setScrap(toNum(e.target.value))}
                />
              </div>

              {/* Remarks */}
              <div className="md:col-span-2">
                <label className={labelCls}>Remarks</label>
                <input
                  className={fieldBase}
                  placeholder="โน้ตเพิ่มเติม (optional)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              กด <kbd className="rounded bg-gray-100 px-1 dark:bg-gray-800">Ctrl</kbd>/
              <kbd className="rounded bg-gray-100 px-1 dark:bg-gray-800">⌘</kbd>{" "}
              + <kbd className="rounded bg-gray-100 px-1 dark:bg-gray-800">Enter</kbd>{" "}
              เพื่อบันทึกเร็ว
            </p>
          </div>

          {/* Footer */}
          <div
            className={clsx(
              "flex items-center justify-end gap-2 px-5 py-3 border-t",
              "border-gray-200 dark:border-gray-800"
            )}
          >
            <button
              className={clsx(
                "rounded-lg px-4 py-2 transition-colors",
                "border border-gray-300 text-gray-700 hover:bg-gray-100",
                "dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              )}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className={clsx(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors",
                canSave
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
              )}
              onClick={handleSave}
              disabled={!canSave}
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>
      </div>
    </Themer>
  );
};

export default BomModal;
