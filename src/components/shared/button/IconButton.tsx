import React, { useState } from "react";
import clsx from "clsx";

type IconButtonProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "ok" | "warn";
  label?: string;
  tooltip?: string;
  className?: string;
};

export default function IconButton({
  children,
  icon,
  onClick,
  variant = "default",
  label,
  tooltip,
  className = "",
}: IconButtonProps) {
  const [show, setShow] = useState(false);

  const tipPos = "top-full left-1/2 -translate-x-1/2 mt-1";

  return (
    <div className={clsx("relative inline-block", className)}>
      <button
        type="button"
        className={clsx(
          "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none",
          {
            "bg-blue-500 hover:bg-blue-600 text-white": variant === "ok",
            "bg-red-500 hover:bg-red-600 text-white": variant === "warn",
            "bg-gray-200 hover:bg-gray-300 text-gray-800": variant === "default",
          }
        )}
        onClick={onClick}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onTouchStart={() => setShow(true)}
        onTouchEnd={() => setShow(false)}
        aria-label={tooltip}
      >
        {icon && <span className="flex items-center">{icon}</span>}
        <span className="flex items-center whitespace-nowrap">
          {children}
          {label && <> {label}</>}
        </span>
      </button>

      {tooltip && (
        <div
          className={clsx(
            "absolute whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white transition-all duration-150 z-50 pointer-events-none",
            tipPos,
            show ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}
