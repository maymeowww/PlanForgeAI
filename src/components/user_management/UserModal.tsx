import { useEffect, useMemo, useState } from "react";
import { Group, Permission, Screen, User } from "@/src/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (user: Partial<User> & { user_id?: number }) => void;
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
  const title = editing ? "Edit User" : "New User";

  useEffect(() => {
    if (editing) setFrm(editing);
    else
      setFrm({
        is_active: true,
        user_group_id: groups[0]?.group_id ?? null,
      });
  }, [open, editing, groups]);

  const avatar = useMemo(() => {
    return frm.profile_image_url || `https://i.pravatar.cc/100?u=${frm.username ?? "u"}`;
  }, [frm.profile_image_url, frm.username]);

  if (!open) return null;

  const set = (k: keyof User, v: any) => setFrm((p) => ({ ...p, [k]: v }));

  return (
    <div className="modal" style={{ display: "flex" }}>
      <div className="box">
        <h3>{title}</h3>
        <div className="row" style={{ gap: 12 }}>
          <img className="avatar" src={avatar} alt="" />
          <input
            className="full"
            placeholder="/static/images/users/xxx.png"
            value={frm.profile_image_url ?? ""}
            onChange={(e) => set("profile_image_url", e.target.value)}
          />
        </div>

        <label>
          Employee Code
          <input
            className="full"
            placeholder="EMP001"
            value={frm.employee_code ?? ""}
            onChange={(e) => set("employee_code", e.target.value)}
          />
        </label>

        <label>
          Username
          <input
            className="full"
            placeholder="username"
            value={frm.username ?? ""}
            onChange={(e) => set("username", e.target.value)}
          />
        </label>

        <label>
          Full Name
          <input
            className="full"
            placeholder="Full Name"
            value={frm.full_name ?? ""}
            onChange={(e) => set("full_name", e.target.value)}
          />
        </label>

        <label>
          Email
          <input
            className="full"
            placeholder="email@example.com"
            value={frm.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
          />
        </label>

        <label>
          Department
          <input
            className="full"
            placeholder="Planning / Production / QA ..."
            value={frm.department ?? ""}
            onChange={(e) => set("department", e.target.value)}
          />
        </label>

        <label>
          Group
          <select
            className="full"
            value={frm.user_group_id ?? ""}
            onChange={(e) => set("user_group_id", Number(e.target.value))}
          >
            {groups.map((g) => (
              <option key={g.group_id} value={g.group_id}>
                {g.group_name}
              </option>
            ))}
          </select>
        </label>

        <label>
          New Password (จะถูก hash ฝั่ง API)
          <input className="full" type="password" placeholder="(optional for update)" />
        </label>

        <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
          <label className="row" style={{ gap: 6 }}>
            <input
              type="checkbox"
              checked={!!frm.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
            />
            Active
          </label>
          <div className="row">
            <button
              className="btn"
              onClick={() => {
                if (!frm.username?.trim()) {
                  alert("Username ห้ามว่าง");
                  return;
                }
                onSave(frm);
              }}
            >
              Save
            </button>
            <button className="btn warn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
