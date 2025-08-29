"use client";

import React, { useMemo, useState } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";

import PageHeader from "@/src/components/layout/PageHeader";
import ImportButton from "@/src/components/shared/button/ImportButton";
import ExportButton from "@/src/components/shared/button/ExportButton";
import IconButton from "@/src/components/shared/button/IconButton";
import SearchInput from "@/src/components/shared/input/SearchInput";
import CommonTable from "@/src/components/shared/Table";
import MachineModal from "@/src/app/(app)/master/components/MachineModal";
import { AddButton, DeleteButton, EditButton } from "@/src/components/shared/button/ActionButtons";

/* ========= Types ========= */
type Machine = {
  machine_id: string;
  machine_code: string;
  name: string;
  type: string;
  capabilities: string[];
  status: "active" | "down" | "standby";
  location_id: string;
  description: string;
  installation_date: string | null;
  purchase_date: string | null;
  last_maintenance_date: string | null;
  std_rate_min: number;
  capacity_unit: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
};

/* ========= Page ========= */
export default function MachineMasterPage() {
  const [machines, setMachines] = useState<Machine[]>([
    {
      machine_id: "MCH-001",
      machine_code: "CNCL-3000-01",
      name: "CNC Lathe 3000",
      type: "CNC Lathe",
      capabilities: ["turning", "cutting", "drilling"],
      status: "active",
      location_id: "LOC-001",
      description: "High precision CNC lathe for metal parts",
      installation_date: "2022-11-15",
      purchase_date: "2022-10-01",
      last_maintenance_date: "2025-07-01",
      std_rate_min: 0.3,
      capacity_unit: "pcs/hour",
      notes: "Requires calibration every 6 months",
      created_at: "2024-01-15T08:00:00Z",
      updated_at: "2025-01-10T12:00:00Z",
    },
  ]);

  const [macQ, setMacQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  /* ===== Filter & Paging ===== */
  const filtered = useMemo(() => {
    const q = macQ.trim().toLowerCase();
    return machines.filter((m) => {
      const txt = [
        m.machine_id,
        m.machine_code,
        m.name,
        m.type,
        m.status,
        m.location_id,
        m.description,
      ]
        .join(" ")
        .toLowerCase();
      return !q || txt.includes(q);
    });
  }, [machines, macQ]);

  const total = filtered.length;
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  /* ===== Columns ===== */
  const machineColumns = [
    {
      key: "action",
      header: "Action",
      className: "text-right",
      render: (m: Machine) => (
        <div className="flex justify-end gap-2">
          <EditButton onClick={() => openModal(m.machine_id)}/>
          <DeleteButton onClick={() => delMachine(m.machine_id)}/>          
        </div>
      ),
    },
    { key: "machine_code", header: "Code", render: (m: Machine) => <b>{m.machine_code}</b> },
    { key: "name", header: "Name" },
    { key: "type", header: "Type" },
    { key: "status", header: "Status", render: (m: Machine) => m.status },
    { key: "std_rate_min", header: "Std Rate (min)", render: (m: Machine) => m.std_rate_min },
    { key: "capacity_unit", header: "Capacity Unit" },
    { key: "location_id", header: "Location" },
  ] as const;

  /* ===== Handlers ===== */
  const openModal = (id: string | null = null) => {
    setEditId(id);
    setModalOpen(true);
  };

  const delMachine = (id: string) => {
    if (!confirm("ลบเครื่องจักรนี้?")) return;
    setMachines((prev) => prev.filter((x) => x.machine_id !== id));
  };

  const handleSave = (
    m: Omit<Machine, "created_at" | "updated_at"> & { machine_id?: string },
    caps: string[]
  ) => {
    const obj: Machine = {
      ...m,
      machine_id: m.machine_id || `MCH-${machines.length + 1}`,
      capabilities: caps,
      created_at: m.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (editId) {
      setMachines((prev) =>
        prev.map((x) => (x.machine_id === editId ? { ...obj, machine_id: editId } : x))
      );
    } else {
      setMachines((prev) => [...prev, obj]);
    }
    setModalOpen(false);
    setEditId(null);
  };

  return (
    <>
      <PageHeader
        title="Machine Master"
        actions={
          <>
            <ImportButton onFilesSelected={(files) => console.log("machines import:", files[0]?.name)} />
            <ExportButton filename="machines.json" data={{ machines }} />
          </>
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-6">
        <section className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm bg-white dark:bg-slate-900">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SearchInput value={macQ} onChange={setMacQ} placeholder="ค้นหา code / name / type / location" />
            <div className="ml-auto">          
              <AddButton label="New Machine" onClick={() => openModal(null)}/>              
            </div>
          </div>

          <CommonTable<Machine>
            columns={machineColumns as any}
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

      <MachineModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditId(null);
        }}
        machine={machines.find((x) => x.machine_id === editId)}
        capabilities={machines.find((x) => x.machine_id === editId)?.capabilities || []}
        onSave={handleSave}
        onRemoveCapability={() => {}}
      />
    </>
  );
}
