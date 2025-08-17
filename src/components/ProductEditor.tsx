"use client";

import { useRef, useState } from "react";

export type ProductEditorValues = {
  name: string;
  qty: number;
  image?: File | null;
};

export default function ProductEditor({
// initial = { name: "", qty: 0, image: null },
//   onSubmit,
//   submitLabel = "Save",
// }: {
//   initial?: ProductEditorValues;
//   onSubmit: (values: ProductEditorValues) => void;
//   submitLabel?: string;
}) {
  const initial = { name: "", qty: 0, image: null };
  const [name, setName] = useState(initial.name);
  const [qty, setQty] = useState<number>(initial.qty ?? 0);
  const [image, setImage] = useState<File | null>(initial.image ?? null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const openPicker = () => fileRef.current?.click();

  const handleFile = (file?: File) => {
    if (!file) return;
    setImage(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    handleFile(f);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    handleFile(f);
  };

  const isValid = name.trim().length > 0 && qty >= 0;

  const clearImage = () => {
    setImage(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    // onSubmit({ name: name.trim(), qty, image });
  };

  return (
    <form onSubmit={submit} className="max-w-lg space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Edit Product</h2>
        <p className="text-sm text-gray-500">Name, quantity and image upload.</p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Widget A"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
        <input
          type="number"
          min={0}
          value={Number.isNaN(qty) ? 0 : qty}
          onChange={(e) => setQty(parseInt(e.target.value || "0", 10))}
          className="w-40 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Image uploader */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Image</label>

        {!preview ? (
          <div
            onClick={openPicker}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="cursor-pointer flex items-center justify-center h-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
          >
            <div className="text-center text-gray-500">
              <svg className="mx-auto mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v10m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 15v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div className="text-sm">Drag & drop or click to select</div>
              <div className="text-xs text-gray-400">PNG / JPG • up to ~5MB</div>
            </div>
          </div>
        ) : (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="preview"
              className="h-32 w-32 rounded-lg object-cover border border-gray-200"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 rounded-full bg-white border border-gray-300 shadow p-1 hover:bg-gray-50"
              aria-label="Remove image"
              title="Remove"
            >
              ✕
            </button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={onFileChange}
        />
        <div>
          <button
            type="button"
            onClick={openPicker}
            className="text-sm text-primary hover:underline"
          >
            Choose file…
          </button>
          {image && <span className="ml-2 text-xs text-gray-500">{image.name}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!isValid}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white ${
            isValid ? "bg-primary hover:opacity-90" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12l4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {"submitLabel"}
        </button>
      </div>
    </form>
  );
}
