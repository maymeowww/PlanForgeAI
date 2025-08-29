"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";

import PageHeader from "@/src/components/layout/PageHeader";
import ImportButton from "@/src/components/shared/button/ImportButton";
import ExportButton from "@/src/components/shared/button/ExportButton";
import IconButton from "@/src/components/shared/button/IconButton";
import SearchInput from "@/src/components/shared/input/SearchInput";
import Dropdown from "@/src/components/shared/input/Dropdown";
import CommonTable from "@/src/components/shared/Table";

import BomModal, { BomLine } from "@/src/app/(app)/master/components/BomModal";
import { AddButton, DeleteButton, EditButton } from "@/src/components/shared/button/ActionButtons";

/* ================= Page ================= */
export default function BomPage() {
  // ---- Mock data (ตัวอย่างเริ่มต้น) ----
  const [bomLines, setBomLines] = useState<BomLine[]>([
    { id: 1, fg_code: "ELEC-001", component_code: "RM-001", usage: 2, unit_code: "pcs" },
    { id: 2, fg_code: "ELEC-001", component_code: "RM-002", usage: 6, unit_code: "pcs", substitute: "RM-002B" },
    { id: 3, fg_code: "AUTO-002", component_code: "RM-010", usage: 1.5, unit_code: "kg", scrap_pct: 2 },
  ]);

  // สมมุติรายการ FG/หน่วย (จริง ๆ ควรดึงจาก Product/Unit master)
  const fgOptions = useMemo(
    () => Array.from(new Set(bomLines.map((b) => b.fg_code))).sort(),
    [bomLines]
  );
  const unitOptions = ["pcs", "kg", "m"];

  // ---- UI States ----
  const [query, setQuery] = useState("");
  const [fgFilter, setFgFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // เปลี่ยน filter/ค้นหา → กลับหน้า 1
  useEffect(() => setPage(1), [query, fgFilter]);

  // ---- Filtered + Sorted ----
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bomLines
      .filter((b) => (!fgFilter || b.fg_code === fgFilter))
      .filter((b) => {
        const txt = [
          b.fg_code,
          b.component_code,
          b.unit_code ?? "",
          String(b.usage ?? ""),
          b.substitute ?? "",
          b.remarks ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return !q || txt.includes(q);
      })
      .sort(
        (a, b) =>
          a.fg_code.localeCompare(b.fg_code) ||
          (a.component_code || "").localeCompare(b.component_code || "")
      );
  }, [bomLines, query, fgFilter]);

  // ---- Paging ----
  const total = filtered.length;
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  // ---- Modal state ----
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const openNew = () => {
    setEditId(null);
    setModalOpen(true);
  };
  const openEdit = (id: number) => {
    setEditId(id);
    setModalOpen(true);
  };

  // ---- CRUD Handlers ----
  const handleSave = (payload: BomLine) => {
    if (payload.id) {
      // update
      setBomLines((prev) =>
        prev.map((b) => (b.id === payload.id ? { ...b, ...payload } : b))
      );
    } else {
      // create
      const nextId = (Math.max(0, ...bomLines.map((x) => x.id || 0)) || 0) + 1;
      setBomLines((prev) => [...prev, { ...payload, id: nextId }]);
    }
    setModalOpen(false);
    setEditId(null);
  };

  const handleDelete = (id: number) => {
    if (!confirm("ลบ BOM line นี้?")) return;
    setBomLines((prev) => prev.filter((b) => b.id !== id));
  };

  // ---- Columns ----
  const columns = [
    {
      key: "action",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      render: (b: BomLine) => (
        <div className="flex gap-2">
          <EditButton onClick={() => openEdit(b.id ?? 0)} />
          <DeleteButton onClick={() => b.id != null && handleDelete(b.id)} />
        </div>
      ),
    },
    { key: "fg_code", header: "FG", render: (b: BomLine) => <b>{b.fg_code}</b> },
    { key: "component_code", header: "Component" },
    { key: "usage", header: "Usage", render: (b: BomLine) => b.usage ?? "-" },
    { key: "unit_code", header: "Unit", render: (b: BomLine) => b.unit_code || "-" },
    { key: "substitute", header: "Substitute", render: (b: BomLine) => b.substitute || "-" },
    {
      key: "scrap_pct",
      header: "Scrap %",
      render: (b: BomLine) => (typeof b.scrap_pct === "number" ? `${b.scrap_pct}%` : "-"),
    },
    { key: "remarks", header: "Remarks", render: (b: BomLine) => b.remarks || "-" },
  ] as const;

  return (
    <>
      <PageHeader
        title="Bill of Materials (BOM)"
        actions={
          <>
            <ImportButton
              onFilesSelected={(files) => {
                // TODO: parse CSV/Excel > push to setBomLines
                console.log("BOM import:", files[0]?.name);
              }}
            />
            <ExportButton filename="bom.json" data={{ bomLines }} />
          </>
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-6">
        <section className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm bg-white dark:bg-slate-900">
          {/* Toolbar */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={
                fgFilter
                  ? `ค้นหาใน FG ${fgFilter} (component/usage/unit/substitute/remarks)`
                  : "ค้นหา fg/component/usage/unit/substitute/remarks"
              }
            />
            <Dropdown
              value={fgFilter}
              onChange={(v) => setFgFilter(String(v))}
              options={[{ label: "All FG", value: "" }, ...fgOptions.map((f) => ({ label: f, value: f }))]}
              selectClassName="h-10"
            />
            <div className="ml-auto">
              <AddButton label="New BOM Line" onClick={openNew}/>   
            </div>
          </div>

          {/* Table */}
          <CommonTable<BomLine>
            columns={columns as any}
            data={paged}
            pagination={{
              total,
              page,
              pageSize,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
              pageSizes: [10, 20, 50],
            }}
          />
        </section>
      </div>

      {/* Modal */}
      <BomModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditId(null);
        }}
        bom={(editId ? bomLines.find((b) => b.id === editId) : undefined) || undefined}
        onSave={handleSave}
        fgOptions={fgOptions}
        unitOptions={unitOptions}
        // theme="auto" | "dark" | "light"  // ถ้าต้องการบังคับธีม
      />
    </>
  );
}
