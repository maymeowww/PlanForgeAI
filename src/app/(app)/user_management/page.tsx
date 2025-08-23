"use client"

import { useEffect, useMemo, useRef, useState } from "react";
import Segment from "@/src/components/shared/button/Segment";

// import { downloadJSON } from "./utils/download";
import { Group, Permission, Payload, Screen, User } from "src/types";
import * as mock from "src/data/mock";
import ImportButton from "@/src/components/shared/button/ImportButton";
import ExportButton from "@/src/components/shared/button/ExportButton";
import clsx from "clsx";
import IconButton from "@/src/components/shared/button/IconButton";
import { Plus } from "lucide-react";
import Dropdown from "@/src/components/shared/input/Dropdown";
import GroupsView from "./components/GroupsView";
import UserModal from "./components/UserModal";
import UserTable from "./components/UserTable";
import Table from "@/src/components/shared/Table";
import SearchInput from "@/src/components/shared/input/SearchInput";

const groups: Group[] = [
  { group_id: 1, group_name: "Admin" },
  { group_id: 2, group_name: "Staff" },
  { group_id: 3, group_name: "Guest" },
];

function nextId<T extends Record<string, any>>(arr: T[], key: keyof T) {
  const max = arr.reduce((m, x) => Math.max(m, Number(x[key] ?? 0)), 0);
  return (max || 0) + 1;
}

export default function UserManagementPage() {
  
  const segmentOptions = [
    { label: "Users", value: "users" },
    { label: "Groups & Permissions", value: "groups" },
  ] as const;

  type ViewMode = typeof segmentOptions[number]["value"];
  
  const statusOptions = [
    { label: "ทุกสถานะ", value: "" },
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ];

  const [tab, setTab] = useState<ViewMode>("users");
  const [users, setUsers] = useState<User[]>(mock.users);
  const [groups, setGroups] = useState<Group[]>(mock.groups);
  const [screens, setScreens] = useState<Screen[]>(mock.screens);
  const [permissions, setPermissions] = useState<Permission[]>(mock.permissions);

  const [q, setQ] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("");
  const [filterActive, setFilterActive] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const groupOptions = groups.map((g) => ({
    label: g.group_name,
    value: String(g.group_id),
  }));

  const [currentGroupId, setCurrentGroupId] = useState<number | null>(
    groups[0]?.group_id ?? null
  );

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

  const pageSize = 10;
const [pageUsers, setPageUsers] = useState(1);

const pagedUsers = useMemo(() => {
  const start = (pageUsers - 1) * pageSize;
  return filteredUsers.slice(start, start + pageSize);
}, [filteredUsers, pageUsers]);

const userColumns = [
  {
    key: "employee_code",
    label: "รหัสพนักงาน",
  },
  {
    key: "username",
    label: "Username",
  },
  {
    key: "full_name",
    label: "ชื่อ-นามสกุล",
  },
  {
    key: "email",
    label: "Email",
  },
  {
    key: "department",
    label: "แผนก",
  },
  {
    key: "is_active",
    label: "สถานะ",
    render: (u: User) => (
      <span
        className={clsx(
          "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
          u.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        )}
      >
        {u.is_active ? "Active" : "Inactive"}
      </span>
    ),
  },
];

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

  const [hasShadow, setHasShadow] = useState(false); 
  
  useEffect(() => {
    const onScroll = () => setHasShadow(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header
        className={clsx(
          "py-2 sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 overflow-hidden",
          hasShadow ? "shadow-sm" : "shadow-none"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 py-2 pb-1 flex items-center justify-between gap-3 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold leading-tight">User Management</h1>
          <div className="flex items-center gap-2 min-w-0">
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
            /> 
            
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-3 md:px-6 pb-2 overflow-x-auto">
          <Segment<ViewMode> value={tab} onChange={setTab} options={segmentOptions} />
        </div>
      </header>
             
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Tab: Users */}
        {tab === "users" && (
          <section className=" bg-white border rounded-2xl shadow-sm p-4">
            {/* filter row */}
           <div className="mb-3 flex flex-wrap items-center gap-3">             
              <SearchInput
                value={q}
                onChange={setQ}
                placeholder="Search "
              />
              <Dropdown
                value={filterGroup}
                onChange={setFilterGroup}
                options={groupOptions}
                placeholder="All Groups"
                className="h-10"
              />
              <Dropdown
                value={filterActive}
                onChange={setFilterActive}
                options={statusOptions}
                placeholder="All Status"
                className="h-10"
              />
              <div className="ml-auto">
                <IconButton variant="ok" label="New User" onClick={openNewUser}>
                  <Plus size={18} />
                </IconButton>
              </div>    
            </div>

            {/* table */}      
            <Table
              columns={userColumns}
              data={pagedUsers}
              currentPage={pageUsers}
              pageSize={pageSize}
              totalItems={filteredUsers.length}
              onPageChange={setPageUsers}
              openOrderModal={(id) => openEditUser(users.find((u) => u.user_id === id)!)}
              delOrder={(id) =>
                setUsers((prev) => prev.filter((u) => u.user_id !== id))
              }
            />

          </section>
        )}

        {/* Tab: Groups */}
        {tab === "groups" && (
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
        )}        
      </div>
      
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