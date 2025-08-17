// components/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// components/Header.tsx
// ...
const tabs = [
  { href: "/",            label: "Dashboard" },
  { href: "/planning",    label: "Planning" },
  { href: "/production",  label: "Production" },
  { href: "/quality",     label: "Quality" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/analytics",   label: "Analytics" },
  { href: "/user-manage", label: "User Manage" }, // ← เพิ่มเมนูใหม่
];
// ...


export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700";

  const closeMenu = () => setOpen(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex justify-between items-center h-16">
          {/* Brand + Desktop nav */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary flex items-center">
              🏭 <span className="ml-2">PlanForgeAI</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {tabs.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`px-1 pb-4 text-sm font-medium ${isActive(t.href)}`}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side + Hamburger */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-danger/10 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-danger rounded-full" />
              <span className="text-sm text-danger font-medium">2 Alarms</span>
            </div>

            {/* Hamburger button (mobile only) */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-controls="mobile-menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {/* icon */}
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {open ? (
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
                )}
              </svg>
              <span className="sr-only">Toggle navigation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden border-t border-gray-200 transition-[max-height] duration-300 ease-in-out ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="px-4 py-3 space-y-1 bg-white">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              onClick={closeMenu}
              className={`block rounded-md px-3 py-2 text-base font-medium ${
                pathname === t.href ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t.label}
            </Link>
          ))}

          {/* Alarms badge (mobile) */}
          <div className="mt-2 flex items-center space-x-2 bg-danger/10 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-danger rounded-full" />
            <span className="text-sm text-danger font-medium">2 Alarms</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
