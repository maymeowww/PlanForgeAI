"use client";

import { useRef, useState } from "react";

type Props = {
  label?: string;                  // ข้อความปุ่ม
  accept?: string;                 // นามสกุลไฟล์ (ดีฟอลต์ CSV/Excel)
  onFilesSelected?: (files: FileList) => void; // callback เมื่อเลือกไฟล์
  className?: string;
};

export default function ImportButton({
  label = "Import CSV/Excel",
  accept = ".csv,.xlsx,.xls",
  onFilesSelected,
  className = "",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState<string>("");

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFilename(e.target.files[0].name);
      onFilesSelected?.(e.target.files);
      // TODO: ใส่ parser CSV/Excel ที่ต้องการ (PapaParse/SheetJS) ตรงนี้ในอนาคต
      console.log("Selected files:", Array.from(e.target.files).map(f => f.name));
    }
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        {/* ไอคอน Import (ลูกศรลงเข้า tray) */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3v10m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 15v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        {label}
      </button>

      {filename && (
        <span className="ml-3 text-xs text-gray-500 truncate max-w-[200px]" title={filename}>
          {filename}
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
