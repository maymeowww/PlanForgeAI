"use client";

import React, { useMemo, useRef, useState } from "react";

// =============================
// Types
// =============================
export interface OrderRow {
  id: string;
  product: string;
  qty: number; // demand quantity of finished good
  due: string; // YYYY-MM-DD
}

export interface BomLine {
  product: string;
  material: string;
  qtyPer: number; // per 1 unit of product
  scrap: number; // 0..1
  unit: string;
}

export interface InventoryItem {
  material: string;
  onHand: number;
  reserved: number;
  safety: number;
  lead: number; // days
  moq: number; // min order qty
  lot: number; // lot multiple size
  vendor: string;
  incoming: number; // open POs not yet received
  eta: string; // YYYY-MM-DD
}

export interface MrpRow {
  material: string;
  gross: number;
  onhand: number;
  incoming: number;
  safety: number;
  net: number;
  earliestDue: string; // YYYY-MM-DD or ''
}

export interface PurchaseRow {
  material: string;
  vendor: string;
  qty: number;
  due: string; // need by
  release: string; // suggested release
  lead: number;
  notes?: string;
}

// =============================
// Helpers
// =============================
const cls = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");
const fmt = (n: number) => Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
const parseDate = (s?: string) => (s ? new Date(s) : undefined);
const formatDate = (d?: Date) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "");
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

