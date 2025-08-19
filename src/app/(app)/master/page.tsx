"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ImportButton from "@/src/components/shared/button/ImportButton";
import {
  Plus,
  Download,
  FileDown,
  Upload,
  Edit3,
  Trash2,
  X,
} from "lucide-react";
import ExportButton from "@/src/components/shared/button/ExportButton";
import IconButton from "@/src/components/shared/button/IconButton";

/** ========= Types ========= */
type Order = {
  order_id: number | null;
  order_number: string;
  customer_id: string;
  due_date: string | null;
  remarks: string;
  status: "pending" | "released" | "completed" | "cancelled";
};

type Product = {
  id: number | null;
  product_number: string;
  name: string;
  category: string;
  description: string;
  unit_code: string;
  std_rate_min: number;
  image_url: string;
};

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

/** ========= Helpers ========= */
const nextNumericId = <T, K extends keyof T>(arr: T[], key: K): number => {
  const max = arr.reduce((m, x: any) => Math.max(m, Number(x?.[key] || 0)), 0);
  return (max || 0) + 1;
};

const css = `
:root{
  --bg:#f7f9fb;
  --panel:#ffffff;
  --text:#0f172a;
  --muted:#64748b;
  --accent:#0ea5e9;
  --accent-ink:#0b4d6b;
  --line:#e5e7eb;
  --r:16px;
  --sh:0 10px 30px -15px rgba(2,6,23,.15);
}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--text);font:14px/1.55 Inter,ui-sans-serif,system-ui,"Segoe UI",Roboto}
a{color:inherit}
.wrap{max-width:1280px;margin:0 auto;padding:20px}
h1{margin:0 0 4px;font-weight:900}
.sub{color:var(--muted);font-size:13px}
.row{display:flex;gap:10px;align-items:center}
.right{margin-left:auto}

/* ======= Header (light, no border, shadow on scroll) ======= */
.topbar{
  position:sticky;top:0;z-index:40;
  // background:rgba(255,255,255,.92);
  -webkit-backdrop-filter:saturate(180%) blur(8px);
  backdrop-filter:saturate(180%) blur(8px);
  transition:box-shadow .2s ease;
}
.topbar.shadow{box-shadow:var(--sh)}
.topbar-inner{max-width:1280px;margin:0 auto;padding:12px 20px;display:flex;gap:12px;align-items:center}

/* ======= Controls ======= */

.iconbtn{
  width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;
  border:1px solid var(--line);border-radius:10px;background:#fff;box-shadow:0 1px 0 rgba(0,0,0,.03);
}
.iconbtn:hover{background:#f8fafc}
.iconbtn.ok{background:#10b981;border-color:#059669;color:#fff}
.iconbtn.warn{background:#ef4444;border-color:#dc2626;color:#fff}

/* ======= Tabs (Segment) ======= */
.segment{
  display:inline-flex;background:#f1f5f9;border:1px solid var(--line);border-radius:999px;overflow:hidden;
}
.segment button{
  padding:8px 14px;border:none;background:transparent;color:#334155;cursor:pointer;font-weight:600;
}
.segment button.active{background:#0ea5e9;color:#fff}

/* ======= Cards/Tables ======= */
.card{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--sh);padding:16px}
.tbl{width:100%;border-collapse:separate;border-spacing:0 8px}
.tbl th{font-size:12px;color:var(--muted);text-align:left;font-weight:700}
.tbl td{background:#fff;border:1px solid var(--line);padding:10px;vertical-align:top}
.tbl tr td:first-child{border-radius:12px 0 0 12px}
.tbl tr td:last-child{border-radius:0 12px 12px 0}
.tbl tbody tr:hover td{background:#f9fafb}

/* ======= Chips / Pills ======= */
.pill{display:inline-flex;gap:6px;align-items:center;background:#eef2f7;border:1px solid var(--line);padding:4px 8px;border-radius:999px;margin:3px 6px 3px 0;font-size:12px}
.pill .x{background:none;border:none;color:#64748b;cursor:pointer}
.pill .x:hover{color:#0f172a}

/* ======= Inputs ======= */
input,select,textarea{
  background:#fff;border:1px solid var(--line);color:var(--text);border-radius:10px;padding:10px;font:inherit
}
input[type="search"]{min-width:260px}

/* ======= Toolbar inside card ======= */
.toolbar{position:sticky;top:-16px;z-index:10;background:rgba(255,255,255,.95);backdrop-filter:blur(6px);
  margin:-16px -16px 12px -16px; padding:12px 16px; border-bottom:1px solid var(--line); border-radius:16px 16px 0 0;
}

/* ======= Modal ======= */
.modal{position:fixed;inset:0;background:rgba(2,6,23,.3);display:flex;align-items:center;justify-content:center;padding:16px}
.modal.hidden{display:none}
.modal .box{background:#fff;border:1px solid var(--line);border-radius:14px;min-width:380px;max-width:720px;width:100%;box-shadow:var(--sh)}
.modal .head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--line)}
.modal .body{padding:16px}
.modal .foot{display:flex;gap:8px;justify-content:flex-end;padding:14px 16px;border-top:1px solid var(--line)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media (max-width:900px){.grid2{grid-template-columns:1fr}}
`;

