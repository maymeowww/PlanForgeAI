"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";
import ImportButton from "@/src/components/shared/button/ImportButton";
import ExportButton from "@/src/components/shared/button/ExportButton";
import IconButton from "@/src/components/shared/button/IconButton";
import Segment from "@/src/components/shared/button/Segment";
import Dropdown from "@/src/components/shared/input/Dropdown";
import SearchInput from "@/src/components/shared/input/SearchInput";
import clsx from "clsx";

// ใช้ Table เดียว (ตัวที่คุณอัปโหลด)
import Table from "@/src/components/shared/Table";

import OrderModal from "@/src/app/(app)/master/components/OrderModal";
import ProductModal from "@/src/app/(app)/master/components/ProductModal";
import MachineModal from "@/src/app/(app)/master/components/MachineModal";

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
const paginate = <T,>(list: T[], page: number, pageSize: number) =>
  list.slice((page - 1) * pageSize, page * pageSize);

const MasterDataPage: React.FC = () => {
  const segmentOptions = [
    { label: "orders", value: "orders" },
    { label: "products", value: "products" },
    { label: "machines", value: "machines" },
  ] as const;
  type ViewMode = typeof segmentOptions[number]["value"];
  const [tab, setTab] = useState<ViewMode>("orders");

  // header shadow
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
  const orderStatusOptions: { label: string; value: "" | Order["status"] }[] = [
    { label: "ทุกสถานะ", value: "" },
    { label: "pending", value: "pending" },
    { label: "released", value: "released" },
    { label: "completed", value: "completed" },
    { label: "cancelled", value: "cancelled" },
  ];

  /** ====== Products UI state ====== */
  const [prodQ, setProdQ] = useState("");
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [editProdId, setEditProdId] = useState<number | null>(null);

  /** ====== Machines UI state ====== */
  const [macQ, setMacQ] = useState("");
  const [macModalOpen, setMacModalOpen] = useState(false);
  const [editMacId, setEditMacId] = useState<string | null>(null);

  /** ====== Import file input ====== */
  const fileRef = useRef<HTMLInputElement>(null);

  /** ====== Filters ====== */
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
      setMoNumber(""); setMoCust(""); setMoDue(null); setMoStatus("pending"); setMoRemarks("");
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

  /** ===== Products modal handlers ===== */
  const openProductModal = (id: number | null = null) => {
    setEditProdId(id);
    if (id) {
      const p = products.find((x) => x.id === id);
      // set states ถ้าคุณใช้ภายใน ProductModal ก็ไม่ต้องเซ็ตละเอียดที่นี่
    }
    setProdModalOpen(true);
  };
  const delProduct = (id: number) => {
    if (!confirm("ลบสินค้า?")) return;
    setProducts((prev) => prev.filter((x) => x.id !== id));
  };

  /** ===== Machines modal handlers ===== */
  const openMachineModal = (id: string | null = null) => {
    setEditMacId(id);
    setMacModalOpen(true);
  };
  const delMachine = (id: string) => {
    if (!confirm("ลบเครื่องจักร?")) return;
    setMachines((prev) => prev.filter((x) => x.machine_id !== id));
  };

  /** ===== Selected rows for modals ===== */
  const selectedOrder = useMemo(() => {
    const o = editOrderId ? orders.find((x) => x.order_id === editOrderId) : null;
    return o
      ? {
          id: o.order_id ?? undefined,
          order_number: o.order_number,
          customer_id: o.customer_id,
          due_date: o.due_date,
          status: o.status,
          remarks: o.remarks,
        }
      : null;
  }, [editOrderId, orders]);

  const selectedProduct = useMemo(() => {
    return editProdId ? products.find((x) => x.id === editProdId) ?? null : null;
  }, [editProdId, products]);

  const selectedMachine = useMemo(() => {
    return editMacId ? machines.find((x) => x.machine_id === editMacId) ?? null : null;
  }, [editMacId, machines]);

  /** ===== onSave handlers from modals ===== */
  const handleSaveOrder = (m: {
    id?: number;
    order_number?: string;
    customer_id?: string;
    due_date?: string | null;
    status?: string;
    remarks?: string;
  }) => {
    const obj = {
      order_number: m.order_number?.trim() || "",
      customer_id: m.customer_id?.trim() || "",
      due_date: m.due_date || null,
      status: (m.status as Order["status"]) || "pending",
      remarks: m.remarks?.trim() || "",
    };
    if (!obj.order_number) return alert("Order Number ห้ามว่าง");

    if (m.id) {
      setOrders((prev) => prev.map((o) => (o.order_id === m.id ? { ...o, ...obj } : o)));
    } else {
      const id = nextNumericId(orders, "order_id");
      setOrders((prev) => [...prev, { order_id: id, ...obj }]);
    }
    setOrderModalOpen(false);
    setEditOrderId(null);
  };

  const handleSaveProduct = (m: {
    id?: number;
    product_number?: string;
    name?: string;
    category?: string;
    std_rate_min?: number;
    unit_code?: string;
    description?: string;
    image_url?: string;
  }) => {
    const obj = {
      product_number: (m.product_number || "").trim(),
      name: (m.name || "").trim(),
      category: (m.category || "").trim(),
      unit_code: (m.unit_code || "pcs").trim(),
      std_rate_min: Number(m.std_rate_min ?? 0) || 0,
      image_url: (m.image_url || "").trim(),
      description: (m.description || "").trim(),
    };
    if (!obj.product_number || !obj.name) return alert("Product Number และ Name ห้ามว่าง");

    if (m.id) {
      setProducts((prev) => prev.map((p) => (p.id === m.id ? { ...p, ...obj } : p)));
    } else {
      const id = nextNumericId(products, "id");
      setProducts((prev) => [...prev, { id, ...obj } as Product]);
    }
    setProdModalOpen(false);
    setEditProdId(null);
  };

  const handleSaveMachine = (
    m: {
      machine_id?: string;
      machine_code?: string;
      name?: string;
      type?: string;
      status?: string;
      location_id?: string;
      std_rate_min?: number;
      capacity_unit?: string;
      installation_date?: string | null;
      purchase_date?: string | null;
      last_maintenance?: string | null; // from modal
      notes?: string;
      description?: string;
    },
    capsFromModal: string[]
  ) => {
    const base = {
      machine_id: (m.machine_id || "").trim(),
      machine_code: (m.machine_code || "").trim(),
      name: (m.name || "").trim(),
      type: (m.type || "").trim(),
      status: (m.status as Machine["status"]) || "active",
      location_id: (m.location_id || "").trim(),
      std_rate_min: Number(m.std_rate_min ?? 0) || 0,
      capacity_unit: (m.capacity_unit || "").trim(),
      installation_date: m.installation_date || null,
      purchase_date: m.purchase_date || null,
      last_maintenance_date: m.last_maintenance || null,
      notes: (m.notes || "").trim(),
      description: (m.description || "").trim(),
      capabilities: [...capsFromModal],
    };

    if (!base.machine_id) return alert("Machine ID ห้ามว่าง");

    const exists = editMacId && machines.some((x) => x.machine_id === editMacId);
    if (exists) {
      setMachines((prev) =>
        prev.map((x) => (x.machine_id === editMacId ? { ...x, ...base, updated_at: new Date().toISOString() } : x))
      );
    } else {
      setMachines((prev) => [
        ...prev,
        { ...base, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ]);
    }
    setMacModalOpen(false);
    setEditMacId(null);
  };

  /** ========= Columns ========= */
  const orderColumns = [
    { label: "No.", key: "order_id", width: "80px" },
    { label: "Order No.", key: "order_number", render: (o: any) => <b>{o.order_number}</b> },
    { label: "Customer", key: "customer_id" },
    { label: "Due", key: "due_date", render: (o: any) => o.due_date || "-" },
    { label: "Status", key: "status" },
    { label: "Remarks", key: "remarks", render: (o: any) => o.remarks || "-" },
  ];

  const productColumns = [
    { label: "ID", key: "id" },
    { label: "Code", key: "product_number", render: (p: any) => <b>{p.product_number}</b> },
    { label: "Name", key: "name" },
    { label: "Category", key: "category", render: (p: any) => p.category || "-" },
    { label: "Std (min)", key: "std_rate_min", render: (p: any) => p.std_rate_min ?? "-" },
    { label: "Unit", key: "unit_code", render: (p: any) => p.unit_code || "-" },
    { label: "Description", key: "description", render: (p: any) => p.description || "-" },
  ];

  const machineColumns = [
    { label: "ID", key: "machine_id" },
    { label: "Code", key: "machine_code", render: (m: any) => <b>{m.machine_code}</b> },
    { label: "Name", key: "name", render: (m: any) => m.name || "-" },
    { label: "Type", key: "type", render: (m: any) => m.type || "-" },
    { label: "Status", key: "status" },
    { label: "Location", key: "location_id", render: (m: any) => m.location_id || "-" },
    { label: "Std Rate", key: "std_rate_min", render: (m: any) => m.std_rate_min ?? "-" },
    { label: "Unit", key: "capacity_unit", render: (m: any) => m.capacity_unit || "-" },
  ];

  /** ========= Pagination states (แยกต่อแท็บ) ========= */
  const pageSize = 10;
  const [pageOrders, setPageOrders] = useState(1);
  const [pageProducts, setPageProducts] = useState(1);
  const [pageMachines, setPageMachines] = useState(1);

  // reset page เมื่อ filter เปลี่ยน
  useEffect(() => { setPageOrders(1); }, [orderQ, orderStatus]);
  useEffect(() => { setPageProducts(1); }, [prodQ]);
  useEffect(() => { setPageMachines(1); }, [macQ]);

  /** ========= Derived (add id + slice page) ========= */
  const ordersWithId = useMemo(
    () => filteredOrders.map(o => ({ ...o, id: o.order_id ?? undefined })),
    [filteredOrders]
  );
  const productsWithId = useMemo(
    () => filteredProducts.map(p => ({ ...p, id: p.id ?? undefined })),
    [filteredProducts]
  );
  const machinesWithId = useMemo(
    () => filteredMachines.map(m => ({ ...m, id: m.machine_id })), // ให้ id = machine_id (string)
    [filteredMachines]
  );

  const pagedOrders = paginate(ordersWithId, pageOrders, pageSize);
  const pagedProducts = paginate(productsWithId, pageProducts, pageSize);
  const pagedMachines = paginate(machinesWithId, pageMachines, pageSize);

  return (
    <>
      <header
        className={clsx(
          "py-2 sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 overflow-hidden",
          hasShadow ? "shadow-sm" : "shadow-none"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 py-2 pb-1 flex items-center justify-between gap-3 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold leading-tight">Master</h1>
          <div className="flex items-center gap-2 min-w-0">
            <ImportButton
              label="Import CSV/Excel"
              onFilesSelected={(files) => {
                console.log("planning import:", files[0]?.name);
              }}
            />
            <ExportButton
              label="Export JSON"
              filename="master.json"
              data={{ orders, products, machines }}
              type="json"
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-3 md:px-6 pb-2 overflow-x-auto">
          <Segment<ViewMode> value={tab} onChange={setTab} options={segmentOptions} />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* ORDERS */}
        <section className={`bg-white border rounded-2xl shadow-sm p-4 ${tab !== "orders" ? "hidden" : ""}`} style={{ marginTop: 16 }}>
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <SearchInput
              value={orderQ}
              onChange={setOrderQ}
              placeholder="ค้นหา order_number / customer_id / status"
            />
            <Dropdown
              value={orderStatus}
              onChange={(value) => setOrderStatus(value as "" | Order["status"])}
              options={orderStatusOptions}
            />
            <div className="ml-auto">
              <IconButton variant="ok" tooltip="New Order" onClick={() => openOrderModal(null)}>
                <Plus size={18} />
              </IconButton>
            </div>
          </div>

          <div className="overflow-auto">
            <Table
              columns={orderColumns}
              data={pagedOrders}
              currentPage={pageOrders}
              pageSize={pageSize}
              totalItems={ordersWithId.length}
              onPageChange={setPageOrders}
              openOrderModal={(id) => openOrderModal(Number(id))}
              delOrder={(id) => delOrder(Number(id))}
            />
          </div>
        </section>

        {/* PRODUCTS */}
        <section className={`bg-white border rounded-2xl shadow-sm p-4 ${tab !== "products" ? "hidden" : ""}`} style={{ marginTop: 16 }}>
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <SearchInput
              value={prodQ}
              onChange={setProdQ}
              placeholder="ค้นหา product_number / ชื่อ / หมวดหมู่"
            />
            <div className="ml-auto">
              <IconButton variant="ok" tooltip="New Product" onClick={() => openProductModal(null)}>
                <Plus size={18} />
              </IconButton>
            </div>
          </div>

          <div className="overflow-auto">
            <Table
              columns={productColumns}
              data={pagedProducts}
              currentPage={pageProducts}
              pageSize={pageSize}
              totalItems={productsWithId.length}
              onPageChange={setPageProducts}
              openOrderModal={(id) => openProductModal(Number(id))}
              delOrder={(id) => delProduct(Number(id))}
            />
          </div>
        </section>

        {/* MACHINES */}
        <section className={`bg-white border rounded-2xl shadow-sm p-4 ${tab !== "machines" ? "hidden" : ""}`} style={{ marginTop: 16 }}>
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <SearchInput
              value={macQ}
              onChange={setMacQ}
              placeholder="ค้นหา machine_code / name / type / status"
            />
            <div className="ml-auto">
              <IconButton variant="ok" tooltip="New Machine" onClick={() => openMachineModal(null)}>
                <Plus size={18} />
              </IconButton>
            </div>
          </div>

          <div className="overflow-auto">
            <Table
              columns={machineColumns}
              data={pagedMachines}
              currentPage={pageMachines}
              pageSize={pageSize}
              totalItems={machinesWithId.length}
              onPageChange={setPageMachines}
              openOrderModal={(id) => openMachineModal(String(id))}
              delOrder={(id) => delMachine(String(id))}
            />
          </div>
        </section>
      </div>

      {/* ====== MODALS ====== */}
      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => { setOrderModalOpen(false); setEditOrderId(null); }}
        order={selectedOrder || undefined}
        onSave={handleSaveOrder}
      />
      <ProductModal
        isOpen={prodModalOpen}
        onClose={() => { setProdModalOpen(false); setEditProdId(null); }}
        product={selectedProduct || undefined}
        onSave={handleSaveProduct}
      />
      <MachineModal
        isOpen={macModalOpen}
        onClose={() => { setMacModalOpen(false); setEditMacId(null); }}
        machine={selectedMachine || undefined}
        capabilities={selectedMachine?.capabilities || []}
        onSave={handleSaveMachine}
        onRemoveCapability={() => {}}
      />
    </>
  );
};

export default MasterDataPage;
