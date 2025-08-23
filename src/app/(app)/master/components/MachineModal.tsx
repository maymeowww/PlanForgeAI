import InputText from "@/src/components/shared/input/InputText";
import { X } from "lucide-react";
import React, { useState, useEffect, KeyboardEvent } from "react";
// import { X } from "react-feather";

type Machine = {
  id?: string;
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
  last_maintenance?: string | null;
  notes?: string;
  description?: string;
  capabilities?: string[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  machine?: Machine | null;
  capabilities: string[];
  onSave: (machine: Machine, capabilities: string[]) => void;
  onRemoveCapability: (cap: string) => void;
};

export default function MachineModal({
  isOpen,
  onClose,
  machine,
  capabilities,
  onSave,
  onRemoveCapability,
}: Props) {
  const [mmId, setMmId] = useState("");
  const [mmCode, setMmCode] = useState("");
  const [mmName, setMmName] = useState("");
  const [mmType, setMmType] = useState("");
  const [mmStatus, setMmStatus] = useState("active");
  const [mmLoc, setMmLoc] = useState("");
  const [mmStd, setMmStd] = useState<number | "">("");
  const [mmCapUnit, setMmCapUnit] = useState("");
  const [mmIns, setMmIns] = useState<string | null>(null);
  const [mmPur, setMmPur] = useState<string | null>(null);
  const [mmLast, setMmLast] = useState<string | null>(null);
  const [mmNotes, setMmNotes] = useState("");
  const [mmDesc, setMmDesc] = useState("");
  const [capList, setCapList] = useState<string[]>([]);

  useEffect(() => {
    setMmId(machine?.machine_id || "");
    setMmCode(machine?.machine_code || "");
    setMmName(machine?.name || "");
    setMmType(machine?.type || "");
    setMmStatus(machine?.status || "active");
    setMmLoc(machine?.location_id || "");
    setMmStd(machine?.std_rate_min ?? "");
    setMmCapUnit(machine?.capacity_unit || "");
    setMmIns(machine?.installation_date || null);
    setMmPur(machine?.purchase_date || null);
    setMmLast(machine?.last_maintenance || null);
    setMmNotes(machine?.notes || "");
    setMmDesc(machine?.description || "");
    setCapList(machine?.capabilities || []);
  }, [machine]);

  const handleSave = () => {
    onSave(
      {
        machine_id: mmId,
        machine_code: mmCode,
        name: mmName,
        type: mmType,
        status: mmStatus,
        location_id: mmLoc,
        std_rate_min: typeof mmStd === "number" ? mmStd : undefined,
        capacity_unit: mmCapUnit,
        installation_date: mmIns,
        purchase_date: mmPur,
        last_maintenance: mmLast,
        notes: mmNotes,
        description: mmDesc,
      },
      capList
    );
  };

  const rmCap = (cap: string) => {
    setCapList((prev) => prev.filter((c) => c !== cap));
    onRemoveCapability(cap);
  };

  const capKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = (e.target as HTMLInputElement).value.trim();
      if (val && !capList.includes(val)) {
        setCapList((prev) => [...prev, val]);
        (e.target as HTMLInputElement).value = "";
      }
    }
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
            {machine?.machine_id ? "Edit Machine" : "New Machine"}
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
            label="Machine ID"
            value={mmId}
            onChange={setMmId}
            placeholder="MCH-001"
          />

          <InputText
            label="Machine Code"
            value={mmCode}
            onChange={setMmCode}
            placeholder="CNCL-3000-01"
          />

          <InputText
            label="Name"
            value={mmName}
            onChange={setMmName}
            placeholder="CNC Lathe 3000"
          />
          
          <InputText
            label="Type"
            value={mmType}
            onChange={setMmType}
            placeholder="CNC Lathe"
          />
              
          <label>
            Status
            <select
              className="border p-2 rounded w-full"
              value={mmStatus}
              onChange={(e) => setMmStatus(e.target.value)}
            >
              <option value="active">active</option>
              <option value="down">down</option>
              <option value="standby">standby</option>
            </select>
          </label>
          <label>
            Location ID
            <input
              className="border p-2 rounded w-full"
              value={mmLoc}
              onChange={(e) => setMmLoc(e.target.value)}
              placeholder="LOC-001"
            />
          </label>

          <InputText
            label="Std Rate (min)"
            type="number"
            value={mmStd === "" ? "" : String(mmStd)}
            onChange={(val) => setMmStd(val === "" ? "" : Number(val))}
            placeholder="30"
          />

            <InputText
            label="Capacity Unit"
            value={mmCapUnit}
            onChange={setMmCapUnit}
            placeholder="pcs/hour"
          />
 
          <label>
            Installation Date
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={mmIns || ""}
              onChange={(e) => setMmIns(e.target.value || null)}
            />
          </label>
          <label>
            Purchase Date
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={mmPur || ""}
              onChange={(e) => setMmPur(e.target.value || null)}
            />
          </label>
          <label>
            Last Maintenance
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={mmLast || ""}
              onChange={(e) => setMmLast(e.target.value || null)}
            />
          </label>

          {/* <label>Capabilities (พิมพ์แล้วกด Enter)</label>
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {capList.map((c) => (
                <span
                  key={c}
                  className="pill bg-gray-200 rounded px-2 py-1 flex items-center gap-1"
                >
                  {c}
                  <button
                    type="button"
                    className="text-red-500 font-bold"
                    onClick={() => rmCap(c)}
                    title="remove"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <input
              className="border p-2 rounded w-full"
              placeholder="turning / cutting / drilling"
              onKeyDown={capKey}
            />
          </div> */}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            rows={3}
            className="input resize-none block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:opacity-50"
            value={mmNotes}
            onChange={(e) => setMmNotes(e.target.value)}
            placeholder="Requires calibration every 6 months"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            className="input resize-none block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:opacity-50"
            value={mmDesc}
            onChange={(e) => setMmDesc(e.target.value)}
            placeholder="Machine description"
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
