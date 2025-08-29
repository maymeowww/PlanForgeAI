"use client";

import React, { useMemo, useState } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";

import ImportButton from "@/src/components/shared/button/ImportButton";
import ExportButton from "@/src/components/shared/button/ExportButton";
import IconButton from "@/src/components/shared/button/IconButton";
import PageHeader from "@/src/components/layout/PageHeader";
import SearchInput from "@/src/components/shared/input/SearchInput";
import CommonTable from "@/src/components/shared/Table";
import ProductModal from "@/src/app/(app)/master/components/ProductModal";
import { AddButton, DeleteButton, EditButton } from "@/src/components/shared/button/ActionButtons";

/* ========= Types ========= */
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

/* ========= Helpers ========= */
const nextNumericId = <T, K extends keyof T>(arr: T[], key: K): number => {
  const max = arr.reduce((m, x: any) => Math.max(m, Number(x?.[key] || 0)), 0);
  return (max || 0) + 1;
};

export default function ProductMasterPage() {
  /* ===== Mock data ===== */
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      product_number: "ELEC-001",
      name: "Product A",
      category: "Electronics",
      description: "High-quality electronic component",
      unit_code: "pcs",
      std_rate_min: 5,
      image_url: "/static/images/products/product_a.png",
    },
    {
      id: 2,
      product_number: "AUTO-002",
      name: "Product B",
      category: "Automotive",
      description: "Spare part for automotive industry",
      unit_code: "pcs",
      std_rate_min: 8,
      image_url: "/static/images/products/product_b.png",
    },
  ]);

  /* ===== UI state ===== */
  const [prodQ, setProdQ] = useState("");
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [editProdId, setEditProdId] = useState<number | null>(null);

  // pagination (ภายในหน้า)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* ===== Filter + Page ===== */
  const filtered = useMemo(() => {
    const q = prodQ.trim().toLowerCase();
    const out = products.filter((p) => {
      const text = [p.product_number, p.name, p.category, p.description].join(" ").toLowerCase();
      return !q || text.includes(q);
    });
    // reset หน้าเมื่อค้นหาเปลี่ยน
    if (page !== 1) setPage(1);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, prodQ]);

  const total = filtered.length;
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  /* ===== Columns ===== */
  const productColumns = [
    {
      key: "action",
      header: "Action",
      className: "text-right",
      headerClassName: "text-right",
      render: (p: Product) => (
        <div className="flex justify-end gap-2">
          <EditButton onClick={() => openProductModal(p.id ?? null)}/>
          <DeleteButton onClick={() => p.id != null && delProduct(p.id)}/>          
        </div>
      ),
    },
    { key: "product_number", header: "Code", render: (p: Product) => <b>{p.product_number}</b> },
    { key: "name", header: "Name" },
    { key: "category", header: "Category", render: (p: Product) => p.category || "-" },
    { key: "std_rate_min", header: "Std Rate (min)", render: (p: Product) => p.std_rate_min ?? "-" },
    { key: "unit_code", header: "Unit", render: (p: Product) => p.unit_code || "-" },
    { key: "description", header: "Description", render: (p: Product) => p.description || "-" },
  ] as const;

  /* ===== Handlers ===== */
  function openProductModal(id: number | null = null) {
    setEditProdId(id);
    setProdModalOpen(true);
  }

  function delProduct(id: number) {
    if (!confirm("ลบสินค้า?")) return;
    setProducts((prev) => prev.filter((x) => x.id !== id));
  }

  function handleSaveProduct(m: {
    id?: number;
    product_number?: string;
    name?: string;
    category?: string;
    std_rate_min?: number;
    unit_code?: string;
    description?: string;
    image_url?: string;
  }) {
    const obj = {
      product_number: (m.product_number || "").trim(),
      name: (m.name || "").trim(),
      category: (m.category || "").trim(),
      unit_code: (m.unit_code || "pcs").trim(),
      std_rate_min: Number(m.std_rate_min ?? 0) || 0,
      image_url: (m.image_url || "").trim(),
      description: (m.description || "").trim(),
    };
    if (!obj.product_number || !obj.name) {
      alert("Product Number และ Name ห้ามว่าง");
      return;
    }
    if (m.id) {
      setProducts((prev) => prev.map((p) => (p.id === m.id ? { ...p, ...obj } : p)));
    } else {
      const id = nextNumericId(products, "id");
      setProducts((prev) => [...prev, { id, ...obj } as Product]);
    }
    setProdModalOpen(false);
    setEditProdId(null);
  }

  return (
    <>
      <PageHeader
        title="Product Master"
        actions={
          <>
            <ImportButton onFilesSelected={(files) => console.log("product import:", files[0]?.name)} />
            <ExportButton filename="products.json" data={{ products }} />
          </>
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-6">
        <section className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm bg-white dark:bg-slate-900">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SearchInput
              value={prodQ}
              onChange={setProdQ}
              placeholder="ค้นหา product_number / ชื่อ / หมวดหมู่"
            />
            <div className="ml-auto">
              <AddButton label="Add Product" onClick={() => openProductModal(null)}/>
            </div>
          </div>

          <CommonTable<Product>
            columns={productColumns as any}
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

      {/* MODAL */}
      <ProductModal
        isOpen={prodModalOpen}
        onClose={() => {
          setProdModalOpen(false);
          setEditProdId(null);
        }}
        product={(editProdId ? products.find((x) => x.id === editProdId) : undefined) || undefined}
        onSave={handleSaveProduct}
      />
    </>
  );
}
