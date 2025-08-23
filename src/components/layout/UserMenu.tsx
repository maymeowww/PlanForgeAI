"use client";

import NextLink from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";
import { Settings, HelpCircle, LogOut } from "lucide-react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

type Props = { 
  user: {
    full_name?: string | null;
    email?: string | null;
  };
  compact?: boolean 
};

export default function UserMenu({ user, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // สำหรับ Portal
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null);
  const MENU_WIDTH = 256; // w-64

  const initials = useMemo(() => {
    const name = (user.full_name || "").trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const inits = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
    return inits.join("") || "U";
  }, [user]);

  const avatarSrc = (user as any).image_url || (user as any).profile_image_url || "";

  // ปิดเมื่อคลิกข้างนอก/กด Esc
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // คำนวณตำแหน่งเมนูให้ "อยู่ด้านบนตลอด"
  const computePosition = useCallback(() => {
    if (!btnRef.current || !menuRef.current) return;
    const br = btnRef.current.getBoundingClientRect();
    const mh = menuRef.current.offsetHeight || 0;
    const gap = 8; // px

    // จัดชิดขวากับปุ่ม
    const left = Math.round(br.right - MENU_WIDTH);
    // บังคับวางบน
    const top = Math.round(br.top - mh - gap);

    setCoords({
      left: Math.max(8, left), // กันชนซ้าย
      top: Math.max(8, top),   // กันชนบน
    });
  }, []);

  // หลังเมนู mount แล้วค่อยวัดขนาดและจัดตำแหน่ง
  useLayoutEffect(() => {
    if (!open) return;
    // วัดทันที และวัดซ้ำหลัง paint เผื่อฟอนต์โหลด
    computePosition();
    const raf = requestAnimationFrame(computePosition);

    const onWin = () => computePosition();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin);
    };
  }, [open, computePosition]);

  // คีย์บอร์ดในเมนู (แบบง่าย)
  const itemRefs = useRef<Array<HTMLAnchorElement | HTMLButtonElement | null>>([]);
  const bindItemRef = (i: number) => (el: HTMLAnchorElement | HTMLButtonElement | null) => {
    itemRefs.current[i] = el;
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen(v => !v);
          // ลบ focus ring ตอนเปิดเมนู เพื่อไม่ให้เห็น pill สีน้ำเงินค้างอยู่
          requestAnimationFrame(() => btnRef.current?.blur());
        }}
        className={[
          "group inline-flex items-center transition-all duration-150",
          compact
            ? [
                "h-9 w-9 rounded-full border border-slate-200 bg-white/90 shadow-sm",
                !open && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60",
              ].join(" ")
            : [
                "gap-3 rounded-full border border-slate-200 bg-white/90 pl-1.5 pr-2.5 py-3 px-3 shadow-sm",
                "hover:bg-white",
                !open && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60",
              ].join(" "),
        ].join(" ")}
      >
        {/* Avatar */}
        <div
          className={[
            compact ? "h-9 w-9" : "h-8 w-8",
            "grid place-items-center rounded-full bg-indigo-50 text-indigo-700 font-semibold",
            "overflow-hidden shrink-0",
          ].join(" ")}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={user.full_name || "User"}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-xs">{initials}</span>
          )}
        </div>

        {/* Name */}
        {!compact && (
          <span className="max-w-[160px] truncate text-sm font-medium text-slate-800">
            {user.full_name || ""}
          </span>
        )}

        {/* Caret (หมุนตอน open) */}
        {!compact && (
          <ChevronDown
            size={16}
            className={[
              "ml-0.5 text-slate-400 transition-transform duration-150 group-hover:text-slate-600",
              open ? "rotate-180" : "rotate-0",
            ].join(" ")}
          />
        )}
      </button>

      {/* ------- Menu via Portal + position:fixed (always above) ------- */}
      {open && typeof window !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="User menu"
            style={{
              position: "fixed",
              left: coords?.left ?? -9999,
              top: coords?.top ?? -9999,
              visibility: coords ? "visible" : "hidden",
              width: MENU_WIDTH,
            }}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5 dark:bg-slate-800 dark:border-slate-700 z-[9999]"
          >
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="h-9 w-9 grid place-items-center rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold dark:bg-indigo-900/40 dark:text-indigo-300">
                    {initials}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate dark:text-slate-100">
                    {user.full_name || ""}
                  </p>
                  {user.email && (
                    <p className="text-xs text-slate-500 truncate dark:text-slate-400">{user.email}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700" />

            <div className="py-1">
              <MenuLink
                i={0} bindRef={bindItemRef}
                href="/settings" icon={<Settings className="h-4 w-4" />} label="Settings"
                onClick={() => setOpen(false)}
              />
              <MenuLink
                i={1} bindRef={bindItemRef}
                href="/help" icon={<HelpCircle className="h-4 w-4" />} label="Help"
                onClick={() => setOpen(false)}
              />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700" />

            <div className="py-1">
              <form action="/auth/logout" method="post">
                <button
                  ref={bindItemRef(2)}
                  type="submit"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 focus:outline-none focus:bg-rose-50 dark:hover:bg-rose-950/30 dark:text-rose-400 dark:focus:bg-rose-950/30"
                  onClick={() => setOpen(false)}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </form>
            </div>
          </div>,
          document.body
        )
      }
    </div>
  );
}

/** เมนูลิงก์ย่อย */
function MenuLink({
  i, bindRef, href, icon, label, onClick,
}: {
  i: number;
  bindRef: (i: number) => (el: HTMLAnchorElement | null) => void;
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <NextLink
      ref={bindRef(i)}
      href={href}
      role="menuitem"
      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60 dark:focus:bg-slate-700/60"
      onClick={onClick}
    >
      <span className="text-slate-400 dark:text-slate-300">{icon}</span>
      <span className="truncate">{label}</span>
    </NextLink>
  );
}
