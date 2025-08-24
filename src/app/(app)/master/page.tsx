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

import OrderModal from "@/src/app/(app)/master/components/OrderModal";
import ProductModal from "@/src/app/(app)/master/components/ProductModal";
import MachineModal from "@/src/app/(app)/master/components/MachineModal";
import PageHeader from "@/src/components/layout/PageHeader";
import CommonTable from "@/src/components/shared/Table";
import { StatusBadge } from "@/src/components/shared/StatusBadge";

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
  type ViewMode = (typeof segmentOptions)[number]["value"];
  const [tab, setTab] = useState<ViewMode>("orders");

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
    { label: "All Status", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Released", value: "released" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
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
    {
      key: "action",
      header: "Action",
      className: "text-right",
      render: (o: Order) => (
        <div className="flex justify-end gap-2">
          <IconButton buttonClassName="px-2 py-1" onClick={() => openOrderModal(o.order_id ?? null)}>
            <Edit3 size={16} />
          </IconButton>
          <IconButton variant="warn" buttonClassName="px-2 py-1" onClick={() => o.order_id && delOrder(o.order_id)}>
            <Trash2 size={16} />
          </IconButton>
        </div>
      ),
    },
    { key: "order_number", header: "Order No.", render: (o: Order) => <b>{o.order_number}</b> },
    { key: "customer_id", header: "Customer" },
    { key: "due_date", header: "Due", render: (o: Order) => o.due_date || "-" },
    { key: "status", header: "Status",  render: (o: Order) => <StatusBadge status={o.status} />  },
    { key: "remarks", header: "Remarks", render: (o: Order) => o.remarks || "-" },
  ] as const;

  const productColumns = [
    {
      key: "action",
      header: "Action",
      className: "text-right",
      render: (p: Product) => (
        <div className="flex justify-end gap-2">
          <IconButton buttonClassName="px-2 py-1" onClick={() => openProductModal(p.id ?? null)}>
            <Edit3 size={16} />
          </IconButton>
          <IconButton variant="warn" buttonClassName="px-2 py-1" onClick={() => p.id && delProduct(p.id)}>
            <Trash2 size={16} />
          </IconButton>
        </div>
      ),
    },
    { key: "product_number", header: "Code", render: (p: Product) => <b>{p.product_number}</b> },
    { key: "name", header: "Name" },
    { key: "category", header: "Category", render: (p: Product) => p.category || "-" },
    { key: "std_rate_min", header: "Std (min)", render: (p: Product) => p.std_rate_min ?? "-" },
    { key: "unit_code", header: "Unit", render: (p: Product) => p.unit_code || "-" },
    { key: "description", header: "Description", render: (p: Product) => p.description || "-" },
  ] as const;

  const machineColumns = [
    {
      key: "action",
      header: "Action",
      className: "text-right",
      render: (m: Machine) => (
        <div className="flex justify-end gap-2">
          <IconButton buttonClassName="px-2 py-1" onClick={() => openMachineModal(m.machine_id)}>
            <Edit3 size={16} />
          </IconButton>
          <IconButton variant="warn" buttonClassName="px-2 py-1" onClick={() => delMachine(m.machine_id)}>
            <Trash2 size={16} />
          </IconButton>
        </div>
      ),
    },
    { key: "machine_id", header: "ID", className: "w-[120px]" },
    { key: "machine_code", header: "Code", render: (m: Machine) => <b>{m.machine_code}</b> },
    { key: "name", header: "Name", render: (m: Machine) => m.name || "-" },
    { key: "type", header: "Type", render: (m: Machine) => m.type || "-" },
    { 
      key: "status", 
      header: "Status", 
      render: (m: Machine) => <StatusBadge status={m.status} /> 
    },
    { key: "location_id", header: "Location", render: (m: Machine) => m.location_id || "-" },
    { key: "std_rate_min", header: "Std Rate", render: (m: Machine) => m.std_rate_min ?? "-" },
    { key: "capacity_unit", header: "Unit", render: (m: Machine) => m.capacity_unit || "-" },
  ] as const;

  /** ========= Pagination states (แยกต่อแท็บ) ========= */
  const [pageOrders, setPageOrders] = useState(1);
  const [pageProducts, setPageProducts] = useState(1);
  const [pageMachines, setPageMachines] = useState(1);
  const [pageSizeOrders, setPageSizeOrders] = useState(10);
  const [pageSizeProducts, setPageSizeProducts] = useState(10);
  const [pageSizeMachines, setPageSizeMachines] = useState(10);

  // reset page เมื่อ filter เปลี่ยน
  useEffect(() => { setPageOrders(1); }, [orderQ, orderStatus]);
  useEffect(() => { setPageProducts(1); }, [prodQ]);
  useEffect(() => { setPageMachines(1); }, [macQ]);

  /** ========= Derived (slice page) ========= */
  const ordersWithId = useMemo(() => filteredOrders, [filteredOrders]);
  const productsWithId = useMemo(() => filteredProducts, [filteredProducts]);
  const machinesWithId = useMemo(() => filteredMachines, [filteredMachines]);

  const pagedOrders = useMemo(
    () => paginate(ordersWithId, pageOrders, pageSizeOrders),
    [ordersWithId, pageOrders, pageSizeOrders]
  );
  const pagedProducts = useMemo(
    () => paginate(productsWithId, pageProducts, pageSizeProducts),
    [productsWithId, pageProducts, pageSizeProducts]
  );
  const pagedMachines = useMemo(
    () => paginate(machinesWithId, pageMachines, pageSizeMachines),
    [machinesWithId, pageMachines, pageSizeMachines]
  );

  return (
    <>
      <PageHeader
        title="Master"
        actions={
          <>
            <ImportButton
              onFilesSelected={(files) => {
                console.log("planning import:", files[0]?.name);
              }}
            />
            <ExportButton filename="master.json" data={{ orders, products, machines }} />
          </>
        }
        tabs={<Segment<ViewMode> value={tab} onChange={setTab} options={segmentOptions} />}
      />

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* ORDERS */}
        <section className={clsx(tab !== "orders" && "hidden")}>
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <SearchInput value={orderQ} onChange={setOrderQ} placeholder="order no. | customer" />
            <Dropdown value={orderStatus} onChange={(value) => setOrderStatus(value as "" | Order["status"])} options={orderStatusOptions} />
            <div className="ml-auto">
              <IconButton variant="ok" label="New Order" onClick={() => openOrderModal(null)}>
                <Plus size={18} />
              </IconButton>
            </div>
          </div>

          <CommonTable<Order>
            columns={orderColumns as any}
            data={pagedOrders}
            pagination={{
              total: ordersWithId.length,
              page: pageOrders,
              pageSize: pageSizeOrders,
              onPageChange: setPageOrders,
              onPageSizeChange: setPageSizeOrders,
              pageSizes: [10, 20, 50],
            }}
          />
        </section>

        {/* PRODUCTS */}
        <section className={clsx(tab !== "products" && "hidden")}>
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <SearchInput value={prodQ} onChange={setProdQ} placeholder="ค้นหา product_number / ชื่อ / หมวดหมู่" />
            <div className="ml-auto">
              <IconButton variant="ok" label="New Product" onClick={() => openProductModal(null)}>
                <Plus size={18} />
              </IconButton>
            </div>
          </div>

          <CommonTable<Product>
            columns={productColumns as any}
            data={pagedProducts}
            pagination={{
              total: productsWithId.length,
              page: pageProducts,
              pageSize: pageSizeProducts,
              onPageChange: setPageProducts,
              onPageSizeChange: setPageSizeProducts,
              pageSizes: [10, 20, 50],
            }}
          />
        </section>

        {/* MACHINES */}
        <section className={clsx(tab !== "machines" && "hidden")}>
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <SearchInput value={macQ} onChange={setMacQ} placeholder="ค้นหา machine_code / name / type / status" />
            <div className="ml-auto">
              <IconButton variant="ok" label="New Machine" onClick={() => openMachineModal(null)}>
                <Plus size={18} />
              </IconButton>
            </div>
          </div>

          <CommonTable<Machine>
            columns={machineColumns as any}
            data={pagedMachines}
            pagination={{
              total: machinesWithId.length,
              page: pageMachines,
              pageSize: pageSizeMachines,
              onPageChange: setPageMachines,
              onPageSizeChange: setPageSizeMachines,
              pageSizes: [10, 20, 50],
            }}
          />
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
