import React from "react";

type Option<T extends string> = {
  label: string;
  value: T;
};

type SegmentProps<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
};

export default function Segment<T extends string>({
  value,
  options,
  onChange,
  className = "",
}: SegmentProps<T>) {
  return (
    <div
      className={`inline-flex rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            value === opt.value
              ? "bg-slate-100 text-slate-900"
              : "text-slate-600 hover:bg-slate-50"
          }`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
