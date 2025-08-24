"use client";

import React, { useEffect, useState } from "react";
import BaseModal from "@/src/components/shared/modal/BaseModal";
import InputText from "@/src/components/shared/input/InputText";

type Product = {
  id?: number;
  product_number?: string;
  name?: string;
  category?: string;
  std_rate_min?: number;
  unit_code?: string;
  description?: string;
  image_url?: string;
};

type ProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSave: (product: Product) => void;
};

export default function ProductModal({ isOpen, onClose, product, onSave }: ProductModalProps) {
  const [mpCode, setMpCode] = useState("");
  const [mpName, setMpName] = useState("");
  const [mpCat, setMpCat] = useState("");
  const [mpUnit, setMpUnit] = useState("");
  const [mpStd, setMpStd] = useState<number | "">("");
  const [mpImg, setMpImg] = useState("");
  const [mpDesc, setMpDesc] = useState("");

  useEffect(() => {
    setMpCode(product?.product_number ?? "");
    setMpName(product?.name ?? "");
    setMpCat(product?.category ?? "");
    setMpUnit(product?.unit_code ?? "");
    setMpStd(product?.std_rate_min ?? "");
    setMpImg(product?.image_url ?? "");
    setMpDesc(product?.description ?? "");
  }, [product, isOpen]);

  const handleSave = () =>
    onSave({
      id: product?.id,
      product_number: mpCode,
      name: mpName,
      category: mpCat,
      std_rate_min: typeof mpStd === "number" ? mpStd : undefined,
      unit_code: mpUnit,
      image_url: mpImg,
      description: mpDesc,
    });

  const footer = (
    <>
      <button
        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
        onClick={onClose}
      >
        Cancel
      </button>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
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
      description="Define product master for production"
      size="md"
      footer={footer}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputText label="Product Number" value={mpCode} onChange={setMpCode} placeholder="ELEC-001" />
        <InputText label="Name" value={mpName} onChange={setMpName} placeholder="Product A" />
        <InputText label="Category" value={mpCat} onChange={setMpCat} placeholder="Electronics" />
        <InputText label="Unit" value={mpUnit} onChange={setMpUnit} placeholder="pcs" />
        <InputText
          label="Std Rate (min)"
          type="number"
          value={mpStd === "" ? "" : String(mpStd)}
          onChange={(val) => setMpStd(val === "" ? "" : Number(val))}
          placeholder="30"
        />
        <InputText
          label="Image URL"
          value={mpImg}
          onChange={setMpImg}
          placeholder="/static/images/products/product.png"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          className="resize-none block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          value={mpDesc}
          onChange={(e) => setMpDesc(e.target.value)}
          placeholder="Description..."
        />
      </div>
    </BaseModal>
  );
}
