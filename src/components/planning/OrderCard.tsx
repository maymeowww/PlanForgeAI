"use client";

export type PendingOrder = {
  id: string;
  product: string;
  qty: number;
  due: string;
  note?: string;
};

export default function OrderCard({
  order,
  active,
}: {
  order: PendingOrder;
  active?: boolean;
}) {
  const onDragStart: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.dataTransfer.setData("text/order-id", order.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={[
        "cursor-grab active:cursor-grabbing",
        "rounded-xl border bg-white shadow-sm",
        "px-4 py-3 text-sm",
        "transition ring-0 hover:ring-2 hover:ring-primary/20",
        active ? "bg-amber-50 border-amber-200 ring-2 ring-amber-200" : "border-gray-200",
      ].join(" ")}
      title="Drag to schedule"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold">{order.id}</div>
          <div className="text-gray-700">
            {order.product} • {order.qty} pcs
          </div>
          <div className="text-[12px] text-gray-400">
            Due: {order.due}
            {order.note ? ` (${order.note})` : ""}
          </div>
        </div>
        <button
          className="text-gray-400 hover:text-gray-600"
          aria-label="More"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          ⋮
        </button>
      </div>
    </div>
  );
}