/** ========= CSV helpers ========= */
function csvToArray(text: string): any[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((s) => s.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const o: Record<string, any> = {};
    headers.forEach((h, i) => {
      let v = (cols[i] || "").trim();
      if (v.includes("|")) v = v.split("|");
      o[h] = v;
    });
    if ("order_id" in o) o.order_id = Number(o.order_id || 0) || null;
    if ("id" in o) o.id = Number(o.id || 0) || null;
    if ("std_rate_min" in o) o.std_rate_min = Number(o.std_rate_min || 0) || 0;
    return o;
  });
}

function downloadBlob(filename: string, blob: Blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** ========= Component ========= */
const MasterDataPage: React.FC = () => {
  type Tab = "orders" | "products" | "machines";
  const [tab, setTab] = useState<Tab>("orders");

  // shadow header on scroll
  const [hasShadow, setHasShadow] = useState(false);
  useEffect(() => {
    const onScroll = () => setHasShadow(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** mock data (state) */
  const [orders, setOrders] = useState<Order[]>([
    { order_id: 1, order_number: "ORD-1001", customer_id: "CUST-001", due_date: "2025-08-20", remarks: "Rush order, must ship on time", status: "pending" },
    { order_id: 2, order_number: "ORD-1002", customer_id: "CUST-002", due_date: "2025-08-25", remarks: "", status: "pending" },
  ]);
  const [products, setProducts] = useState<Product[]>([
    { id: 1, product_number: "ELEC-001", name: "Product A", category: "Electronics", description: "High-quality electronic component", unit_code: "pcs", std_rate_min: 5, image_url: "/static/images/products/product_a.png" },
    { id: 2, product_number: "AUTO-002", name: "Product B", category: "Automotive", description: "Spare part for automotive industry", unit_code: "pcs", std_rate_min: 8, image_url: "/static/images/products/product_b.png" },
  ]);
  const [machines, setMachines] = useState<Machine[]>([
    { machine_id: "MCH-001", machine_code: "CNCL-3000-01", name: "CNC Lathe 3000", type: "CNC Lathe", capabilities: ["turning", "cutting", "drilling"], status: "active", location_id: "LOC-001", description: "High precision CNC lathe for metal parts", installation_date: "2022-11-15", purchase_date: "2022-10-01", last_maintenance_date: "2025-07-01", std_rate_min: 0.3, capacity_unit: "pcs/hour", notes: "Requires calibration every 6 months", created_at: "2024-01-15T08:00:00Z", updated_at: "2025-01-10T12:00:00Z" },
  ]);

  /** ====== Orders UI state ====== */
  const [orderQ, setOrderQ] = useState("");
  const [orderStatus, setOrderStatus] = useState<"" | Order["status"]>("");
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [editOrderId, setEditOrderId] = useState<number | null>(null);

  /** ====== Products UI state ====== */
  const [prodQ, setProdQ] = useState("");
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [editProdId, setEditProdId] = useState<number | null>(null);

  /** ====== Machines UI state ====== */
  const [macQ, setMacQ] = useState("");
  const [macModalOpen, setMacModalOpen] = useState(false);
  const [editMacId, setEditMacId] = useState<string | null>(null);
  const [capList, setCapList] = useState<string[]>([]);

  /** ====== Import file input ====== */
  const fileRef = useRef<HTMLInputElement>(null);

  /** ====== Filtered views ====== */
  const filteredOrders = useMemo(() => {
    const q = orderQ.trim().toLowerCase();
    return orders.filter((o) => {
      const text = [o.order_number, o.customer_id, o.status, o.remarks].join(" ").toLowerCase();
      const okQ = !q || text.includes(q);
      const okS = !orderStatus || o.status === orderStatus;
      return okQ && okS;
    });
  }, [orders, orderQ, orderStatus]);

  const filteredProducts = useMemo(() => {
    const q = prodQ.trim().toLowerCase();
    return products.filter((p) => {
      const text = [p.product_number, p.name, p.category, p.description].join(" ").toLowerCase();
      return !q || text.includes(q);
    });
  }, [products, prodQ]);

  const filteredMachines = useMemo(() => {
    const q = macQ.trim().toLowerCase();
    return machines.filter((m) => {
      const text = [m.machine_code, m.name, m.type, m.status, m.location_id, (m.capabilities || []).join(" ")].join(" ").toLowerCase();
      return !q || text.includes(q);
    });
  }, [machines, macQ]);

  /** ====== Orders modal data binding ====== */
  const [moNumber, setMoNumber] = useState("");
  const [moCust, setMoCust] = useState("");
  const [moDue, setMoDue] = useState<string | null>(null);
  const [moStatus, setMoStatus] = useState<Order["status"]>("pending");
  const [moRemarks, setMoRemarks] = useState("");

  const openOrderModal = (id: number | null = null) => {
    setEditOrderId(id);
    if (id) {
      const o = orders.find((x) => x.order_id === id);
      setMoNumber(o?.order_number || "");
      setMoCust(o?.customer_id || "");
      setMoDue(o?.due_date || null);
      setMoStatus((o?.status as Order["status"]) || "pending");
      setMoRemarks(o?.remarks || "");
    } else {
      setMoNumber("");
      setMoCust("");
      setMoDue(null);
      setMoStatus("pending");
      setMoRemarks("");
    }
    setOrderModalOpen(true);
  };

  const saveOrder = () => {
    const order_number = moNumber.trim();
    if (!order_number) return alert("Order Number ห้ามว่าง");
    const obj: Omit<Order, "order_id"> = {
      order_number,
      customer_id: moCust.trim(),
      due_date: moDue || null,
      status: moStatus,
      remarks: moRemarks.trim(),
    };
    if (editOrderId) {
      setOrders((prev) => prev.map((o) => (o.order_id === editOrderId ? { ...o, ...obj } : o)));
    } else {
      const id = nextNumericId(orders, "order_id");
      setOrders((prev) => [...prev, { order_id: id, ...obj }]);
    }
    setOrderModalOpen(false);
  };

  const delOrder = (id: number) => {
    if (!confirm("ลบออเดอร์นี้?")) return;
    setOrders((prev) => prev.filter((x) => x.order_id !== id));
  };

  /** ====== Products modal data ====== */
  const [mpCode, setMpCode] = useState("");
  const [mpName, setMpName] = useState("");
  const [mpCat, setMpCat] = useState("");
  const [mpUnit, setMpUnit] = useState("pcs");
  const [mpStd, setMpStd] = useState<number>(0);
  const [mpImg, setMpImg] = useState("");
  const [mpDesc, setMpDesc] = useState("");

  const openProductModal = (id: number | null = null) => {
    setEditProdId(id);
    if (id) {
      const p = products.find((x) => x.id === id);
      setMpCode(p?.product_number || "");
      setMpName(p?.name || "");
      setMpCat(p?.category || "");
      setMpUnit(p?.unit_code || "pcs");
      setMpStd(p?.std_rate_min ?? 0);
      setMpImg(p?.image_url || "");
      setMpDesc(p?.description || "");
    } else {
      setMpCode(""); setMpName(""); setMpCat(""); setMpUnit("pcs"); setMpStd(0); setMpImg(""); setMpDesc("");
    }
    setProdModalOpen(true);
  };

  const saveProduct = () => {
    const code = mpCode.trim();
    const name = mpName.trim();
    if (!code || !name) return alert("Product Number และ Name ห้ามว่าง");
    const obj: Omit<Product, "id"> = {
      product_number: code,
      name,
      category: mpCat.trim(),
      unit_code: mpUnit.trim(),
      std_rate_min: Number(mpStd) || 0,
      image_url: mpImg.trim(),
      description: mpDesc.trim(),
    };
    if (editProdId) {
      setProducts((prev) => prev.map((p) => (p.id === editProdId ? { ...p, ...obj } : p)));
    } else {
      const id = nextNumericId(products, "id");
      setProducts((prev) => [...prev, { id, ...obj }]);
    }
    setProdModalOpen(false);
  };

  const delProduct = (id: number) => {
    if (!confirm("ลบสินค้า?")) return;
    setProducts((prev) => prev.filter((x) => x.id !== id));
  };

  /** ====== Machines modal data ====== */
  const [mmId, setMmId] = useState("");
  const [mmCode, setMmCode] = useState("");
  const [mmName, setMmName] = useState("");
  const [mmType, setMmType] = useState("");
  const [mmStatus, setMmStatus] = useState<Machine["status"]>("active");
  const [mmLoc, setMmLoc] = useState("");
  const [mmStd, setMmStd] = useState<number>(0.3);
  const [mmCapUnit, setMmCapUnit] = useState("pcs/hour");
  const [mmIns, setMmIns] = useState<string | null>(null);
  const [mmPur, setMmPur] = useState<string | null>(null);
  const [mmLast, setMmLast] = useState<string | null>(null);
  const [mmNotes, setMmNotes] = useState("");
  const [mmDesc, setMmDesc] = useState("");

  const openMachineModal = (id: string | null = null) => {
    setEditMacId(id);
    if (id) {
      const m = machines.find((x) => x.machine_id === id);
      setMmId(m?.machine_id || ""); setMmCode(m?.machine_code || ""); setMmName(m?.name || "");
      setMmType(m?.type || ""); setMmStatus((m?.status as Machine["status"]) || "active");
      setMmLoc(m?.location_id || ""); setMmStd(m?.std_rate_min ?? 0.3); setMmCapUnit(m?.capacity_unit || "");
      setMmIns(m?.installation_date || null); setMmPur(m?.purchase_date || null); setMmLast(m?.last_maintenance_date || null);
      setMmNotes(m?.notes || ""); setMmDesc(m?.description || ""); setCapList([...(m?.capabilities || [])]);
    } else {
      setMmId(""); setMmCode(""); setMmName(""); setMmType(""); setMmStatus("active"); setMmLoc("");
      setMmStd(0.3); setMmCapUnit("pcs/hour"); setMmIns(null); setMmPur(null); setMmLast(null);
      setMmNotes(""); setMmDesc(""); setCapList([]);
    }
    setMacModalOpen(true);
  };

  const capKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = (e.currentTarget.value || "").trim();
      if (!v) return;
      if (!capList.includes(v)) setCapList((prev) => [...prev, v]);
      e.currentTarget.value = "";
    }
  };
  const rmCap = (c: string) => setCapList((prev) => prev.filter((x) => x !== c));

  const saveMachine = () => {
    const machine_id = mmId.trim();
    if (!machine_id) return alert("Machine ID ห้ามว่าง");
    const obj: Machine = {
      machine_id,
      machine_code: mmCode.trim(),
      name: mmName.trim(),
      type: mmType.trim(),
      status: mmStatus,
      location_id: mmLoc.trim(),
      std_rate_min: Number(mmStd) || 0,
      capacity_unit: mmCapUnit.trim(),
      installation_date: mmIns || null,
      purchase_date: mmPur || null,
      last_maintenance_date: mmLast || null,
      notes: mmNotes.trim(),
      description: mmDesc.trim(),
      capabilities: [...capList],
      updated_at: new Date().toISOString(),
      created_at: editMacId ? undefined : new Date().toISOString(),
    };
    if (editMacId) {
      setMachines((prev) => prev.map((m) => (m.machine_id === editMacId ? { ...m, ...obj, created_at: m.created_at } : m)));
    } else {
      setMachines((prev) => [...prev, obj]);
    }
    setMacModalOpen(false);
  };

  const delMachine = (id: string) => {
    if (!confirm("ลบเครื่องจักร?")) return;
    setMachines((prev) => prev.filter((x) => x.machine_id !== id));
  };

  /** ====== Export / Import ====== */
  const exportCurrent = (fmt: "json" | "csv") => {
    const map = {
      orders: {
        data: orders,
        fields: ["order_id", "order_number", "customer_id", "due_date", "remarks", "status"],
      },
      products: {
        data: products,
        fields: ["id", "product_number", "name", "category", "description", "unit_code", "std_rate_min", "image_url"],
      },
      machines: {
        data: machines,
        fields: [
          "machine_id","machine_code","name","type","capabilities","status","location_id","description",
          "installation_date","purchase_date","last_maintenance_date","std_rate_min","capacity_unit","notes","created_at","updated_at",
        ],
      },
    } as const;
    const { data, fields } = map[tab];

    if (fmt === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      downloadBlob(`${tab}.json`, blob);
    } else {
      const rows = [fields.join(",")].concat(
        (data as any[]).map((obj) =>
          fields.map((k) => {
            let v = (obj as any)[k];
            if (Array.isArray(v)) v = v.join("|");
            if (v == null) v = "";
            const s = String(v).replaceAll(",", ";");
            return `"${s.replaceAll(`"`, `""`)}"`; // CSV-safe
          }).join(",")
        )
      );
      const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
      downloadBlob(`${tab}.csv`, blob);
    }
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        let parsed: any = null;
        const text = String(reader.result || "");
        if (f.name.endsWith(".json")) parsed = JSON.parse(text);
        else parsed = csvToArray(text);
        if (!Array.isArray(parsed)) throw new Error("Invalid data");
        const replace = true;
        if (tab === "orders") setOrders(replace ? parsed : (prev) => [...prev, ...parsed]);
        else if (tab === "products") setProducts(replace ? parsed : (prev) => [...prev, ...parsed]);
        else setMachines(replace ? parsed : (prev) => [...prev, ...parsed]);
        alert("Imported!");
      } catch (err: any) {
        alert("Import ไม่สำเร็จ: " + (err?.message || "unknown error"));
      }
    };
    reader.readAsText(f);
    e.target.value = "";
  };

  /** ========= Render ========= */
  return (
    <>
      <style>{css}</style>

      {/* Sticky top header */}
      <div className={`topbar ${hasShadow ? "shadow" : ""}`}>
        <div className="topbar-inner">
          <div>
            <h1 className="text-2xl font-bold">Master</h1>
            <div className="sub">Orders • Products • Machines</div>
          </div>

          <div className="right row" style={{ gap: 8 }}>
            {/* Tabs */}
            <div className="segment" role="tablist" aria-label="Master tabs">
              {(["orders","products","machines"] as const).map((t) => (
                <button
                  key={t}
                  className={tab === t ? "active" : ""}
                  onClick={() => setTab(t)}
                  role="tab"
                  aria-selected={tab === t}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <ImportButton
              label="Import CSV/Excel"
              onFilesSelected={(files) => {
                console.log("planning import:", files[0]?.name);
              }}
            />
            <ExportButton
              label="Export JSON"
              filename="users.json"
              data={[]}     
              type="json"   
            />

          </div>
        </div>
      </div>

      <div className="wrap">
        {/* ORDERS */}
        <section className={`card ${tab !== "orders" ? "hidden" : ""}`} style={{ marginTop: 16 }}>
          <div className="toolbar row" style={{ flexWrap: "wrap" as const, gap: 8 }}>
            <input type="search" placeholder="ค้นหา order_number / customer_id / status" value={orderQ} onChange={(e) => setOrderQ(e.target.value)} />
            <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value as Order["status"] | "")}>
              <option value="">ทุกสถานะ</option>
              <option>pending</option>
              <option>released</option>
              <option>completed</option>
              <option>cancelled</option>
            </select>
            <div className="relative group inline-block right">
              <IconButton variant="ok" tooltip="New Order" onClick={() => openOrderModal(null)}>              
                <Plus size={18}/>
              </IconButton>                  
            </div>
          </div>

          <div style={{ overflow: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Order No.</th>
                  <th>Customer</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.order_id ?? Math.random()}>
                    <td>{o.order_id}</td>
                    <td><b>{o.order_number}</b></td>
                    <td>{o.customer_id}</td>
                    <td>{o.due_date || "-"}</td>
                    <td>{o.status}</td>
                    <td>{o.remarks || "-"}</td>
                    <td className="row" style={{ gap: 6 }}>      
                      <IconButton tooltip={"Edit"} onClick={() => openOrderModal(o.order_id!)}>
                        <Edit3 size={16} />
                      </IconButton>
                      <IconButton variant="warn" tooltip={"Delete"} onClick={() => delOrder(o.order_id!)}>
                        <Trash2 size={16} />
                      </IconButton>

                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr><td colSpan={7} style={{ color: "#94a3b8" }}>ไม่พบข้อมูล</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className={`card ${tab !== "products" ? "hidden" : ""}`} style={{ marginTop: 16 }}>
          <div className="toolbar row" style={{ flexWrap: "wrap" as const }}>
            <input type="search" placeholder="ค้นหา product_number / ชื่อ / หมวดหมู่" value={prodQ} onChange={(e) => setProdQ(e.target.value)} />
            <div className="right">
              
              <IconButton variant="ok" tooltip="New Product" onClick={() => openProductModal(null)}>              
                <Plus size={18}/>
              </IconButton>         
            </div>
          </div>

          <div style={{ overflow: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Std (min)</th>
                  <th>Unit</th>
                  <th>Description</th>
                  <th>Image</th>
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id ?? Math.random()}>
                    <td>{p.id}</td>
                    <td><b>{p.product_number}</b></td>
                    <td>{p.name}</td>
                    <td>{p.category || "-"}</td>
                    <td>{p.std_rate_min ?? "-"}</td>
                    <td>{p.unit_code || "-"}</td>
                    <td>{p.description || "-"}</td>
                    <td>{p.image_url ? <a href={p.image_url} target="_blank" rel="noreferrer">open</a> : "-"}</td>
                    <td className="row" style={{ gap: 6 }}>         
                      <IconButton tooltip={"Edit"} onClick={() => openProductModal(p.id!)}>
                        <Edit3 size={16} />
                      </IconButton>
                      <IconButton variant="warn" tooltip={"Delete"} onClick={() => delProduct(p.id!)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr><td colSpan={9} style={{ color: "#94a3b8" }}>ไม่พบข้อมูล</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* MACHINES */}
        <section className={`card ${tab !== "machines" ? "hidden" : ""}`} style={{ marginTop: 16 }}>
          <div className="toolbar row" style={{ flexWrap: "wrap" as const }}>
            <input type="search" placeholder="ค้นหา machine_code / name / type / status" value={macQ} onChange={(e) => setMacQ(e.target.value)} />
            <div className="right">
              <IconButton variant="ok" tooltip="New Machine" onClick={() => openMachineModal(null)}>              
                <Plus size={18}/>
              </IconButton>   
            </div>
          </div>

          <div style={{ overflow: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Capabilities</th>
                  <th>Location</th>
                  <th>Std Rate</th>
                  <th>Unit</th>
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMachines.map((m) => (
                  <tr key={m.machine_id}>
                    <td>{m.machine_id}</td>
                    <td><b>{m.machine_code}</b></td>
                    <td>{m.name || "-"}</td>
                    <td>{m.type || "-"}</td>
                    <td>{m.status}</td>
                    <td>
                      {(m.capabilities || []).map((c) => (
                        <span className="pill" key={`${m.machine_id}-${c}`}>
                          {c}
                          <button className="x" onClick={() => rmCap(c)} title="remove">✕</button>
                        </span>
                      ))}
                    </td>
                    <td>{m.location_id || "-"}</td>
                    <td>{m.std_rate_min ?? "-"}</td>
                    <td>{m.capacity_unit || "-"}</td>
                    <td className="row" style={{ gap: 6 }}>                  
                      <IconButton tooltip={"Edit"} onClick={() => openMachineModal(m.machine_id)}>
                        <Edit3 size={16} />
                      </IconButton>
                      <IconButton variant="warn" tooltip={"Delete"} onClick={() => delMachine(m.machine_id)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
                {filteredMachines.length === 0 && (
                  <tr><td colSpan={10} style={{ color: "#94a3b8" }}>ไม่พบข้อมูล</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ====== MODALS ====== */}
      {/* Order Modal */}
      <div className={`modal ${orderModalOpen ? "" : "hidden"}`} onClick={() => setOrderModalOpen(false)} role="dialog" aria-modal="true">
        <div className="box" onClick={(e) => e.stopPropagation()}>
          <div className="head">
            <strong>{editOrderId ? "Edit Order" : "New Order"}</strong>
            <button className="iconbtn" onClick={() => setOrderModalOpen(false)} aria-label="Close"><X size={16} /></button>
          </div>
          <div className="body">
            <div className="grid2">
              <label>Order Number<input value={moNumber} onChange={(e) => setMoNumber(e.target.value)} placeholder="ORD-1001" /></label>
              <label>Customer ID<input value={moCust} onChange={(e) => setMoCust(e.target.value)} placeholder="CUST-001" /></label>
              <label>Due Date<input type="date" value={moDue || ""} onChange={(e) => setMoDue(e.target.value || null)} /></label>
              <label>Status
                <select value={moStatus} onChange={(e) => setMoStatus(e.target.value as Order["status"])}>
                  <option>pending</option><option>released</option><option>completed</option><option>cancelled</option>
                </select>
              </label>
            </div>
            <label>Remarks<textarea value={moRemarks} onChange={(e) => setMoRemarks(e.target.value)} placeholder="notes..." /></label>
          </div>
          <div className="foot">
            <button className="btn ok" onClick={saveOrder}>Save</button>
            <button className="btn ghost" onClick={() => setOrderModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <div className={`modal ${prodModalOpen ? "" : "hidden"}`} onClick={() => setProdModalOpen(false)} role="dialog" aria-modal="true">
        <div className="box" onClick={(e) => e.stopPropagation()}>
          <div className="head">
            <strong>{editProdId ? "Edit Product" : "New Product"}</strong>
            <button className="iconbtn" onClick={() => setProdModalOpen(false)} aria-label="Close"><X size={16} /></button>
          </div>
          <div className="body">
            <div className="grid2">
              <label>Product Number<input value={mpCode} onChange={(e) => setMpCode(e.target.value)} placeholder="ELEC-001" /></label>
              <label>Name<input value={mpName} onChange={(e) => setMpName(e.target.value)} placeholder="Product A" /></label>
              <label>Category<input value={mpCat} onChange={(e) => setMpCat(e.target.value)} placeholder="Electronics" /></label>
              <label>Unit<input value={mpUnit} onChange={(e) => setMpUnit(e.target.value)} placeholder="pcs" /></label>
              <label>Std Rate (min)<input type="number" step="0.1" min={0} value={mpStd} onChange={(e) => setMpStd(Number(e.target.value))} /></label>
              <label>Image URL<input value={mpImg} onChange={(e) => setMpImg(e.target.value)} placeholder="/static/images/products/product.png" /></label>
            </div>
            <label>Description<textarea value={mpDesc} onChange={(e) => setMpDesc(e.target.value)} placeholder="Description..." /></label>
          </div>
          <div className="foot">
            <button className="btn ok" onClick={saveProduct}>Save</button>
            <button className="btn ghost" onClick={() => setProdModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </div>

      {/* Machine Modal */}
      <div className={`modal ${macModalOpen ? "" : "hidden"}`} onClick={() => setMacModalOpen(false)} role="dialog" aria-modal="true">
        <div className="box" onClick={(e) => e.stopPropagation()}>
          <div className="head">
            <strong>{editMacId ? "Edit Machine" : "New Machine"}</strong>
            <button className="iconbtn" onClick={() => setMacModalOpen(false)} aria-label="Close"><X size={16} /></button>
          </div>
          <div className="body">
            <div className="grid2">
              <label>Machine ID<input value={mmId} onChange={(e) => setMmId(e.target.value)} placeholder="MCH-001" /></label>
              <label>Machine Code<input value={mmCode} onChange={(e) => setMmCode(e.target.value)} placeholder="CNCL-3000-01" /></label>
              <label>Name<input value={mmName} onChange={(e) => setMmName(e.target.value)} placeholder="CNC Lathe 3000" /></label>
              <label>Type<input value={mmType} onChange={(e) => setMmType(e.target.value)} placeholder="CNC Lathe" /></label>
              <label>Status
                <select value={mmStatus} onChange={(e) => setMmStatus(e.target.value as Machine["status"])}>
                  <option>active</option><option>down</option><option>standby</option>
                </select>
              </label>
              <label>Location ID<input value={mmLoc} onChange={(e) => setMmLoc(e.target.value)} placeholder="LOC-001" /></label>
              <label>Std Rate<input type="number" step="0.01" min={0} value={mmStd} onChange={(e) => setMmStd(Number(e.target.value))} /></label>
              <label>Capacity Unit<input value={mmCapUnit} onChange={(e) => setMmCapUnit(e.target.value)} placeholder="pcs/hour" /></label>
              <label>Installation Date<input type="date" value={mmIns || ""} onChange={(e) => setMmIns(e.target.value || null)} /></label>
              <label>Purchase Date<input type="date" value={mmPur || ""} onChange={(e) => setMmPur(e.target.value || null)} /></label>
              <label>Last Maintenance<input type="date" value={mmLast || ""} onChange={(e) => setMmLast(e.target.value || null)} /></label>
            </div>

            <label>Capabilities (พิมพ์แล้วกด Enter)</label>
            <div style={{ margin: "6px 0" }}>
              <div>
                {capList.map((c) => (
                  <span className="pill" key={c}>
                    {c}
                    <button className="x" onClick={() => rmCap(c)} title="remove">✕</button>
                  </span>
                ))}
              </div>
              <input placeholder="turning / cutting / drilling" onKeyDown={capKey} />
            </div>

            <label>Notes<textarea value={mmNotes} onChange={(e) => setMmNotes(e.target.value)} placeholder="Requires calibration every 6 months" /></label>
            <label>Description<textarea value={mmDesc} onChange={(e) => setMmDesc(e.target.value)} placeholder="Machine description" /></label>
          </div>
          <div className="foot">
            <button className="btn ok" onClick={saveMachine}>Save</button>
            <button className="btn ghost" onClick={() => setMacModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MasterDataPage;
