"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { Upload, Check } from "lucide-react";
import IconButton from "./IconButton";

type ExportType = "json" | "csv" | "txt";

type Props = {
  label?: string;                 // tooltip ของปุ่ม
  filename?: string;              // ชื่อพื้นฐานของไฟล์ (จะเติมนามสกุลให้อัตโนมัติ)
  data: any;                      // ข้อมูลที่จะ export
  defaultType?: ExportType;       // ค่าเริ่มต้นเวลาเปิดเมนู
  allowedTypes?: ExportType[];    // จำกัดประเภทที่ให้เลือก (ไม่ระบุ = ทั้งหมด)
  className?: string;
  csvDelimiter?: string;          // ตัวคั่น CSV (ค่าเริ่มต้น = ,)
  csvIncludeHeader?: boolean;     // ใส่ header แถวแรก (default true)
  csvWithBOM?: boolean;           // เพิ่ม BOM เพื่อกันภาษาไทยเพี้ยนใน Excel (default true)
};

export default function ExportButton({
  label = "Export",
  filename = "data",
  data,
  defaultType = "json",
  allowedTypes,
  className = "",
  csvDelimiter = ",",
  csvIncludeHeader = true,
  csvWithBOM = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pendingType, setPendingType] = useState<ExportType>(defaultType);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const options = useMemo<ExportType[]>(
    () => (allowedTypes && allowedTypes.length ? allowedTypes : ["json", "csv", "txt"]),
    [allowedTypes]
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const normalizeName = (base: string, ext: string) => {
    const clean = base.replace(/\.(json|csv|txt)$/i, "");
    return `${clean}.${ext}`;
  };

  const toCSV = (rows: any[], delimiter = ",", includeHeader = true) => {
    if (!Array.isArray(rows)) throw new Error("CSV requires an array of objects");
    const allKeys = Array.from(
      new Set(rows.flatMap((r) => Object.keys((r ?? {}) as Record<string, any>)))
    );
    const esc = (v: any) => {
      if (v == null) return "";
      let s = Array.isArray(v) ? v.join("|") : String(v);
      s = s.replace(/"/g, '""');
      return `"${s}"`;
    };
    const out: string[] = [];
    if (includeHeader) out.push(allKeys.join(delimiter));
    for (const row of rows) {
      out.push(allKeys.map((k) => esc((row ?? {})[k])).join(delimiter));
    }
    return out.join("\n");
  };

  const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doExport = (t: ExportType) => {
    let blob: Blob;
    let name = filename;

    if (t === "json") {
      const content = JSON.stringify(data, null, 2);
      name = normalizeName(name, "json");
      blob = new Blob([content], { type: "application/json" });
    } else if (t === "csv") {
      if (!Array.isArray(data)) {
        alert("CSV ต้องเป็น array ของ object");
        return;
      }
      const csv = toCSV(data, csvDelimiter, csvIncludeHeader);
      name = normalizeName(name, "csv");
      // เพิ่ม BOM กันภาษาไทย/ยูนิโค้ดเพี้ยนใน Excel
      const parts = csvWithBOM ? [new Uint8Array([0xef, 0xbb, 0xbf]), csv] : [csv];
      blob = new Blob(parts, { type: "text/csv;charset=utf-8" });
    } else {
      const text = typeof data === "string" ? data : String(data);
      name = normalizeName(name, "txt");
      blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    }

    download(blob, name);
  };

  const onChoose = (t: ExportType, autoDownload = true) => {
    setPendingType(t);
    if (autoDownload) {
      doExport(t);
      setOpen(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <IconButton tooltip={label} onClick={() => setOpen((v) => !v)}>
        <Upload size={18} />
      </IconButton>

      {open && (
<div
  role="menu"
  aria-label="Choose export file type"
  className="absolute right-0 z-[9999] mt-2 min-w-44 rounded-xl border border-black/10 bg-white shadow-xl"
>
  {/* header */}
  <div className="sticky top-0 z-10 bg-white px-3 py-2 text-xs font-medium text-gray-500 border-b">
    Export as…
  </div>

  {options.map((opt) => (
    <button
      key={opt}
      role="menuitem"
      onClick={() => onChoose(opt)}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
    >
      <span className="capitalize">{opt}</span>
      {pendingType === opt && <Check size={16} className="ml-auto" />}
    </button>
  ))}

  {/* แถวปุ่มย่อย: เลือกไว้ก่อนแล้วค่อยกด Export */}
  <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
    <div className="text-xs text-gray-500">
      Selected: <b className="uppercase">{pendingType}</b>
    </div>
    <button
      onClick={() => {
        doExport(pendingType);
        setOpen(false);
      }}
      className="rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
    >
      Export
    </button>
  </div>
</div>


      )}
    </div>
  );
}
