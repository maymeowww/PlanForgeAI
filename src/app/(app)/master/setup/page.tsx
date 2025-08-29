"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";

import PageHeader from "@/src/components/layout/PageHeader";
import ImportButton from "@/src/components/shared/button/ImportButton";
import ExportButton from "@/src/components/shared/button/ExportButton";
import IconButton from "@/src/components/shared/button/IconButton";
import SearchInput from "@/src/components/shared/input/SearchInput";
import CommonTable from "@/src/components/shared/Table";
import { AddButton, DeleteButton, EditButton } from "@/src/components/shared/button/ActionButtons";

type SetupMatrixLine = {
  id: number;
  from: string;
  to: string;
  minutes: number;
};

export default function SetupMatrixPage() {
  const [lines, setLines] = useState<SetupMatrixLine[]>([
    { id: 1, from: "COLOR-RED", to: "COLOR-BLUE", minutes: 25 },
  ]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return lines.filter(
      (l) =>
        l.from.toLowerCase().includes(q) ||
        l.to.toLowerCase().includes(q) ||
        String(l.minutes).includes(q)
    );
  }, [lines, query]);
  useEffect(() => setPage(1), [query]);

  const total = filtered.length;
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const saveLine = (payload: Omit<SetupMatrixLine, "id"> & { id?: number }) => {
    if (payload.id) {
      setLines((prev) =>
        prev.map((l) => (l.id === payload.id ? { ...l, ...payload } : l))
      );
    } else {
      const id = (Math.max(0, ...lines.map((x) => x.id)) || 0) + 1;
      setLines((prev) => [...prev, { ...payload, id } as SetupMatrixLine]);
    }
    setModalOpen(false);
    setEditId(null);
  };

  const deleteLine = (id: number) => {
    if (!confirm("ลบ Setup Matrix line นี้?")) return;
    setLines((prev) => prev.filter((x) => x.id !== id));
  };

  const columns = [
    {
      key: "action",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      render: (l: SetupMatrixLine) => (
        <div className="flex justify-end gap-2">
          <EditButton onClick={() => { setEditId(l.id); setModalOpen(true); }}/>
          <DeleteButton onClick={() => deleteLine(l.id)}/>  
        </div>
      ),
    },
    { key: "from", header: "From" },
    { key: "to", header: "To" },
    { key: "minutes", header: "Setup (min)" },
  ] as const;

  return (
    <>
      <PageHeader
        title="Setup Matrix"
        actions={
          <>
            <ImportButton onFilesSelected={(f) => console.log("import:", f)} />
            <ExportButton filename="setup.json" data={{ lines }} />
          </>
        }
      />

      <div className="max-w-4xl mx-auto px-6 py-6">
        <section className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-sm">
          <div className="mb-3 flex gap-2 items-center">
            <SearchInput value={query} onChange={setQuery} placeholder="ค้นหา from / to / minutes" />
            <div className="ml-auto">
              <AddButton label="New Setup" onClick={() => { setEditId(null); setModalOpen(true); }}/>                            
            </div>
          </div>
          <CommonTable<SetupMatrixLine>
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

      {/* Modal (simplify) */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-lg p-5">
            <h2 className="text-lg font-bold mb-4">
              {editId ? "Edit Setup Line" : "New Setup Line"}
            </h2>
            <SetupForm
              initial={lines.find((l) => l.id === editId)}
              onCancel={() => { setModalOpen(false); setEditId(null); }}
              onSave={saveLine}
            />
          </div>
        </div>
      )}
    </>
  );
}

function SetupForm({
  initial,
  onCancel,
  onSave,
}: {
  initial?: SetupMatrixLine;
  onCancel: () => void;
  onSave: (p: Omit<SetupMatrixLine, "id"> & { id?: number }) => void;
}) {
  const [from, setFrom] = useState(initial?.from ?? "");
  const [to, setTo] = useState(initial?.to ?? "");
  const [minutes, setMinutes] = useState(initial?.minutes ?? 0);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-1">From</label>
        <input value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded border px-2 py-1 dark:bg-slate-800 dark:border-slate-700" />
      </div>
      <div>
        <label className="block text-sm mb-1">To</label>
        <input value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded border px-2 py-1 dark:bg-slate-800 dark:border-slate-700" />
      </div>
      <div>
        <label className="block text-sm mb-1">Setup (min)</label>
        <input type="number" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="w-full rounded border px-2 py-1 dark:bg-slate-800 dark:border-slate-700" />
      </div>
      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 rounded bg-slate-400 dark:bg-slate-700" onClick={onCancel}>Cancel</button>
        <button
          className="px-4 py-2 rounded bg-indigo-600 text-white"
          onClick={() => onSave({ id: initial?.id, from, to, minutes })}
        >
          Save
        </button>
      </div>
    </div>
  );
}
