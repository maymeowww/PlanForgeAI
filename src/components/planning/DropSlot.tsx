type Props = {
  label: string;
  onDropOrder: (orderId: string) => void;
};

export default function DropSlot({ label, onDropOrder }: Props) {
  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/order-id");
    if (id) onDropOrder(id);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={[
        "min-h-[124px] rounded-xl",
        "border-2 border-dashed border-gray-300 bg-white",
        "flex items-center justify-center text-[13px] text-gray-600",
        "shadow-sm px-3 text-center",
        "hover:bg-gray-50 transition",
      ].join(" ")}
      title="Drop order here"
    >
      <div className="flex items-center gap-2">
        {/* ไอคอนไฟล์เล็ก ๆ */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        <div className="text-gray-600">
          <div className="font-medium">Drop order here</div>
          <div className="text-[12px] text-gray-400">{label}</div>
        </div>
      </div>
    </div>
  );
}
