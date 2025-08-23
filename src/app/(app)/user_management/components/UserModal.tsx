import React, { useEffect, useMemo, useState } from "react";
import { Group, User } from "@/src/types";
import InputText from "@/src/components/shared/input/InputText";
import ImageUploader from "@/src/components/shared/input/ImageUploader";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (user: Partial<User> & { user_id?: number; password?: string }) => void;
  groups: Group[];
  editing?: User | null;
};

export default function UserModal({
  open,
  onClose,
  onSave,
  groups,
  editing,
}: Props) {
  const [frm, setFrm] = useState<Partial<User>>({});
  const [password, setPassword] = useState("");
  const title = editing ? "Edit User" : "New User";

  useEffect(() => {
    if (editing) {
      setFrm(editing);
      setPassword("");
    } else {
      setFrm({
        is_active: true,
        user_group_id: groups[0]?.group_id ?? null,
      });
      setPassword("");
    }
  }, [open, editing, groups]);

  const avatar = useMemo(() => {
    return frm.profile_image_url || `https://i.pravatar.cc/100?u=${frm.username ?? "u"}`;
  }, [frm.profile_image_url, frm.username]);

  if (!open) return null;

  const set = (k: keyof User, v: any) => setFrm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!frm.username?.trim()) {
      alert("Username ห้ามว่าง");
      return;
    }
    onSave({ ...frm, password: password || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">{title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Avatar + Image URL */}
          <div className="flex items-center gap-4 col-span-full justify-center">
            <ImageUploader
              value={frm.profile_image_url ?? ""}
              onChange={(val) => set("profile_image_url", val)}
            />
          </div>

          {/* Fields */}
          <InputText
            label="Employee Code"
            placeholder="EMP001"
            value={frm.employee_code ?? ""}
            onChange={(v) => set("employee_code", v)}
          />

          <InputText
            label="Username"
            placeholder="username"
            value={frm.username ?? ""}
            onChange={(v) => set("username", v)}
            required
          />

          <InputText
            label="Full Name"
            placeholder="Full Name"
            value={frm.full_name ?? ""}
            onChange={(v) => set("full_name", v)}
          />

          <InputText
            label="Email"
            placeholder="email@example.com"
            value={frm.email ?? ""}
            onChange={(v) => set("email", v)}
          />

          <InputText
            label="Department"
            placeholder="Planning / Production / QA ..."
            value={frm.department ?? ""}
            onChange={(v) => set("department", v)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group
            </label>
            <select
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={frm.user_group_id ?? ""}
              onChange={(e) => set("user_group_id", Number(e.target.value))}
            >
              {groups.map((g) => (
                <option key={g.group_id} value={g.group_id}>
                  {g.group_name}
                </option>
              ))}
            </select>
          </div>

          <InputText
            label="New Password"
            type="password"
            placeholder="(optional for update)"
            value={password}
            onChange={setPassword}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-8">
         <label className="flex items-center gap-3 text-sm select-none">
          <span>Active</span>
          <button
            type="button"
            role="switch"
            aria-checked={!!frm.is_active}
            onClick={() => set("is_active", !frm.is_active)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              frm.is_active ? "bg-sky-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                frm.is_active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>

          <div className="flex gap-3">
            <button
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
