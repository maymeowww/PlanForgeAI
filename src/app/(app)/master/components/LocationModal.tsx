"use client";

import React, { useEffect, useMemo, useState } from "react";
import BaseModal from "@/src/components/shared/modal/BaseModal";
import InputText from "@/src/components/shared/input/InputText";
import InputImage from "@/src/components/shared/input/InputImage";
import Dropdown from "@/src/components/shared/input/Dropdown";
import ToggleSwitch from "@/src/components/shared/input/ToggleSwitch";

type Product = {
  id?: number;
  product_number: string;
  name: string;
  type: "FG" | "RM" | "WIP";
  unit_code: string;                 // Unit (EA, KG, …)
  make_or_buy: "Make" | "Buy";
  lot_size?: number;                 // ขนาดล็อต
  safety_stock?: number;             // กันขาด
  default_supplier_id?: string;      // ผู้ขายหลัก (RM)
  image_url?: string;
  description?: string;
  is_active?: boolean;
};

type LocationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product?: Partial<Product> | null;
  onSave: (product: Product) => void;
  supplierOptions?: Array<{ label: string; value: string }>;
};

const typeOptions = [
  { label: "FG – Finished Goods", value: "FG" },
  { label: "RM – Raw Material", value: "RM" },
  { label: "WIP – Work In Progress", value: "WIP" },
];

const makeBuyOptions = [
  { label: "Make (ผลิตเอง)", value: "Make" },
  { label: "Buy (จัดซื้อ)", value: "Buy" },
];

