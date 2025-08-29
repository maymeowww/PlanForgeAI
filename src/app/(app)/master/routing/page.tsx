"use client";

import React, { useMemo, useState, useEffect } from "react";
import clsx from "clsx";
import { Plus, Edit3, Trash2, Save, X } from "lucide-react";

import PageHeader from "@/src/components/layout/PageHeader";
import SearchInput from "@/src/components/shared/input/SearchInput";
import IconButton from "@/src/components/shared/button/IconButton";
import CommonTable from "@/src/components/shared/Table";
import Dropdown from "@/src/components/shared/input/Dropdown";
import { AddButton, DeleteButton, EditButton } from "@/src/components/shared/button/ActionButtons";

/* ================= Types ================= */
type RoutingLine = {
  id: number;
  fg_code: string;       // FG code
  op_no: number;         // Operation number (10,20,...)
  work_center: string;   // เช่น CUT-01
  std_time_min: number;  // นาทีต่อหน่วย
  setup_key?: string;    // กุญแจตั้งเครื่อง (optional)
  remarks?: string;      // หมายเหตุ (optional)
};

/* ================= Helpers ================= */
const nextId = (rows: { id: number }[]) =>
  (rows.reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1;

/* ================= Modal (inline, dark-ready) ================= */
function RoutingModal({
  open,
  onClose,
  onSave,
  initial,
  fgOptions = [],
  wcOptions = [],
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: Omit<RoutingLine, "id"> & { id?: number }) => void;
  initial?: Partial<RoutingLine>;
  fgOptions?: string[];
  wcOptions?: string[];
}) {
  const [fg, setFg] = useState("");
  const [op, setOp] = useState<number>(10);
  const [wc, setWc] = useState("");
  const [std, setStd] = useState<number>(0);
  const [setup, setSetup] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (!open) return;
    setFg(initial?.fg_code ?? "");
    setOp(initial?.op_no ?? 10);
    setWc(initial?.work_center ?? "");
    setStd(initial?.std_time_min ?? 0);
    setSetup(initial?.setup_key ?? "");
    setRemarks(initial?.remarks ?? "");
  }, [open, initial]);

  const canSave = fg.trim() && wc.trim() && op > 0 && std > 0;

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white text-slate-900 shadow-xl dark:bg-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <div className="text-lg font-bold">
            {initial?.id ? "Edit Routing" : "New Routing"}
          </div>
          <button className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">FG *</label>
              {fgOptions.length ? (
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                  value={fg}
                  onChange={(e) => setFg(e.target.value)}
                >
                  <option value="">-- เลือก FG --</option>
                  {fgOptions.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                  placeholder="เช่น FG-100"
                  value={fg}
                  onChange={(e) => setFg(e.target.value)}
                />
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Op# *</label>
              <input
                type="number"
                min={1}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={op}
                onChange={(e) => setOp(Number(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Work Center *</label>
              {wcOptions.length ? (
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                  value={wc}
                  onChange={(e) => setWc(e.target.value)}
                >
                  <option value="">-- เลือก Work Center --</option>
                  {wcOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                  placeholder="เช่น CUT-01"
                  value={wc}
                  onChange={(e) => setWc(e.target.value)}
                />
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Std Time (min) *</label>
              <input
                type="number"
                min={0}
                step="any"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={std}
                onChange={(e) => setStd(Number(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Setup Key</label>
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                placeholder="เช่น COLOR-BLUE / MODEL-A"
                value={setup}
                onChange={(e) => setSetup(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Remarks</label>
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                placeholder="หมายเหตุ"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-800">
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" onClick={onClose}>
            Cancel
          </button>
          <button
            className={clsx(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold",
              canSave ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed"
            )}
            onClick={() => {
              if (!canSave) return alert("กรอก FG / Op# / Work Center / Std Time ให้ครบ");
              onSave({
                id: initial?.id,
                fg_code: fg.trim(),
                op_no: op,
                work_center: wc.trim(),
                std_time_min: std,
                setup_key: setup.trim() || undefined,
                remarks: remarks.trim() || undefined,
              });
            }}
            disabled={!canSave}
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= Page ================= */
export default function RoutingPage() {
  // mock data
  const [rows, setRows] = useState<RoutingLine[]>([
    { id: 1, fg_code: "FG-100", op_no: 10, work_center: "CUT-01", std_time_min: 20, setup_key: "MTRL" },
    { id: 2, fg_code: "FG-100", op_no: 20, work_center: "ASM-01", std_time_min: 30, setup_key: "MODEL" },
    { id: 3, fg_code: "FG-100", op_no: 30, work_center: "PAI-01", std_time_min: 15, setup_key: "COLOR-BLUE" },
  ]);

  // filters
  const [q, setQ] = useState("");
  const [fgFilter, setFgFilter] = useState<string>("");
  const [wcFilter, setWcFilter] = useState<string>("");

  // paging
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => setPage(1), [q, fgFilter, wcFilter]);

  const fgOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.fg_code))).sort(),
    [rows]
  );
  const wcOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.work_center))).sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows
      .filter((r) => (!fgFilter || r.fg_code === fgFilter))
      .filter((r) => (!wcFilter || r.work_center === wcFilter))
      .filter((r) => {
        const txt = [r.fg_code, r.work_center, r.setup_key ?? "", String(r.op_no), String(r.std_time_min)]
          .join(" ")
          .toLowerCase();
        return !qq || txt.includes(qq);
      })
      .sort((a, b) => a.fg_code.localeCompare(b.fg_code) || a.op_no - b.op_no);
  }, [rows, q, fgFilter, wcFilter]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  // modal state
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const openNew = () => {
    setEditId(null);
    setOpen(true);
  };
  const openEdit = (id: number) => {
    setEditId(id);
    setOpen(true);
  };
  const handleSave = (payload: Omit<RoutingLine, "id"> & { id?: number }) => {
    if (payload.id) {
      setRows((prev) => prev.map((r) => (r.id === payload.id ? { ...r, ...payload, id: payload.id! } : r)));
    } else {
      setRows((prev) => [...prev, { ...payload, id: nextId(prev) }]);
    }
    setOpen(false);
  };
  const handleDelete = (id: number) => {
    if (!confirm("ลบ Routing นี้?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const routingColumns = [
    {
      key: "action",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      render: (r: RoutingLine) => (
        <div className="flex justify-end gap-2">
          <EditButton onClick={() => openEdit(r.id)}/>
          <DeleteButton onClick={() => handleDelete(r.id)}/>          
        </div>
      ),
    },
    { key: "fg_code", header: "FG", render: (r: RoutingLine) => <b>{r.fg_code}</b> },
    { key: "op_no", header: "Op#", render: (r: RoutingLine) => r.op_no },
    { key: "work_center", header: "Work Center" },
    { key: "std_time_min", header: "Std Time (min)", render: (r: RoutingLine) => r.std_time_min },
    { key: "setup_key", header: "Setup Key", render: (r: RoutingLine) => r.setup_key || "-" },
    { key: "remarks", header: "Remarks", render: (r: RoutingLine) => r.remarks || "-" },
  ] as const;

  return (
    <>
      <PageHeader
        title="Routing"
        actions={
          <AddButton label="New Routing" onClick={openNew}/>          
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="ค้นหา FG / work center / op / setup" />

          <Dropdown
            value={fgFilter}
            onChange={(v) => setFgFilter(String(v))}
            options={[{ label: "All FG", value: "" }, ...fgOptions.map((x) => ({ label: x, value: x }))]}
            selectClassName="h-10"
          />
          <Dropdown
            value={wcFilter}
            onChange={(v) => setWcFilter(String(v))}
            options={[{ label: "All Work Centers", value: "" }, ...wcOptions.map((x) => ({ label: x, value: x }))]}
            selectClassName="h-10"
          />

          <div className="ml-auto">
            <IconButton variant="ok" label="New Routing" onClick={openNew}>
              <Plus size={18} />
            </IconButton>
          </div>
        </div>

        <section className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm bg-white dark:bg-slate-900">
          <CommonTable<RoutingLine>
            columns={routingColumns as any}
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

      <RoutingModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        initial={rows.find((r) => r.id === editId) || undefined}
        fgOptions={fgOptions}
        wcOptions={wcOptions}
      />
    </>
  );
}
