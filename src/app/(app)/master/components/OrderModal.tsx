import InputText from "@/src/components/shared/input/InputText";
import { X } from "lucide-react";
import React, { useState, useEffect } from "react";
// import { X } from "react-feather";

type Order = {
  id?: number;
  order_number?: string;
  customer_id?: string;
  due_date?: string | null;
  status?: string;
  remarks?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  onSave: (order: Order) => void;
};

export default function OrderModal({ isOpen, onClose, order, onSave }: Props) {
  const [moNumber, setMoNumber] = useState("");
  const [moCust, setMoCust] = useState("");
  const [moDue, setMoDue] = useState<string | null>(null);
  const [moStatus, setMoStatus] = useState("pending");
  const [moRemarks, setMoRemarks] = useState("");

  useEffect(() => {
    setMoNumber(order?.order_number || "");
    setMoCust(order?.customer_id || "");
    setMoDue(order?.due_date || null);
    setMoStatus(order?.status || "pending");
    setMoRemarks(order?.remarks || "");
  }, [order]);

  const handleSave = () => {
    onSave({
      id: order?.id,
      order_number: moNumber,
      customer_id: moCust,
      due_date: moDue,
      status: moStatus,
      remarks: moRemarks,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b pb-3">
          <h2 className="text-xl font-semibold">
            {order?.id ? "Edit Order" : "New Order"}
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
            label="Order Number"
            value={moNumber}
            onChange={setMoNumber}
            placeholder="ORD-1001"
          />
          <InputText
            label="Customer ID"
            value={moCust}
            onChange={setMoCust}
            placeholder="CUST-001"
          />

          <label>
            Due Date
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={moDue || ""}
              onChange={(e) => setMoDue(e.target.value || null)}
            />
          </label>
          <label>
            Status
            <select
              className="border p-2 rounded w-full"
              value={moStatus}
              onChange={(e) => setMoStatus(e.target.value)}
            >
              <option value="pending">pending</option>
              <option value="released">released</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>    
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks
          </label>
          <textarea
            rows={3}
            className="input resize-none block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:opacity-50"
            value={moRemarks}
            onChange={(e) => setMoRemarks(e.target.value)}
            placeholder="notes..."
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