export default function LocationModal({
  isOpen,
  onClose,
  product,
  onSave,
  supplierOptions = [
    { label: "— None —", value: "" },
    { label: "SteelCo (SUP-STEELCO)", value: "SUP-STEELCO" },
    { label: "PaintLab (SUP-PAINTLAB)", value: "SUP-PAINTLAB" },
  ],
}: LocationModalProps) {
  // ----- State -----
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"FG" | "RM" | "WIP">("FG");
  const [unit, setUnit] = useState("EA");
  const [makeBuy, setMakeBuy] = useState<"Make" | "Buy">("Make");

  const [lotSize, setLotSize] = useState<number | "">("");
  const [safetyStock, setSafetyStock] = useState<number | "">("");
  const [supplier, setSupplier] = useState<string>("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(""); // เผื่ออนาคต backend ส่ง URL มาก่อน
  const [desc, setDesc] = useState("");

  const [active, setActive] = useState(true);

  // ----- Initialize when open / product changes -----
  useEffect(() => {
    setCode(product?.product_number ?? "");
    setName(product?.name ?? "");
    setType((product?.type as "FG" | "RM" | "WIP") ?? "FG");
    setUnit(product?.unit_code ?? "EA");
    setMakeBuy((product?.make_or_buy as "Make" | "Buy") ?? "Make");

    setLotSize(
      product?.lot_size !== undefined && product?.lot_size !== null
        ? Number(product.lot_size)
        : ""
    );
    setSafetyStock(
      product?.safety_stock !== undefined && product?.safety_stock !== null
        ? Number(product.safety_stock)
        : ""
    );
    setSupplier(product?.default_supplier_id ?? "");

    setImageFile(null); // reset เลือกไฟล์ใหม่ทุกครั้ง
    setImageUrl(product?.image_url ?? ""); // ถ้า product เดิมมีรูป

    setDesc(product?.description ?? "");
    setActive(product?.is_active ?? true);
  }, [product, isOpen]);

  // ----- Derived: image preview & cleanup -----
  const previewUrl = useMemo(() => {
    if (!imageFile) return imageUrl || "";
    return URL.createObjectURL(imageFile);
  }, [imageFile, imageUrl]);

  // revoke object URL เมื่อเปลี่ยนไฟล์/ปิด modal
  useEffect(() => {
    return () => {
      if (imageFile) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile, previewUrl]);

  // ----- Validation -----
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!code?.trim()) e.code = "Product Code is required";
    if (!name?.trim()) e.name = "Product Name is required";
    if (!unit?.trim()) e.unit = "Unit is required";

    // ถ้า RM และ Buy ควรมี supplier
    if (type === "RM" && makeBuy === "Buy" && !supplier) {
      e.supplier = "Default Supplier is recommended for RM/Buy";
    }

    // number guard
    if (lotSize !== "" && Number(lotSize) < 1) e.lot = "Lot Size must be ≥ 1";
    if (safetyStock !== "" && Number(safetyStock) < 0)
      e.ss = "Safety Stock must be ≥ 0";

    return e;
  }, [code, name, unit, type, makeBuy, supplier, lotSize, safetyStock]);

  const canSave = Object.keys(errors).length === 0;

  // ----- Save -----
  const handleSave = () => {
    if (!canSave) return;

    const payload: Product = {
      id: product?.id,
      product_number: code.trim(),
      name: name.trim(),
      type,
      unit_code: unit.trim(),
      make_or_buy: makeBuy,
      lot_size: typeof lotSize === "number" ? lotSize : undefined,
      safety_stock: typeof safetyStock === "number" ? safetyStock : undefined,
      default_supplier_id: supplier || undefined,
      image_url: imageUrl || undefined, // ถ้าอัปโหลดเสร็จจาก backend ให้ set เข้ามาแทน
      description: desc?.trim() || undefined,
      is_active: active,
    };

    onSave(payload);
  };

  const footer = (
    <>
      <button
        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
        onClick={onClose}
      >
        Cancel
      </button>
      <button
        className={`px-4 py-2 rounded-md transition ${
          canSave
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-slate-300 text-slate-600 cursor-not-allowed"
        }`}
        disabled={!canSave}
        onClick={handleSave}
      >
        Save
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={product?.id ? "Edit Product" : "New Product"}
      description="Define product master for production planning / MRP"
      size="md"
      footer={footer}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basics */}
        <InputText
          label="Product Code"
          value={code}
          onChange={setCode}
          placeholder="FG-100"
          required
        />
        <InputText
          label="Product Name"
          value={name}
          onChange={setName}
          placeholder="Widget A"
          required
        />

        <Dropdown
          label="Type"
          value={type}
          onChange={(val: "FG" | "RM" | "WIP") => setType(val)}
          options={typeOptions}
          // ถ้าใช้ Dropdown เวอร์ชันที่รองรับ selectClassName ให้เพิ่ม selectClassName="h-10"
          className="w-full"
          required
        />

        <InputText
          label="Unit"
          value={unit}
          onChange={setUnit}
          placeholder="EA"
          required
        />

        <Dropdown
          label="Make or Buy"
          value={makeBuy}
          onChange={(val: "Make" | "Buy") => setMakeBuy(val)}
          options={makeBuyOptions}
          className="w-full"
          required
        />

        {/* Planning */}
        <InputText
          label="Lot Size"
          type="number"
          value={lotSize === "" ? "" : String(lotSize)}
          onChange={(v) => setLotSize(v === "" ? "" : Math.max(1, Number(v)))}
          placeholder="1"
          hint="ขนาดล็อตต่อรอบผลิต/สั่งซื้อ (≥ 1)"
        />

        <InputText
          label="Safety Stock"
          type="number"
          value={safetyStock === "" ? "" : String(safetyStock)}
          onChange={(v) =>
            setSafetyStock(v === "" ? "" : Math.max(0, Number(v)))
          }
          placeholder="0"
          hint="กันขาดสต็อก (≥ 0)"
        />

        {/* Procurement */}
        <Dropdown
          label="Default Supplier"
          value={supplier}
          onChange={setSupplier}
          options={supplierOptions}
          className="w-full"
        />

        {/* Image */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputImage label="Product Image" value={imageFile} onChange={setImageFile} />
          {previewUrl ? (
            <div className="md:col-span-2">
              <div className="text-sm text-slate-600 mb-1">Preview</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="preview"
                className="rounded-md border border-slate-200 max-h-56 object-contain bg-white p-2"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          className="resize-none block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description…"
        />
      </div>

      <div className="mt-3">
        <ToggleSwitch label="Active" checked={active} onChange={setActive} />
      </div>
    </BaseModal>
  );
}
