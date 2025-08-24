"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/src/config/nav";
import { ChevronsLeft } from "lucide-react";
import UserMenu from "@/src/components/layout/UserMenu";

export default function Sidebar({
  collapsed,
  onToggle,
  user,
}: {
  collapsed: boolean;
  onToggle: () => void;
  user: { full_name?: string | null; email?: string | null };
}) {
  const pathname = usePathname();

  return (
    <aside
      className={[
        "h-svh sticky top-0 left-0 flex-none flex flex-col",
        "bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-slate-900/90", // ✅ รองรับ dark
        "border-r border-slate-200 dark:border-slate-700", // ✅ รองรับ dark
        "shadow-[0_10px_30px_-15px_rgba(2,6,23,0.08)]",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[80px]" : "w-[280px]",
      ].join(" ")}
    >
      {/* TOP: Logo + Toggle */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <button type="button" onClick={onToggle} className="flex items-center gap-3 focus:outline-none">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center dark:bg-indigo-900/40 dark:text-indigo-300">
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" className="fill-current" />
            </svg>
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                PlanForge<span className="text-indigo-600">AI</span>
              </div>
            </div>
          )}
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="ml-2 hidden lg:inline-flex p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? null : <ChevronsLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 pb-6">
        <ul className="space-y-6">
          {NAV.map((group, gi) => (
            <li key={gi}>
              {!collapsed && group.title && (
                <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500">
                  {group.title}
                </div>
              )}
              <ul className="space-y-1">
                {group.items.map((it) => {
                  const active =
                    pathname === it.href ||
                    (it.href !== "/" && pathname.startsWith(it.href + "/"));
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        aria-current={active ? "page" : undefined}
                        className={[
                          "group flex items-center rounded-xl px-3 py-2.5 transition-colors",
                          active
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                          collapsed ? "justify-center" : "gap-3",
                        ].join(" ")}
                      >
                        <it.icon
                          className={[
                            "h-5 w-5",
                            active
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300",
                          ].join(" ")}
                        />
                        {!collapsed && <span className="text-[15px]">{it.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* UserMenu */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <UserMenu user={user} compact={collapsed} />
      </div>
    </aside>
  );
}
