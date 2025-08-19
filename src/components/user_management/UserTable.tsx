import { Group, Permission, Screen, User } from "@/src/types";

type Props = {
  users: User[];
  groups: Group[];
  onEdit: (u: User) => void;
  onToggleActive: (user_id: number) => void;
  onChangeGroup: (user_id: number, group_id: number) => void;
};

const badge = (b: boolean) =>
  b ? <span className="badge ok">Active</span> : <span className="badge bad">Inactive</span>;

export default function UserTable({
  users,
  groups,
  onEdit,
  onToggleActive,
  onChangeGroup,
}: Props) {
  return (
    <div style={{ overflow: "auto" }}>
      <table className="tbl">
        <thead>
          <tr>
            <th>User</th>
            <th>Department</th>
            <th>Email</th>
            <th>Group</th>
            <th>Status</th>
            <th style={{ width: 160 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id}>
              <td>
                <div className="u-cell">
                  <img
                    className="avatar"
                    src={u.profile_image_url || `https://i.pravatar.cc/100?u=${u.username}`}
                    alt=""
                  />
                  <div>
                    <div>
                      <b>{u.username}</b> — {u.full_name || ""}
                    </div>
                    <div className="sub">{u.employee_code || ""}</div>
                  </div>
                </div>
              </td>
              <td>{u.department || "-"}</td>
              <td>{u.email || "-"}</td>
              <td>
                <select
                  value={u.user_group_id ?? ""}
                  onChange={(e) => onChangeGroup(u.user_id, Number(e.target.value))}
                >
                  {groups.map((g) => (
                    <option key={g.group_id} value={g.group_id}>
                      {g.group_name}
                    </option>
                  ))}
                </select>
              </td>
              <td>{badge(!!u.is_active)}</td>
              <td className="actions">
                <button className="btn" onClick={() => onEdit(u)}>
                  Edit
                </button>
                <button className="btn warn" onClick={() => onToggleActive(u.user_id)}>
                  {u.is_active ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", opacity: 0.6, padding: 16 }}>
                No users
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
