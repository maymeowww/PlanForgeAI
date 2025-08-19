"use client";

import { Download } from "lucide-react";
import IconButton from "./IconButton";

type Props = {
  label?: string;                 // ข้อความ tooltip
  filename?: string;              // ชื่อไฟล์ export (จะเติมนามสกุลให้ตาม type)
  data: any;                      // ข้อมูลที่จะ export
  type?: "json" | "csv" | "txt";  // ประเภทไฟล์
  className?: string;             // ใช้จัด layout ภายนอก
};

export default function ExportButton({
  label = "Export JSON",
  filename = "data.json",
  data,
  type = "json",
  className = "",
}: Props) {
  const handleExport = () => {
    let content = "";
    let mime = "application/json";
    let name = filename; // อย่าแก้ prop ตรงๆ

    if (type === "json") {
      content = JSON.stringify(data, null, 2);
      mime = "application/json";
      if (!name.endsWith(".json")) name = name.replace(/\..*$/, "") + ".json";
    } else if (type === "csv") {
      if (!Array.isArray(data)) {
        alert("CSV ต้องเป็น array ของ object");
        return;
      }
      // รวมคีย์ทั้งหมดจากทุกแถว เพื่อกันคีย์ตกหล่น
      const allKeys = Array.from(
        new Set(data.flatMap((r: Record<string, any>) => Object.keys(r || {})))
      );

      const escape = (v: any) => {
        if (v == null) return "";
        let s = Array.isArray(v) ? v.join("|") : String(v);
        s = s.replace(/"/g, '""'); // escape double quotes
        return `"${s}"`;
      };

      const rows = data.map((row: Record<string, any>) =>
        allKeys.map((k) => escape(row?.[k])).join(",")
      );

      content = [allKeys.join(","), ...rows].join("\n");
      mime = "text/csv";
      if (!name.endsWith(".csv")) name = name.replace(/\..*$/, "") + ".csv";
    } else {
      // txt
      content = String(data);
      mime = "text/plain";
      if (!name.endsWith(".txt")) name = name.replace(/\..*$/, "") + ".txt";
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className={className}>
      <IconButton tooltip={label} onClick={handleExport}>
        <Download size={18} />
      </IconButton>
    </div>
  );
}
