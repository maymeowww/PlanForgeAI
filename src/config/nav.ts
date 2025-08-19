import {
  LayoutDashboard,
  CalendarCheck2,
  Settings2,
  UserRound,
  AppWindow,
  Presentation,
} from "lucide-react";

export type Sub = { label: string; href: string };
export type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  sub?: Sub[];
};
export type Group = { title?: string; items: Item[] };

export const NAV: Group[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Planning", href: "/planning", icon: CalendarCheck2 },
      { label: "Production", href: "/production", icon: Presentation },
      { label: "Master", href: "/master", icon: AppWindow },
      { label: "User Management", href: "/user_management", icon: UserRound },
      { label: "Settings", href: "/settings", icon: Settings2 },
    ],
  },
];

export function getTitleFromPath(pathname: string): string {
  for (const g of NAV) {
    for (const it of g.items) {
      if (it.sub?.length) {
        const exact = it.sub.find((s) => s.href === pathname);
        if (exact) return exact.label;
        if (pathname === it.href || pathname.startsWith(it.href + "/")) return it.label;
      } else {
        if (pathname === it.href || pathname.startsWith(it.href + "/")) return it.label;
      }
    }
  }
  const seg = pathname.split("/").filter(Boolean).pop() || "App";
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}
