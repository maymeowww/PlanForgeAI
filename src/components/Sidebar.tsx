// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard, Settings2, UserRound,
//   CreditCard, AppWindow, Package, FileText,
//   Table2, Images, ChevronRight, LogIn, Bug, Files
// } from "lucide-react";
// import { cn } from "@/src/lib/utils"; // ถ้ายังไม่มี util cn ให้ดูโน้ตด้านล่าง

// type Item = {
//   label: string;
//   href: string;
//   icon: React.ComponentType<{ className?: string }>;
//   trailingChevron?: boolean;
// };

// type Group = {
//   title?: string; // ถ้าไม่มีจะเป็นหัวข้อหลัก
//   items: Item[];
// };

// const MENU: Group[] = [
//   {
//     items: [
//       { label: "Transaction",  href: "/transaction",  icon: CreditCard, trailingChevron: true },
//       { label: "Applications", href: "/apps",         icon: AppWindow,  trailingChevron: true },
//       { label: "Products",     href: "/products",     icon: Package,    trailingChevron: true },
//       { label: "Invoice",      href: "/invoice",      icon: FileText,   trailingChevron: true },
//       { label: "Pricing Table",href: "/pricing",      icon: Table2,     trailingChevron: true },
//       { label: "Image Gallery",href: "/gallery",      icon: Images,     trailingChevron: true },
//     ],
//   },
//   {
//     title: "MISC PAGES",
//     items: [
//       { label: "Auth Pages",   href: "/auth",   icon: LogIn,    trailingChevron: true },
//       { label: "Error Pages",  href: "/errors", icon: Bug,      trailingChevron: true },
//       { label: "Other Pages",  href: "/others", icon: Files,    trailingChevron: true },
//     ],
//   },
//   {
//     title: "COMPONENTS",
//     items: [
//       { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
//       { label: "Settings",  href: "/settings",  icon: Settings2 },
//       { label: "Profile",   href: "/profile",   icon: UserRound },
//     ],
//   },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();

//   return (
//     <aside
//       className="h-svh w-[280px] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70
//                  border-r border-slate-200 shadow-[0_10px_30px_-15px_rgba(2,6,23,0.06)]
//                  sticky top-0"
//     >
//       {/* Brand */}
//       <div className="px-5 pt-5 pb-4">
//         <Link href="/" className="flex items-center gap-3">
//           {/* โลโก้เบา ๆ */}
//           <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center">
//             {/* โลโก้เล็กแบบรูปทรง */}
//             <svg viewBox="0 0 24 24" className="h-5 w-5">
//               <path
//                 d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
//                 className="fill-current"
//               />
//             </svg>
//           </div>
//           <div className="leading-tight">
//             <div className="text-xl font-bold tracking-tight text-slate-800">
//               dash<span className="text-indigo-600">lite</span>
//             </div>
//             <div className="text-[10px] font-medium text-slate-400">
//               REACT
//             </div>
//           </div>
//         </Link>
//       </div>

//       <nav className="px-3 pb-6 overflow-y-auto">
//         <ul className="space-y-6">
//           {MENU.map((group, gi) => (
//             <li key={gi}>
//               {group.title && (
//                 <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-slate-400">
//                   {group.title}
//                 </div>
//               )}

//               <ul className="space-y-1">
//                 {group.items.map((it) => {
//                   const active =
//                     pathname === it.href || pathname.startsWith(it.href + "/");
//                   return (
//                     <li key={it.href}>
//                       <Link
//                         href={it.href}
//                         className={cn(
//                           "group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5",
//                           "transition-colors",
//                           active
//                             ? "bg-indigo-50 text-indigo-700"
//                             : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//                         )}
//                       >
//                         <span className="flex items-center gap-3">
//                           <it.icon
//                             className={cn(
//                               "h-5 w-5",
//                               active
//                                 ? "text-indigo-600"
//                                 : "text-slate-400 group-hover:text-slate-500"
//                             )}
//                           />
//                           <span className="text-[15px]">{it.label}</span>
//                         </span>

//                         {it.trailingChevron && (
//                           <ChevronRight
//                             className={cn(
//                               "h-4.5 w-4.5 transition",
//                               active
//                                 ? "text-indigo-500"
//                                 : "text-slate-300 group-hover:text-slate-400"
//                             )}
//                           />
//                         )}
//                       </Link>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </li>
//           ))}
//         </ul>
//       </nav>
//     </aside>
//   );
// }

// /**
//  * NOTE: util cn สำหรับรวม class (ถ้ายังไม่มี)
//  * สร้างไฟล์ที่: src/lib/utils.ts
//  * export function cn(...a: (string | undefined | false)[]) {
//  *   return a.filter(Boolean).join(" ");
//  * }
//  */