function toCSV<T extends Record<string, any>>(rows: T[]): string {
  if (!rows?.length) return "";
  const keys = Object.keys(rows[0]);
  const header = keys.join(",");
  const body = rows
    .map((r) =>
      keys
        .map((k) => String(r[k] ?? "").replaceAll('"', '""'))
        .map((v) => (/[,"\n]/.test(v) ? `"${v}"` : v))
        .join(",")
    )
    .join("\n");
  return header + "\n" + body;
}

function downloadCSV(name: string, text: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = (lines.shift() || "").split(",").map((h) => h.trim());
  return lines.map((line) => {
    // simple split (does not handle quotes with commas deeply)
    const cols = line.split(",");
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = (cols[i] ?? "").replace(/^\"|\"$/g, "")));
    return obj;
  });
}

// =============================
// Sample seed data
// =============================
const ORDERS_SEED: OrderRow[] = [
  { id: "WO-2025-001", product: "Product A", qty: 1200, due: "2025-09-05" },
  { id: "WO-2025-002", product: "Product B", qty: 800, due: "2025-09-07" },
  { id: "WO-2025-003", product: "Product H", qty: 200, due: "2025-09-02" },
];

const BOM_SEED: BomLine[] = [
  { product: "Product A", material: "RM-ABS-01", qtyPer: 2.5, scrap: 0.02, unit: "kg" },
  { product: "Product A", material: "RM-PLA-02", qtyPer: 1.2, scrap: 0, unit: "kg" },
  { product: "Product B", material: "RM-PLA-02", qtyPer: 2.0, scrap: 0.01, unit: "kg" },
  { product: "Product H", material: "RM-NYL-09", qtyPer: 3.0, scrap: 0.03, unit: "kg" },
];

const INVENTORY_SEED: InventoryItem[] = [
  { material: "RM-ABS-01", onHand: 1240, reserved: 0, safety: 200, lead: 7, moq: 300, lot: 100, vendor: "ABS Co", incoming: 0, eta: "" },
  { material: "RM-PLA-02", onHand: 4200, reserved: 0, safety: 500, lead: 5, moq: 200, lot: 50, vendor: "PLA Ltd", incoming: 300, eta: "2025-09-03" },
  { material: "RM-NYL-09", onHand: 2300, reserved: 0, safety: 300, lead: 10, moq: 100, lot: 100, vendor: "NYL & Co", incoming: 0, eta: "" },
];

// =============================
// UI Bits
// =============================
function ToolbarButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm border border-slate-300 dark:border-slate-700">
      {children}
    </button>
  );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700">
      {children}
    </button>
  );
}

function Pill({ tone, children }: { tone: "ok" | "short" | "late"; children: React.ReactNode }) {
  const map = {
    ok: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    short: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    late: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  } as const;
  return <span className={cls("px-2 py-0.5 rounded-full text-xs", map[tone])}>{children}</span>;
}

// =============================
// Main Component
// =============================
export default function MaterialPlanningMRP() {
  const [tab, setTab] = useState<"engine" | "availability" | "purchase" | "bom">("engine");
  const [orders, setOrders] = useState<OrderRow[]>(ORDERS_SEED);
  const [bom, setBom] = useState<BomLine[]>(BOM_SEED);
  const [inventory, setInventory] = useState<InventoryItem[]>(INVENTORY_SEED);

  // ===== MRP engine =====
  const mrpRows: MrpRow[] = useMemo(() => {
    // 1) explode demand by BOM
    const gross: Record<string, number> = {};
    const earliest: Record<string, Date> = {} as any;
    orders.forEach((o) => {
      const due = parseDate(o.due)!;
      bom.filter((b) => b.product === o.product).forEach((b) => {
        const req = o.qty * (b.qtyPer * (1 + (b.scrap || 0)));
        gross[b.material] = (gross[b.material] || 0) + req;
        if (!earliest[b.material] || (due && due < earliest[b.material])) earliest[b.material] = due;
      });
    });

    // 2) netting with inventory
    const rows = Object.keys(gross).sort().map<MrpRow>((mat) => {
      const inv = inventory.find((x) => x.material === mat) || ({} as InventoryItem);
      const onhandAvail = (inv.onHand || 0) - (inv.reserved || 0);
      const available = onhandAvail + (inv.incoming || 0);
      const net = Math.max(0, gross[mat] + (inv.safety || 0) - available);
      return {
        material: mat,
        gross: Math.ceil(gross[mat] * 100) / 100,
        onhand: onhandAvail,
        incoming: inv.incoming || 0,
        safety: inv.safety || 0,
        net: Math.ceil(net * 100) / 100,
        earliestDue: formatDate(earliest[mat]),
      };
    });
    return rows;
  }, [orders, bom, inventory]);

  // ===== Availability view =====
  const [availFilter, setAvailFilter] = useState<"all" | "short" | "ok">("all");
  const availabilityRows = useMemo(() => {
    return mrpRows.filter((r) => {
      const available = r.onhand + r.incoming - r.safety;
      const net = r.gross - available; // positive => shortage
      const short = net > 0;
      if (availFilter === "short") return short;
      if (availFilter === "ok") return !short;
      return true;
    });
  }, [mrpRows, availFilter]);

  // ===== Purchase suggestions =====
  const purchaseRows: PurchaseRow[] = useMemo(() => {
    const today = new Date();
    return mrpRows
      .map((r) => {
        if (r.net <= 0) return null;
        const inv = inventory.find((x) => x.material === r.material);
        if (!inv) return null;
        let qty = Math.max(r.net, inv.moq || 0);
        if (inv.lot && inv.lot > 0) qty = Math.ceil(qty / inv.lot) * inv.lot;
        const due = r.earliestDue ? parseDate(r.earliestDue) : undefined;
        const release = due ? addDays(due, -(inv.lead || 0)) : undefined;
        const late = !!(release && release < today);
        return {
          material: r.material,
          vendor: inv.vendor || "-",
          qty: Math.ceil(qty * 100) / 100,
          due: r.earliestDue || "",
          release: formatDate(release),
          lead: inv.lead || 0,
          notes: late ? "LATE — release earlier" : "",
        } as PurchaseRow;
      })
      .filter(Boolean) as PurchaseRow[];
  }, [mrpRows, inventory]);

  // ===== File inputs (import CSV) =====
  const ordersFile = useRef<HTMLInputElement>(null);
  const bomFile = useRef<HTMLInputElement>(null);
  const invFile = useRef<HTMLInputElement>(null);
  const bomFile2 = useRef<HTMLInputElement>(null);

  const handleRead = (file: File | null, cb: (rows: Record<string, string>[]) => void) => {
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => cb(parseCSV(String(fr.result || "")));
    fr.readAsText(file);
  };

  // =============================
  // Render
  // =============================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 dark:bg-slate-900/70 border-b border-slate-200/70 dark:border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold">AI</div>
            <h1 className="text-lg sm:text-xl font-semibold">Material Planning (MRP)</h1>
          </div>
          <div className="ml-auto" />
        </div>
      </header>

      {/* Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <section className="rounded-2xl bg-white dark:bg-slate-800 shadow">
          <div className="border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 lg:px-8">
            <nav className="-mb-px flex gap-6" aria-label="Tabs">
              {([
                ["engine", "Material Requirement Calculation"] as const,
                ["availability", "Inventory Availability Check"] as const,
                ["purchase", "Purchase Suggestion"] as const,
                ["bom", "BOM Management"] as const,
              ]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key as any)}
                  className={cls(
                    "py-3 border-b-2 border-transparent text-sm font-medium",
                    tab === key ? "text-blue-600 border-blue-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 space-y-10">
            {/* ENGINE */}
            {tab === "engine" && (
              <div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <input ref={ordersFile} type="file" accept=".csv" hidden onChange={(e) => handleRead(e.target.files?.[0] || null, (rows) => {
                      const mapped: OrderRow[] = rows.map((r) => ({ id: r.id, product: r.product, qty: Number(r.qty || 0), due: r.due }));
                      setOrders(mapped);
                    })} />
                    <ToolbarButton onClick={() => ordersFile.current?.click()}>Import Orders CSV</ToolbarButton>

                    <input ref={bomFile} type="file" accept=".csv" hidden onChange={(e) => handleRead(e.target.files?.[0] || null, (rows) => {
                      const mapped: BomLine[] = rows.map((r) => ({ product: r.product, material: r.material, qtyPer: Number(r.qtyPer || 0), scrap: Number(r.scrap || 0), unit: r.unit || "" }));
                      setBom(mapped);
                    })} />
                    <ToolbarButton onClick={() => bomFile.current?.click()}>Import BOM CSV</ToolbarButton>

                    <input ref={invFile} type="file" accept=".csv" hidden onChange={(e) => handleRead(e.target.files?.[0] || null, (rows) => {
                      const mapped: InventoryItem[] = rows.map((r) => ({ material: r.material, onHand: Number(r.onHand || 0), reserved: Number(r.reserved || 0), safety: Number(r.safety || 0), lead: Number(r.lead || 0), moq: Number(r.moq || 0), lot: Number(r.lot || 0), vendor: r.vendor || "-", incoming: Number(r.incoming || 0), eta: r.eta || "" }));
                      setInventory(mapped);
                    })} />
                    <ToolbarButton onClick={() => invFile.current?.click()}>Import Inventory CSV</ToolbarButton>
                  </div>
                  <div className="flex items-center gap-2">
                    <ToolbarButton onClick={() => downloadCSV("mrp_result.csv", toCSV(mrpRows))}>Export Result CSV</ToolbarButton>
                    <PrimaryButton onClick={() => {/* computed via useMemo already */}}>Run MRP</PrimaryButton>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="min-w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/40 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-2">Material</th>
                        <th className="px-4 py-2">Gross Req.</th>
                        <th className="px-4 py-2">On Hand</th>
                        <th className="px-4 py-2">Incoming</th>
                        <th className="px-4 py-2">Safety</th>
                        <th className="px-4 py-2">Net Req.</th>
                        <th className="px-4 py-2">Earliest Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                      {mrpRows.map((r) => (
                        <tr key={r.material}>
                          <td className="px-4 py-2 font-medium">{r.material}</td>
                          <td className="px-4 py-2">{fmt(r.gross)}</td>
                          <td className="px-4 py-2">{fmt(r.onhand)}</td>
                          <td className="px-4 py-2">{fmt(r.incoming)}</td>
                          <td className="px-4 py-2">{fmt(r.safety)}</td>
                          <td className={cls("px-4 py-2", r.net > 0 && "text-rose-500 font-semibold")}>{fmt(r.net)}</td>
                          <td className="px-4 py-2">{r.earliestDue || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* AVAILABILITY */}
            {tab === "availability" && (
              <div>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-sm text-slate-500">Projected availability vs demand</div>
                  <div className="flex items-center gap-2">
                    <select value={availFilter} onChange={(e) => setAvailFilter(e.target.value as any)} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
                      <option value="all">ทั้งหมด</option>
                      <option value="short">Shortage</option>
                      <option value="ok">OK</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="min-w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/40 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-2">Material</th>
                        <th className="px-4 py-2">Available</th>
                        <th className="px-4 py-2">Demand</th>
                        <th className="px-4 py-2">Net</th>
                        <th className="px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                      {availabilityRows.map((r) => {
                        const available = r.onhand + r.incoming - r.safety;
                        const net = r.gross - available;
                        const short = net > 0;
                        return (
                          <tr key={r.material}>
                            <td className="px-4 py-2 font-medium">{r.material}</td>
                            <td className="px-4 py-2">{fmt(available)}</td>
                            <td className="px-4 py-2">{fmt(r.gross)}</td>
                            <td className={cls("px-4 py-2", short && "text-rose-500 font-semibold")}>{fmt(net)}</td>
                            <td className="px-4 py-2">{short ? <Pill tone="short">Shortage</Pill> : <Pill tone="ok">OK</Pill>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PURCHASE SUGGESTION */}
            {tab === "purchase" && (
              <div>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-sm text-slate-500">Suggested POs (MOQ/Lot size/Lead time applied)</div>
                  <div className="flex items-center gap-2">
                    <ToolbarButton onClick={() => downloadCSV("purchase_suggestions.csv", toCSV(purchaseRows))}>Export PO CSV</ToolbarButton>
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="min-w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/40 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-2">Material</th>
                        <th className="px-4 py-2">Vendor</th>
                        <th className="px-4 py-2">Suggest Qty</th>
                        <th className="px-4 py-2">Due Date</th>
                        <th className="px-4 py-2">Release Date</th>
                        <th className="px-4 py-2">Lead (d)</th>
                        <th className="px-4 py-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                      {purchaseRows.map((r) => (
                        <tr key={r.material}>
                          <td className="px-4 py-2 font-medium">{r.material}</td>
                          <td className="px-4 py-2">{r.vendor}</td>
                          <td className="px-4 py-2">{fmt(r.qty)}</td>
                          <td className="px-4 py-2">{r.due || "-"}</td>
                          <td className={cls("px-4 py-2", r.notes && "text-amber-600 font-semibold")}>{r.release || "-"}</td>
                          <td className="px-4 py-2">{r.lead}</td>
                          <td className="px-4 py-2">{r.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BOM MANAGEMENT */}
            {tab === "bom" && <BOMManager bom={bom} setBom={setBom} onExport={() => downloadCSV("bom.csv", toCSV(bom))} onImportRequestRef={bomFile2} />}
          </div>
        </section>
      </main>
    </div>
  );
}

// =============================
// BOM Manager (with modal)
// =============================
function BOMManager({
  bom,
  setBom,
  onExport,
  onImportRequestRef,
}: {
  bom: BomLine[];
  setBom: React.Dispatch<React.SetStateAction<BomLine[]>>;
  onExport: () => void;
  onImportRequestRef: React.RefObject<HTMLInputElement>;
}) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<BomLine>({ product: "", material: "", qtyPer: 0, scrap: 0, unit: "" });

  const filtered = useMemo(() => bom.filter((x) => JSON.stringify(x).toLowerCase().includes(q.toLowerCase())), [bom, q]);

  const resetForm = () => setForm({ product: "", material: "", qtyPer: 0, scrap: 0, unit: "" });

  const startNew = () => { resetForm(); setEditing(null); };
  const startEdit = (idx: number) => { setEditing(idx); setForm(bom[idx]); };
  const remove = (idx: number) => setBom((prev) => prev.filter((_, i) => i !== idx));
  const save = () => {
    if (editing === null) setBom((prev) => [...prev, form]);
    else setBom((prev) => prev.map((x, i) => (i === editing ? form : x)));
    setEditing(null); resetForm();
  };

  const importRef = onImportRequestRef;
  const onImport = (rows: Record<string, string>[]) => {
    const mapped: BomLine[] = rows.map((r) => ({ product: r.product, material: r.material, qtyPer: Number(r.qtyPer || 0), scrap: Number(r.scrap || 0), unit: r.unit || "" }));
    setBom(mapped);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search product/material" className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm w-full" />
        </div>
        <div className="flex items-center gap-2">
          <input ref={importRef} type="file" accept=".csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const fr = new FileReader(); fr.onload = () => onImport(parseCSV(String(fr.result || ""))); fr.readAsText(f); }} />
          <ToolbarButton onClick={() => importRef.current?.click()}>Import CSV</ToolbarButton>
          <ToolbarButton onClick={onExport}>Export CSV</ToolbarButton>
          <PrimaryButton onClick={startNew}>Add BOM Line</PrimaryButton>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/40 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Material</th>
              <th className="px-4 py-2">Qty / Unit</th>
              <th className="px-4 py-2">Scrap %</th>
              <th className="px-4 py-2">Unit</th>
              <th className="px-4 py-2 w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
            {filtered.map((b, idx) => (
              <tr key={`${b.product}-${b.material}-${idx}`}>
                <td className="px-4 py-2 font-medium">{b.product}</td>
                <td className="px-4 py-2">{b.material}</td>
                <td className="px-4 py-2">{fmt(b.qtyPer)}</td>
                <td className="px-4 py-2">{(b.scrap || 0) * 100}</td>
                <td className="px-4 py-2">{b.unit}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <ToolbarButton onClick={() => startEdit(idx)}>Edit</ToolbarButton>
                    <ToolbarButton onClick={() => remove(idx)}>Delete</ToolbarButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal (inline) */}
      {(editing !== null || form.material || form.product) && (
        <div className="mt-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editing === null ? "Add BOM Line" : "Edit BOM Line"}</h3>
            <ToolbarButton onClick={() => { setEditing(null); resetForm(); }}>Close</ToolbarButton>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500">Product</label>
              <input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Material</label>
              <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Qty / Unit</label>
              <input type="number" step="0.01" value={form.qtyPer} onChange={(e) => setForm({ ...form, qtyPer: Number(e.target.value) })} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Scrap %</label>
              <input type="number" step="0.01" value={(form.scrap || 0) * 100} onChange={(e) => setForm({ ...form, scrap: Number(e.target.value) / 100 })} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm w-full" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-500">Unit</label>
              <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm w-full" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <ToolbarButton onClick={() => { setEditing(null); resetForm(); }}>Cancel</ToolbarButton>
            <PrimaryButton onClick={save}>Save</PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
