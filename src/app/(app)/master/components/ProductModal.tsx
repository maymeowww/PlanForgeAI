import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSave: (product: Product) => void;
};

export default function ProductModal({ isOpen, onClose, product, onSave }: Props) {
  const [mpCode, setMpCode] = useState("");
  const [mpName, setMpName] = useState("");
  const [mpCat, setMpCat] = useState("");
  const [mpUnit, setMpUnit] = useState("");
  const [mpStd, setMpStd] = useState<number | "">("");
  const [mpImg, setMpImg] = useState("");
  const [mpDesc, setMpDesc] = useState("");

  useEffect(() => {
    setMpCode(product?.product_number || "");
    setMpName(product?.name || "");
    setMpCat(product?.category || "");
    setMpUnit(product?.unit_code || "");
    setMpStd(product?.std_rate_min ?? "");
    setMpImg(product?.image_url || "");
    setMpDesc(product?.description || "");
  }, [product]);

  const handleSave = () => {
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
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b pb-3">
          <h2 className="text-xl font-semibold">
            {product?.id ? "Edit Product" : "New Product"}
          </h2>
          <button
            className="text-gray-500 hover:text-red-500 transition"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <InputText
            label="Product Number"
            value={mpCode}
            onChange={setMpCode}
            placeholder="ELEC-001"
          />

          <InputText
            label="Name"
            value={mpName}
            onChange={setMpName}
            placeholder="Product A"
          />
          <InputText
            label="Category"
            value={mpCat}
            onChange={setMpCat}
            placeholder="Electronics"
          />
          <InputText
            label="Unit"
            value={mpUnit}
            onChange={setMpUnit}
            placeholder="pcs"
          />
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

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            className="input resize-none block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:opacity-50"
            value={mpDesc}
            onChange={(e) => setMpDesc(e.target.value)}
            placeholder="Description..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
