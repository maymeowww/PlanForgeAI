"use client";

// header
// slide bar
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarCheck2, Settings2, UserRound,
  CreditCard, AppWindow, Package, FileText, Table2, Images, ChevronRight ,Presentation
} from "lucide-react";

type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  chevron?: boolean;
};

type Group = {
  title?: string;
  items: Item[];
};

const MENU: Group[] = [
  {
    items: [
      { label: "Master Data",  href: "/transaction",  icon: CreditCard, chevron: true },
      { label: "Planning & Scheduling", href: "/apps",         icon: AppWindow,  chevron: true },
      { label: "Report",     href: "/products",     icon: Package,    chevron: true },
      { label: "Settings & Users",      href: "/invoice",      icon: FileText,   chevron: true },
      // { label: "Pricing Table",href: "/pricing",      icon: Table2,     chevron: true },
      // { label: "Image Gallery",href: "/gallery",      icon: Images,     chevron: true },
    ],
  },
  {
    title: "MAIN",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Planning",  href: "/planning",  icon: CalendarCheck2 },
      { label: "Production",  href: "/production",  icon: Presentation },
      { label: "Settings",  href: "/settings",  icon: Settings2 },
      { label: "Profile",   href: "/profile",   icon: UserRound },
    ],
  },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="h-svh w-[280px] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70
                 border-r border-slate-200 shadow-[0_10px_30px_-15px_rgba(2,6,23,0.08)]
                 sticky top-0"
    >
      {/* Brand */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" className="fill-current" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-xl font-bold tracking-tight text-slate-800">
              PlanForge<span className="text-indigo-600">AI</span>
            </div>

          </div>
        </Link>
      </div>

      {/* Menu */}
      <nav className="px-3 pb-6 overflow-y-auto">
        <ul className="space-y-6">
          {MENU.map((group, gi) => (
            <li key={gi}>
              {group.title && (
                <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-slate-400">
                  {group.title}
                </div>
              )}

              <ul className="space-y-1">
                {group.items.map((it) => {
                  const active =
                    pathname === it.href || pathname.startsWith(it.href + "/");
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className={[
                          "group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors",
                          active
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                        ].join(" ")}
                      >
                        <span className="flex items-center gap-3">
                          <it.icon
                            className={[
                              "h-5 w-5",
                              active
                                ? "text-indigo-600"
                                : "text-slate-400 group-hover:text-slate-500",
                            ].join(" ")}
                          />
                          <span className="text-[15px]">{it.label}</span>
                        </span>

                        {it.chevron && (
                          <ChevronRight
                            className={[
                              "h-4.5 w-4.5 transition",
                              active
                                ? "text-indigo-500"
                                : "text-slate-300 group-hover:text-slate-400",
                            ].join(" ")}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar ใหม่ */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8">
        {/* Topbar */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">App Area</h1>

          <form action="/auth/logout" method="post">
            <button className="rounded-lg bg-rose-500 text-white px-4 py-2 shadow-sm hover:bg-rose-600 transition">
              Logout
            </button>
          </form>
        </header>

        {/* Page content */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          {children}
        </section>
      </main>
    </div>
  );
}
