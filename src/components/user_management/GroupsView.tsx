import { useMemo } from "react";
import { Group, Permission, Screen, User } from "@/src/types";

type Props = {
  groups: Group[];
  users: User[];
  screens: Screen[];
  permissions: Permission[];
  currentGroupId: number | null;
  setCurrentGroupId: (id: number) => void;
  onToggleGroupActive: (id: number) => void;
  onAddGroup: () => void;
  onAddMember: (uid: number, gid: number) => void;
  onRemoveMember: (uid: number) => void;
  onGrantAll: (gid: number, flag: boolean) => void;
  onTogglePerm: (gid: number, code: string, key: keyof Permission, value: boolean) => void;
};

export default function GroupsView({
  groups,
  users,
  screens,
  permissions,
  currentGroupId,
  setCurrentGroupId,
  onToggleGroupActive,
  onAddGroup,
  onAddMember,
  onRemoveMember,
  onGrantAll,
  onTogglePerm,
}: Props) {
  const g = useMemo(
    () => groups.find((x) => x.group_id === currentGroupId) || null,
    [groups, currentGroupId]
  );
  const members = useMemo(
    () => users.filter((u) => u.user_group_id === g?.group_id),
    [users, g]
  );
  const candidates = useMemo(
    () => users.filter((u) => u.user_group_id !== g?.group_id),
    [users, g]
  );
  const memberCount = (gid: number) => users.filter((u) => u.user_group_id === gid).length;

  return (
    <div className="side">
      {/* Left: Group list */}
      <div className="box">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <b>Groups</b>
          <div className="row">
            <button className="btn ghost" onClick={onAddGroup}>
              + New Group
            </button>
          </div>
        </div>
        <div id="groupList">
          {groups.map((grp) => {
            const active = grp.group_id === g?.group_id;
            return (
              <div
                key={grp.group_id}
                className={`group-row ${active ? "active" : ""}`}
                onClick={() => setCurrentGroupId(grp.group_id)}
              >
                <div>
                  <div>
                    <b>{grp.group_name}</b>{" "}
                    <span className="small">({memberCount(grp.group_id)})</span>
                  </div>
                  <div className="small">{grp.description || ""}</div>
                </div>
                <div>
                  {grp.is_active ? (
                    <span className="badge ok">Active</span>
                  ) : (
                    <span className="badge bad">Inactive</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Group detail */}
      <div className="box">
        <div className="row" style={{ justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div className="group-title">{g?.group_name ?? "Select a group"}</div>
            <div className="small">{g?.description ?? "—"}</div>
          </div>
          <div className="switch">
            <span className="small">Active</span>
            <input
              type="checkbox"
              checked={!!g?.is_active}
              onChange={() => g && onToggleGroupActive(g.group_id)}
            />
          </div>
        </div>

        <hr />
        <div>
          <b>Members</b>
          <div id="memberChips" style={{ marginTop: 6 }}>
            {members.map((u) => (
              <span key={u.user_id} className="member-chip">
                <img
                  src={u.profile_image_url || `https://i.pravatar.cc/100?u=${u.username}`}
                  className="avatar"
                  style={{ width: 22, height: 22 }}
                />
                {u.username}
                <button className="x" onClick={() => onRemoveMember(u.user_id)}>
                  ✕
                </button>
              </span>
            ))}
            {members.length === 0 && (
              <span className="small" style={{ opacity: 0.7 }}>
                (no members)
              </span>
            )}
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <select
              id="addMemberSelect"
              style={{ minWidth: 220 }}
              onChange={(e) => {
                const uid = Number(e.target.value);
                if (uid && g) onAddMember(uid, g.group_id);
              }}
              value=""
            >
              <option value="">— Select user —</option>
              {candidates.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.username} — {u.full_name || ""}
                </option>
              ))}
            </select>
            <button
              className="btn"
              onClick={() => {
                const el = document.getElementById("addMemberSelect") as HTMLSelectElement;
                const uid = Number(el.value);
                if (uid && g) onAddMember(uid, g.group_id);
              }}
            >
              Add to Group
            </button>
          </div>
        </div>

        <hr />
        <div>
          <b>Permissions</b>
          <div className="perm-actions">
            <button className="btn ghost" onClick={() => g && onGrantAll(g.group_id, true)}>
              Grant ALL
            </button>
            <button className="btn ghost" onClick={() => g && onGrantAll(g.group_id, false)}>
              Revoke ALL
            </button>
          </div>

          <div className="perm-grid" style={{ marginTop: 8 }}>
            <div className="perm-head">Screen</div>
            <div className="perm-head">View</div>
            <div className="perm-head">Add</div>
            <div className="perm-head">Edit</div>
            <div className="perm-head">Delete</div>
          </div>

          <div id="permRows" className="perm-grid" style={{ marginTop: 4 }}>
            {g ? (
              screens.map((s) => {
                const p =
                  permissions.find(
                    (x) => x.group_id === g.group_id && x.screen_code === s.code
                  ) ||
                  ({
                    permission_id: -1,
                    group_id: g.group_id,
                    screen_code: s.code,
                    can_view: false,
                    can_add: false,
                    can_edit: false,
                    can_delete: false,
                  } as Permission);

                const cell = (key: keyof Permission) => (
                  <div className="perm-cell" style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={!!p[key]}
                      onChange={(e) => onTogglePerm(g.group_id, s.code, key, e.target.checked)}
                    />
                  </div>
                );

                return (
                  <div key={s.code} className="perm-row">
                    <div className="perm-cell">
                      <b>{s.code}</b> — <span className="small">{s.name}</span>
                    </div>
                    {cell("can_view")}
                    {cell("can_add")}
                    {cell("can_edit")}
                    {cell("can_delete")}
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: "1 / -1", opacity: 0.7, padding: 8 }}>
                Select a group first
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
