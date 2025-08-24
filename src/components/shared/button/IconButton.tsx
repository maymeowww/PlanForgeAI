import React, { useState } from "react";
import clsx from "clsx";

type IconButtonProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "default" | "ok" | "warn";
  label?: string;          // ข้อความบนปุ่ม (ถ้าซ่อน ให้ตั้ง aria-label ผ่าน tooltip)
  tooltip?: string;        // แสดงเป็นทูลทิปบน hover/focus
  className?: string;      // คลาสของ wrapper
  buttonClassName?: string;// คลาสของปุ่มเอง
  disabled?: boolean;
};

export default function IconButton({
  children,
  icon,
  onClick,
  variant = "default",
  label,
  tooltip,
  className = "",
  buttonClassName = "",
  disabled = false,
}: IconButtonProps) {
  const [show, setShow] = useState(false);

  const tipPos = "top-full left-1/2 -translate-x-1/2 mt-1";

  const variantClass =
    variant === "ok"
      ? 
        "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600/90 dark:hover:bg-blue-600"
      : variant === "warn"
      ? 
        "bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-500/90 dark:hover:bg-rose-500"
      : 
        "bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100";

  return (
    <div className={clsx("relative inline-block", className)}>
      <button
        type="button"
        className={clsx(
          // base
          "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClass,
          buttonClassName
        )}
        onClick={onClick}
        onMouseEnter={() => !disabled && setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => !disabled && setShow(true)}
        onBlur={() => setShow(false)}
        onTouchStart={() => !disabled && setShow(true)}
        onTouchEnd={() => setShow(false)}
        aria-label={label ? undefined : tooltip}
        aria-disabled={disabled || undefined}
        disabled={disabled}
      >
        {icon && <span className="flex items-center">{icon}</span>}
        <span className="flex items-center whitespace-nowrap gap-2">
          {children}
          {label && <>{label}</>}
        </span>
      </button>

      {tooltip && (
        <div
          className={clsx(
            "absolute z-50 pointer-events-none select-none",
            "whitespace-nowrap rounded-md px-2 py-1 text-xs shadow-md",
            "ring-1 ring-black/10 dark:ring-white/10",
            "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900",
            "transition-all duration-150",
            tipPos,
            show ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
          role="tooltip"
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}
