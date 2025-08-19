"use client"

import { useEffect, useMemo, useRef, useState } from "react";
import Segment from "src/components/user_management/Segment";
import UserModal from "src/components/user_management/UserModal";
import UserTable from "src/components/user_management/UserTable";
import GroupsView from "src/components/user_management/GroupsView";
// import { downloadJSON } from "./utils/download";
import { Group, Permission, Payload, Screen, User } from "src/types";
import * as mock from "src/data/mock";
import ImportButton from "@/src/components/shared/button/ImportButton";
import ExportButton from "@/src/components/shared/button/ExportButton";
import clsx from "clsx";

type Tab = "users" | "groups";

function nextId<T extends Record<string, any>>(arr: T[], key: keyof T) {
  const max = arr.reduce((m, x) => Math.max(m, Number(x[key] ?? 0)), 0);
  return (max || 0) + 1;
}

export default function UserManagementPage() {
  const [tab, setTab] = useState<Tab>("users");

  const [users, setUsers] = useState<User[]>(mock.users);
  const [groups, setGroups] = useState<Group[]>(mock.groups);
  const [screens, setScreens] = useState<Screen[]>(mock.screens);
  const [permissions, setPermissions] = useState<Permission[]>(mock.permissions);

  const [q, setQ] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("");
  const [filterActive, setFilterActive] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const [currentGroupId, setCurrentGroupId] = useState<number | null>(
    groups[0]?.group_id ?? null
  );

  const fileRef = useRef<HTMLInputElement>(null);

  const filteredUsers = useMemo(() => {
    const qtext = q.trim().toLowerCase();
    return users.filter((u) => {
      const text = [u.username, u.full_name, u.email, u.department]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const okQ = !qtext || text.includes(qtext);
      const okG = !filterGroup || String(u.user_group_id ?? "") === filterGroup;
      const okA = !filterActive || String(!!u.is_active) === filterActive;
      return okQ && okG && okA;
    });
  }, [users, q, filterGroup, filterActive]);

  function openNewUser() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEditUser(u: User) {
    setEditing(u);
    setModalOpen(true);
  }
  function saveUser(frm: Partial<User>) {
    if (editing) {
      setUsers((prev) =>
        prev.map((x) =>
          x.user_id === editing.user_id
            ? {
                ...x,
                ...frm,
                updated_at: new Date().toISOString(),
              }
            : x
        )
      );
    } else {
      const id = nextId(users, "user_id");
      const now = new Date().toISOString();
      setUsers((prev) => [
        ...prev,
        {
          user_id: id,
          employee_code: frm.employee_code ?? "",
          username: frm.username!,
          password_hash: frm.password_hash ?? null,
          email: frm.email ?? "",
          full_name: frm.full_name ?? "",
          user_group_id: (frm.user_group_id as number) ?? groups[0]?.group_id ?? null,
          profile_image_url: frm.profile_image_url ?? "",
          department: frm.department ?? "",
          is_active: !!frm.is_active,
          created_at: now,
          updated_at: now,
        },
      ]);
    }
    setModalOpen(false);
  }

  function toggleUserActive(user_id: number) {
    setUsers((prev) =>
      prev.map((u) => (u.user_id === user_id ? { ...u, is_active: !u.is_active } : u))
    );
  }
  function changeUserGroup(user_id: number, group_id: number) {
    setUsers((prev) =>
      prev.map((u) => (u.user_id === user_id ? { ...u, user_group_id: group_id } : u))
    );
  }

  // Groups / Members
  function addGroup() {
    const id = nextId(groups, "group_id");
    setGroups((prev) => [
      ...prev,
      { group_id: id, group_name: `New Group ${id}`, description: "", is_active: true },
    ]);
    setCurrentGroupId(id);
  }
  function toggleGroupActive(id: number) {
    setGroups((prev) =>
      prev.map((g) => (g.group_id === id ? { ...g, is_active: !g.is_active } : g))
    );
  }
  function addMember(uid: number, gid: number) {
    setUsers((prev) => prev.map((u) => (u.user_id === uid ? { ...u, user_group_id: gid } : u)));
  }
  function removeMember(uid: number) {
    setUsers((prev) => prev.map((u) => (u.user_id === uid ? { ...u, user_group_id: null } : u)));
  }

  // Permissions
  function togglePerm(
    gid: number,
    code: string,
    key: keyof Permission,
    value: boolean
  ) {
    setPermissions((prev) => {
      const idx = prev.findIndex((p) => p.group_id === gid && p.screen_code === code);
      if (idx === -1) {
        const permission_id = nextId(prev, "permission_id");
        return [
          ...prev,
          {
            permission_id,
            group_id: gid,
            screen_code: code,
            can_view: false,
            can_add: false,
            can_edit: false,
            can_delete: false,
            [key]: value,
          } as Permission,
        ];
      }
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  }

  function grantAll(gid: number, flag: boolean) {
    setPermissions((prev) => {
      const copy = [...prev];
      screens.forEach((s) => {
        const idx = copy.findIndex((p) => p.group_id === gid && p.screen_code === s.code);
        if (idx === -1) {
          copy.push({
            permission_id: nextId(copy, "permission_id"),
            group_id: gid,
            screen_code: s.code,
            can_view: flag,
            can_add: flag,
            can_edit: flag,
            can_delete: flag,
          });
        } else {
          copy[idx] = {
            ...copy[idx],
            can_view: flag,
            can_add: flag,
            can_edit: flag,
            can_delete: flag,
          };
        }
      });
      return copy;
    });
  }

  // Import / Export
  function exportJSON() {
    const payload: Payload = { users, groups, permissions, screens };
    // downloadJSON(payload);
  }
  function importJSON(file: File) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const data = JSON.parse(String(fr.result)) as Partial<Payload>;
        if (Array.isArray(data.users)) setUsers(data.users as User[]);
        if (Array.isArray(data.groups)) setGroups(data.groups as Group[]);
        if (Array.isArray(data.permissions)) setPermissions(data.permissions as Permission[]);
        if (Array.isArray(data.screens)) setScreens(data.screens as Screen[]);
        alert("Imported!");
      } catch {
        alert("Invalid JSON");
      }
    };
    fr.readAsText(file);
  }

  const [hasShadow, setHasShadow] = useState(false); // เงา header เมื่อสกอลล์
  
  useEffect(() => {
    const onScroll = () => setHasShadow(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <style>{`
        :root {
          --bg: #f8fafc;
          --panel: #ffffff;
          --text: #0f172a;
          --muted: #64748b;
          --accent: #0284c7;
          --ok: #16a34a;
          --warn: #d97706;
          --bad: #dc2626;
          --r: 14px;
          --bd: #e2e8f0;
          --sh: 0 8px 24px rgba(2, 6, 23, 0.06);
        }
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; }
        body {
          margin: 0;
          background: var(--bg);
          color: var(--text);
          font: 14px/1.5 Inter, ui-sans-serif, system-ui, "Segoe UI", Roboto;
        }
        h1 { margin: 0 0 6px; font-weight: 900; }
        .row { display: flex; gap: 10px; align-items: center; }
        .right { margin-left: auto; }
        .btn {
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid var(--bd);
          background: #f1f5f9;
          color: #0f172a;
          font-weight: 700;
        }
        .btn:hover { background: #e2e8f0; }
        .btn.ok { background: #d1fae5; border-color: #86efac; }
        .btn.warn { background: #fee2e2; border-color: #fecaca; }
        .btn.ghost { background: #fff; }
        input, select {
          background: #fff;
          border: 1px solid var(--bd);
          color: var(--text);
          border-radius: 8px;
          padding: 8px;
        }
        input[type="search"] { min-width: 260px; }
        input[type="checkbox"] { transform: scale(1.1); }
        .badge { display: inline-flex; gap: 6px; align-items: center;
          padding: 4px 8px; border-radius: 999px; font-size: 12px; border: 1px solid var(--bd);
        }
        .badge.ok { background: #dcfce7; color: var(--ok); border-color: #86efac; }
        .badge.bad { background: #fee2e2; color: var(--bad); border-color: #fecaca; }
        .card, .box {
          background: var(--panel);
          border: 1px solid var(--bd);
          border-radius: var(--r);
          box-shadow: var(--sh);
          padding: 16px;
        }
        .tbl { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
        .tbl th { font-size: 12px; color: var(--muted); text-align: left; font-weight: 700; }
        .tbl td {
          background: #fff;
          border: 1px solid var(--bd);
          padding: 8px 10px; font-size: 13px; vertical-align: middle;
        }
        .tbl tr td:first-child { border-radius: 12px 0 0 12px; }
        .tbl tr td:last-child { border-radius: 0 12px 12px 0; }
        .tbl .actions .btn { padding: 6px 8px; }
        .avatar { width: 30px; height: 30px; border-radius: 50%; object-fit: cover;
          border: 1px solid var(--bd); margin-right: 8px; }
        .u-cell { display: flex; align-items: center; gap: 8px; }
        .side { display: grid; grid-template-columns: 280px 1fr; gap: 16px; }
        @media (max-width: 1000px) { .side { grid-template-columns: 1fr; } }
        .group-row { display: flex; align-items: center; justify-content: space-between;
          gap: 8px; padding: 10px; border-radius: 10px; border: 1px solid var(--bd);
          background: #fff; cursor: pointer; }
        .group-row.active { outline: 2px solid var(--accent); }
        .group-title { font-weight: 800; }
        .small { font-size: 12px; color: var(--muted); }
        .switch { display: inline-flex; gap: 6px; align-items: center; }
        .member-chip { display: inline-flex; gap: 6px; align-items: center; background: #f8fafc;
          border: 1px solid var(--bd); padding: 4px 8px; border-radius: 999px; margin: 3px 6px 3px 0; }
        .member-chip .x { background: none; border: none; color: var(--muted); cursor: pointer; }
        .member-chip .x:hover { color: #0f172a; }
        .perm-grid { display: grid; grid-template-columns: 1.2fr repeat(4, 110px);
          gap: 8px; align-items: center; }
        .perm-head { font-size: 12px; color: var(--muted); }
        .perm-row { display: contents; }
        .perm-cell { background: #fff; border: 1px solid var(--bd);
          padding: 8px 10px; border-radius: 10px; }
        .modal { position: fixed; inset: 0; background: rgba(2, 6, 23, .2); display: none;
          align-items: center; justify-content: center; padding: 16px; }
        .modal .box { background: #fff; border: 1px solid var(--bd);
          border-radius: 12px; padding: 16px; min-width: 360px; max-width: 560px; }
        .modal h3 { margin: 0 0 8px; }
        label { display: block; font-size: 12px; color: var(--muted); margin-top: 8px; }
        .full { width: 100%; }
        .segment { display: inline-flex; background: #fff; border: 1px solid var(--bd);
          border-radius: 999px; overflow: hidden; }
        .segment button { padding: 8px 14px; border: none; background: transparent;
          color: #0f172a; cursor: pointer; }
        .segment button.active { background: #e2e8f0; }
        .hidden { display: none; }
      `}</style>
      {/* Header */}
       <header
        className={clsx(
          "py-2 sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70",
          hasShadow ? "shadow-sm" : "shadow-none"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold leading-tight">⚙️ User Management</h1>
          </div>

          {/* Action Icons */}
          {/* <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  className={iconBtn}
                  title="Edit"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className={iconBtn}
                  title="Export JSON"
                  onClick={() => downloadJSON("project_settings.json", payload)}
                  aria-label="Export JSON"
                >
                  <Download className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  className={"inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"}
                  title="Save"
                  onClick={handleSave}
                  aria-label="Save"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  className={"inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"}
                  title="Cancel"
                  onClick={handleCancel}
                  aria-label="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div> */}
        </div>
        
        <div
          className="max-w-6xl mx-auto px-3 md:px-6 pb-2 overflow-x-auto"
        >
          <div
            className="flex flex-wrap justify-between items-center gap-4"
          >
            {/* LEFT: Tabs / Segment */}
            <div>
              <Segment value={tab} onChange={setTab} />
            </div>
          </div>
        </div>            

        {/* ======= Top Menu ======= */}
        
        {/* <nav className="max-w-6xl mx-auto px-3 md:px-6 pb-2 overflow-x-auto">          
          <ul className="flex items-center gap-1 text-[13px]">
            {[
              { href: "#cal", label: "Calendar / Holidays" },
              { href: "#shifts", label: "Shifts & Breaks" },
              { href: "#ot", label: "OT / Setup / Buffer" },
              { href: "#constraints", label: "Constraints" },
              { href: "#maint", label: "Maintenance" },
            ].map((it) => (
              
              <li key={it.href}>
                <a
                  href={it.href}
                  className="inline-flex whitespace-nowrap items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-100"
                >
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </nav> */}
      </header>

      {/* <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importJSON(f);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              />
              <ImportButton
                label="Import CSV/Excel"
                onFilesSelected={(files) => {
                  console.log("planning import:", files[0]?.name);
                }}
              />
              <ExportButton
                label="Export JSON"
                filename="users.json"
                data={users}
                type="json"
                className="ml-2"
              />
      </div> */}

      {/* Tab: Users */}
      {tab === "users" && (
        <section className="card" style={{ marginTop: 14 }}>
          <div className="row" style={{ marginBottom: 8, flexWrap: "wrap" }}>
            <input
              type="search"
              placeholder="ค้นหา username / ชื่อ / อีเมล / แผนก"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
              <option value="">ทุกกลุ่ม</option>
              {groups.map((g) => (
                <option key={g.group_id} value={String(g.group_id)}>
                  {g.group_name}
                </option>
              ))}
            </select>
            <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
              <option value="">ทุกสถานะ</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button className="btn" onClick={openNewUser}>
                + New User
              </button>
          </div>

          <UserTable
            users={filteredUsers}
            groups={groups}
            onEdit={openEditUser}
            onToggleActive={toggleUserActive}
            onChangeGroup={changeUserGroup}
          />
        </section>
      )}

      {/* Tab: Groups */}
      {tab === "groups" && (
        <section style={{ marginTop: 14 }}>
          <div className="card">
            <h2>Groups & Permissions</h2>
            <div className="help">เลือกกลุ่มเพื่อจัดการสมาชิกและสิทธิ์ต่อหน้าระบบ</div>
            <GroupsView
              groups={groups}
              users={users}
              screens={screens}
              permissions={permissions}
              currentGroupId={currentGroupId}
              setCurrentGroupId={setCurrentGroupId}
              onToggleGroupActive={toggleGroupActive}
              onAddGroup={addGroup}
              onAddMember={addMember}
              onRemoveMember={removeMember}
              onGrantAll={grantAll}
              onTogglePerm={togglePerm}
            />
          </div>
        </section>
      )}

      {/* User modal */}
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={saveUser}
        groups={groups}
        editing={editing ?? undefined}
      />
    </div>
  );
}
