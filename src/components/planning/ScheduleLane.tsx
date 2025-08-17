"use client";

import DropSlot from "./DropSlot";

export type LaneId = "A" | "B" | "C";

export type LaneItem =
  | { type: "current"; title: string; product?: string; progress?: string; meta?: string }
  | { type: "maintenance"; title: string; meta?: string }
  | { type: "issue"; title: string; meta?: string }
  | { type: "order"; title: string; product?: string; progress?: string; meta?: string };

export default function ScheduleLane({
  title,
  status,
  rightMeta,
  items,
  slots,
  laneId,
  onDropOrder,
}: {
  title: string;
  status?: React.ReactNode;
  rightMeta?: React.ReactNode;
  items: LaneItem[];
  slots: { label: string }[];
  laneId: LaneId;
  onDropOrder: (lane: LaneId, orderId: string, slotIndex: number) => void;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <h3 className="font-semibold">{title}</h3>
          {status}
        </div>
        {rightMeta}
      </div>

      {/* Cards + Slots */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Existing items */}
        {items.map((it, idx) => {
          const base = "rounded-xl p-4 text-sm shadow-sm";
          const style =
            it.type === "current"
              ? "bg-emerald-50 border border-emerald-200 ring-1 ring-emerald-100"
              : it.type === "maintenance"
              ? "bg-amber-50 border border-amber-200 ring-1 ring-amber-100"
              : it.type === "issue"
              ? "bg-rose-50 border border-rose-200 ring-1 ring-rose-100"
              : "bg-indigo-50 border border-indigo-200 ring-1 ring-indigo-100";

          return (
            <div key={idx} className={`${base} ${style}`}>
              <div className="font-semibold">{it.title}</div>

              {"product" in it && it.product && (
                <div className="text-gray-700">{it.product}</div>
              )}

              {"progress" in it && it.progress && (
                <div className="text-gray-700">{it.progress}</div>
              )}

              {"meta" in it && it.meta && (
                <div className="whitespace-pre-line text-gray-500 text-xs mt-1">
                  {it.meta}
                </div>
              )}
            </div>
          );
        })}

        {/* Drop slots */}
        {slots.map((s, i) => (
          <DropSlot
            key={i}
            label={s.label}
            onDropOrder={(orderId) => onDropOrder(laneId, orderId, i)}
          />
        ))}
      </div>
    </div>
  );
}
