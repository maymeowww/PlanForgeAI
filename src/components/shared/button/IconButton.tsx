import React, { useState } from "react";
import clsx from "clsx";

type IconButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "ok" | "warn";
  tooltip?: string;
  className?: string;
  placement?: "top" | "bottom" | "left" | "right";
};

export default function IconButton({
  children,
  onClick,
  variant = "default",
  tooltip,
  className = "",
  placement = "top",
}: IconButtonProps) {
  const [show, setShow] = useState(false);

  // ตำแหน่ง tooltip
  const tipPos =
    placement === "top"
      ? "bottom-full left-1/2 -translate-x-1/2 mb-1"
      : placement === "bottom"
      ? "top-full left-1/2 -translate-x-1/2 mt-1"
      : placement === "left"
      ? "right-full top-1/2 -translate-y-1/2 mr-1"
      : "left-full top-1/2 -translate-y-1/2 ml-1";

  return (
    <div className={clsx("relative inline-block", className)}>
      <button
        type="button"
        // className={clsx(
        //   "iconbtn border border-slate-200", 
        //   { 
        //     ok: variant === "ok", 
        //     warn: variant === "warn" 
        //   }
        // )}   
        className={clsx(
            "iconbtn border rounded-md p-2 transition-colors",
            {
              "border-slate-200 hover:bg-slate-100": variant === "default",
              "border-green-500 hover:bg-green-50 text-green-700": variant === "ok",
              "border-red-500 hover:bg-red-50 text-red-700": variant === "warn",
            }
          )}     
        onClick={onClick}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onTouchStart={() => setShow(true)}   // มือถือ
        onTouchEnd={() => setShow(false)}
        aria-label={tooltip}
      >
        {children}
      </button>

      {tooltip && (
        <div
          className={clsx(
            "absolute whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white transition-opacity duration-150 z-10 pointer-events-none",
            tipPos,
            show ? "opacity-100" : "opacity-0"
          )}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}
