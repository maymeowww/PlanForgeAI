"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Save, X } from "lucide-react";

import PageHeader from "@/src/components/layout/PageHeader";
import ImportButton from "@/src/components/shared/button/ImportButton";
import ExportButton from "@/src/components/shared/button/ExportButton";
import IconButton from "@/src/components/shared/button/IconButton";
import SearchInput from "@/src/components/shared/input/SearchInput";
import CommonTable from "@/src/components/shared/Table";
import { AddButton, DeleteButton, EditButton } from "@/src/components/shared/button/ActionButtons";

/* ================= Types ================= */
type Supplier = {
  id: number;
  name: string;
  lead_time_days: number; // LT (days)
  moq?: number;
  contact_name?: string;
  phone?: string;
  email?: string;
  rating?: number; // 1..5
  terms?: string;  // e.g., "NET30"
  remarks?: string;
  active?: boolean;
};

type Warehouse = {
  id: number;
  code: string;   // e.g., "RM-A"
  name: string;   // e.g., "Raw A"
  policy?: "FIFO" | "LIFO" | "FEFO" | "None";
  location?: string; // address / site
  capacity?: string; // e.g., "2000 m²" / "50 pallets"
  remarks?: string;
  active?: boolean;
};

/* ================= Helpers ================= */
const nextId = (rows: { id: number }[]) =>
  (rows.reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1;

/* ================== Supplier Modal ================== */
function SupplierModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: Omit<Supplier, "id"> & { id?: number }) => void;
  initial?: Partial<Supplier>;
}) {
  const [name, setName] = useState("");
  const [lt, setLt] = useState<number>(1);
  const [moq, setMoq] = useState<number>(0);
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState<number>(4);
  const [terms, setTerms] = useState("NET30");
  const [remarks, setRemarks] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setLt(initial?.lead_time_days ?? 1);
    setMoq(initial?.moq ?? 0);
    setContact(initial?.contact_name ?? "");
    setPhone(initial?.phone ?? "");
    setEmail(initial?.email ?? "");
    setRating(initial?.rating ?? 4);
    setTerms(initial?.terms ?? "NET30");
    setRemarks(initial?.remarks ?? "");
    setActive(initial?.active ?? true);
  }, [open, initial]);

  const canSave = name.trim() && lt > 0;

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white text-slate-900 shadow-xl dark:bg-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <div className="text-lg font-bold">{initial?.id ? "Edit Supplier" : "New Supplier"}</div>
          <button className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">Name *</label>
              <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น SteelCo" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Lead Time (days) *</label>
              <input type="number" min={1} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={lt} onChange={(e) => setLt(Number(e.target.value) || 0)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">MOQ</label>
              <input type="number" min={0} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={moq} onChange={(e) => setMoq(Number(e.target.value) || 0)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Rating (1..5)</label>
              <input type="number" min={1} max={5} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={rating} onChange={(e) => setRating(Number(e.target.value) || 0)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Contact</label>
              <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={contact} onChange={(e) => setContact(e.target.value)} placeholder="ชื่อผู้ติดต่อ" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Phone</label>
              <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08x-xxx-xxxx" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Email</label>
              <input type="email" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@supplier.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Terms</label>
              <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="NET30 / COD / ..." />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold">Remarks</label>
              <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="โน้ตอื่น ๆ" />
            </div>
            <div className="flex items-center gap-2">
              <input id="sup-active" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <label htmlFor="sup-active" className="text-sm">Active</label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-800">
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold ${canSave ? "bg-indigo-600 text-white hover:bg-indigo-700" : "cursor-not-allowed bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-400"}`}
            onClick={() => {
              if (!canSave) return alert("กรอก Name และ Lead Time ให้ครบ");
              onSave({
                id: initial?.id,
                name: name.trim(),
                lead_time_days: lt,
                moq,
                contact_name: contact.trim() || undefined,
                phone: phone.trim() || undefined,
                email: email.trim() || undefined,
                rating,
                terms: terms.trim() || undefined,
                remarks: remarks.trim() || undefined,
                active,
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

/* ================== Warehouse Modal ================== */
function WarehouseModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: Omit<Warehouse, "id"> & { id?: number }) => void;
  initial?: Partial<Warehouse>;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [policy, setPolicy] = useState<Warehouse["policy"]>("FIFO");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    setCode(initial?.code ?? "");
    setName(initial?.name ?? "");
    setPolicy(initial?.policy ?? "FIFO");
    setLocation(initial?.location ?? "");
    setCapacity(initial?.capacity ?? "");
    setRemarks(initial?.remarks ?? "");
    setActive(initial?.active ?? true);
  }, [open, initial]);

  const canSave = code.trim() && name.trim();

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white text-slate-900 shadow-xl dark:bg-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <div className="text-lg font-bold">{initial?.id ? "Edit Warehouse" : "New Warehouse"}</div>
          <button className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">Code *</label>
              <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={code} onChange={(e) => setCode(e.target.value)} placeholder="เช่น RM-A" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Name *</label>
              <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={name} onChange={(e) => setName(e.target.value)} placeholder="Raw A" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Policy</label>
              <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={policy ?? "None"} onChange={(e) => setPolicy(e.target.value as Warehouse["policy"])}>
                {["FIFO", "LIFO", "FEFO", "None"].map((p) => (
                  <option key={p} value={p as any}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Location</label>
              <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Site A / Address" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Capacity</label>
              <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="เช่น 50 pallets / 2000 m²" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold">Remarks</label>
              <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="โน้ตอื่น ๆ" />
            </div>
            <div className="flex items-center gap-2">
              <input id="wh-active" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <label htmlFor="wh-active" className="text-sm">Active</label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-800">
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold ${canSave ? "bg-indigo-600 text-white hover:bg-indigo-700" : "cursor-not-allowed bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-400"}`}
            onClick={() => {
              if (!canSave) return alert("กรอก Code และ Name ให้ครบ");
              onSave({
                id: initial?.id,
                code: code.trim(),
                name: name.trim(),
                policy: policy ?? "None",
                location: location.trim() || undefined,
                capacity: capacity.trim() || undefined,
                remarks: remarks.trim() || undefined,
                active,
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

/* ================== Page ================== */
export default function SupplyPage() {
  /* Mock Data */
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: 1, name: "SteelCo", lead_time_days: 2, moq: 100, rating: 4, terms: "NET30", remarks: "Fast lane", active: true, phone: "080-000-0000", email: "po@steelco.com", contact_name: "Ann" },
    { id: 2, name: "ColorChem", lead_time_days: 5, rating: 5, terms: "NET45", active: true },
  ]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    { id: 1, code: "RM-A", name: "Raw A", policy: "FIFO", location: "Plant A", capacity: "60 pallets", active: true },
    { id: 2, code: "FG-1", name: "FG Main", policy: "FEFO", location: "Plant A", capacity: "120 pallets", active: true },
  ]);

  /* Suppliers UI */
  const [supQ, setSupQ] = useState("");
  const [supPage, setSupPage] = useState(1);
  const [supPageSize, setSupPageSize] = useState(10);
  const supFiltered = useMemo(() => {
    const q = supQ.trim().toLowerCase();
    return suppliers.filter((s) => {
      const txt = [
        s.name,
        String(s.lead_time_days),
        String(s.moq ?? ""),
        s.terms ?? "",
        s.contact_name ?? "",
        s.phone ?? "",
        s.email ?? "",
        s.remarks ?? "",
      ].join(" ").toLowerCase();
      return !q || txt.includes(q);
    });
  }, [suppliers, supQ]);
  useEffect(() => setSupPage(1), [supQ]);
  const supPaged = useMemo(
    () => supFiltered.slice((supPage - 1) * supPageSize, supPage * supPageSize),
    [supFiltered, supPage, supPageSize]
  );

  /* Warehouses UI */
  const [whQ, setWhQ] = useState("");
  const [whPage, setWhPage] = useState(1);
  const [whPageSize, setWhPageSize] = useState(10);
  const whFiltered = useMemo(() => {
    const q = whQ.trim().toLowerCase();
    return warehouses.filter((w) => {
      const txt = [
        w.code,
        w.name,
        w.policy ?? "",
        w.location ?? "",
        w.capacity ?? "",
        w.remarks ?? "",
      ].join(" ").toLowerCase();
      return !q || txt.includes(q);
    });
  }, [warehouses, whQ]);
  useEffect(() => setWhPage(1), [whQ]);
  const whPaged = useMemo(
    () => whFiltered.slice((whPage - 1) * whPageSize, whPage * whPageSize),
    [whFiltered, whPage, whPageSize]
  );

  /* Modal States & Handlers */
  const [supModalOpen, setSupModalOpen] = useState(false);
  const [supEditId, setSupEditId] = useState<number | null>(null);

  const [whModalOpen, setWhModalOpen] = useState(false);
  const [whEditId, setWhEditId] = useState<number | null>(null);

  const openNewSupplier = () => { setSupEditId(null); setSupModalOpen(true); };
  const openEditSupplier = (id: number) => { setSupEditId(id); setSupModalOpen(true); };
  const saveSupplier = (payload: Omit<Supplier, "id"> & { id?: number }) => {
    if (payload.id) {
      setSuppliers((prev) => prev.map((s) => (s.id === payload.id ? { ...s, ...payload, id: payload.id! } : s)));
    } else {
      setSuppliers((prev) => [...prev, { ...payload, id: nextId(prev) }]);
    }
    setSupModalOpen(false); setSupEditId(null);
  };
  const delSupplier = (id: number) => {
    if (!confirm("ลบ Supplier นี้?")) return;
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const openNewWarehouse = () => { setWhEditId(null); setWhModalOpen(true); };
  const openEditWarehouse = (id: number) => { setWhEditId(id); setWhModalOpen(true); };
  const saveWarehouse = (payload: Omit<Warehouse, "id"> & { id?: number }) => {
    if (payload.id) {
      setWarehouses((prev) => prev.map((w) => (w.id === payload.id ? { ...w, ...payload, id: payload.id! } : w)));
    } else {
      setWarehouses((prev) => [...prev, { ...payload, id: nextId(prev) }]);
    }
    setWhModalOpen(false); setWhEditId(null);
  };
  const delWarehouse = (id: number) => {
    if (!confirm("ลบ Warehouse นี้?")) return;
    setWarehouses((prev) => prev.filter((w) => w.id !== id));
  };

  /* Columns */
  const supplierCols = [
    {
      key: "action",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      render: (s: Supplier) => (
        <div className="flex justify-end gap-2">
          <EditButton onClick={() => openEditSupplier(s.id)}/>
          <DeleteButton onClick={() => delSupplier(s.id)}/>   
        </div>
      ),
    },
    { key: "name", header: "Supplier", render: (s: Supplier) => <b>{s.name}</b> },
    { key: "lead_time_days", header: "LT (days)" },
    { key: "moq", header: "MOQ", render: (s: Supplier) => s.moq ?? "-" },
    { key: "rating", header: "Rating", render: (s: Supplier) => s.rating ?? "-" },
    { key: "terms", header: "Terms", render: (s: Supplier) => s.terms ?? "-" },
    { key: "contact_name", header: "Contact", render: (s: Supplier) => s.contact_name ?? "-" },
    { key: "phone", header: "Phone", render: (s: Supplier) => s.phone ?? "-" },
    { key: "email", header: "Email", render: (s: Supplier) => s.email ?? "-" },
    { key: "remarks", header: "Remarks", render: (s: Supplier) => s.remarks ?? "-" },
  ] as const;

  const warehouseCols = [
    {
      key: "action",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      render: (w: Warehouse) => (
        <div className="flex justify-end gap-2">
          <EditButton onClick={() => openEditWarehouse(w.id)}/>
          <DeleteButton onClick={() => delWarehouse(w.id)}/>  
        </div>
      ),
    },
    { key: "code", header: "Loc Code", render: (w: Warehouse) => <b>{w.code}</b> },
    { key: "name", header: "Name" },
    { key: "policy", header: "Policy", render: (w: Warehouse) => w.policy ?? "-" },
    { key: "location", header: "Location", render: (w: Warehouse) => w.location ?? "-" },
    { key: "capacity", header: "Capacity", render: (w: Warehouse) => w.capacity ?? "-" },
    { key: "remarks", header: "Remarks", render: (w: Warehouse) => w.remarks ?? "-" },
  ] as const;

  return (
    <>
      <PageHeader
        title="Supply"
        actions={
          <>
            <ImportButton onFilesSelected={(files) => console.log("supply import:", files[0]?.name)} />
            <ExportButton filename="supply.json" data={{ suppliers, warehouses }} />
          </>
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-10">
        {/* Suppliers */}
        <section className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm bg-white dark:bg-slate-900">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SearchInput value={supQ} onChange={setSupQ} placeholder="ค้นหา supplier / contact / phone / email / terms" />
            <div className="ml-auto">
              <AddButton label="New Supplier" onClick={openNewSupplier}/>                          
            </div>
          </div>

          <CommonTable<Supplier>
            columns={supplierCols as any}
            data={supPaged}
            pagination={{
              total: supFiltered.length,
              page: supPage,
              pageSize: supPageSize,
              onPageChange: setSupPage,
              onPageSizeChange: setSupPageSize,
              pageSizes: [10, 20, 50],
            }}
          />
        </section>

        {/* Warehouses */}
        <section className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm bg-white dark:bg-slate-900">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SearchInput value={whQ} onChange={setWhQ} placeholder="ค้นหา code / name / policy / location" />
            <div className="ml-auto">
              <AddButton label="New Warehouse" onClick={openNewWarehouse}/>                          
            </div>
          </div>

          <CommonTable<Warehouse>
            columns={warehouseCols as any}
            data={whPaged}
            pagination={{
              total: whFiltered.length,
              page: whPage,
              pageSize: whPageSize,
              onPageChange: setWhPage,
              onPageSizeChange: setWhPageSize,
              pageSizes: [10, 20, 50],
            }}
          />
        </section>
      </div>

      {/* Modals */}
      <SupplierModal
        open={supModalOpen}
        onClose={() => { setSupModalOpen(false); setSupEditId(null); }}
        onSave={saveSupplier}
        initial={suppliers.find((s) => s.id === supEditId) || undefined}
      />
      <WarehouseModal
        open={whModalOpen}
        onClose={() => { setWhModalOpen(false); setWhEditId(null); }}
        onSave={saveWarehouse}
        initial={warehouses.find((w) => w.id === whEditId) || undefined}
      />
    </>
  );
}
