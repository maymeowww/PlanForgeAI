import React from "react";
import clsx from "clsx";
import { Pencil, Download, Check, X } from "lucide-react";

interface ProjectSettingsHeaderProps {
  hasShadow: boolean;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  handleSave: () => void;
  handleCancel: () => void;
  downloadJSON: (filename: string, data: any) => void;
  payload: any;
}

const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm";

export const ProjectSettingsHeader: React.FC<ProjectSettingsHeaderProps> = ({
  hasShadow,
  isEditing,
  setIsEditing,
  handleSave,
  handleCancel,
  downloadJSON,
  payload,
}) => {
  return (
    <header
      className={clsx(
        "py-2 sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70",
        hasShadow ? "shadow-sm" : "shadow-none"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold leading-tight">
            ⚙️ Project Settings
          </h1>
          <p className="text-xs md:text-sm text-slate-600 truncate">
            กำหนดกะทำงาน, วันหยุด, OT/Setup/Buffer, ข้อจำกัด และบำรุงรักษา
          </p>
        </div>

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
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                title="Save"
                onClick={handleSave}
                aria-label="Save"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                className={iconBtn}
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
  );
};
