"use client";

import { useMemo, useEffect } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";
import IconButton from "@/src/components/shared/button/IconButton";
import SearchInput from "@/src/components/shared/input/SearchInput";
import CommonTable from "@/src/components/shared/Table";
import { usePagination } from "@/src/hooks/usePagination";

export type BomLine = {
  id: number | null;
  fg_code: string;
  component_code: string;
  usage: number;
  unit_code?: string;
  substitute?: string;
  scrap_pct?: number;
  remarks?: string;
};

interface Props {
  bomLines?: BomLine[];                 // ทำให้เป็น optional
  query: string;
  setQuery: (q: string) => void;
  onAdd: () => void;
  onEdit: (id: number | null) => void;
  onDelete: (id: number) => void;
  fgFilter?: string;
}

const BomListSection: React.FC<Props> = ({
  bomLines = [],                        // ค่าเริ่มต้นเป็น []
  query,
  setQuery,
  onAdd,
  onEdit,
  onDelete,
  fgFilter,
}) => {
  const safeList = Array.isArray(bomLines) ? bomLines : [];   // กันชัวร์อีกชั้น

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return safeList.filter((b) => {
      if (fgFilter && b.fg_code !== fgFilter) return false;
      const text = [
        b.fg_code,
        b.component_code,
        b.unit_code ?? "",
        String(b.usage ?? ""),
        b.substitute ?? "",
        b.remarks ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return !q || text.includes(q);
    });
  }, [safeList, query, fgFilter]);

  const {
    pagedData,
    page,
    pageSize,
    setPage,
    setPageSize,
    total,
    resetPage,
  } = usePagination(filtered);

  // ใช้ useEffect สำหรับ side-effect
  useEffect(() => {
    resetPage();
  }, [query, fgFilter, resetPage]);

  const columns = [
    {
      key: "action",
      header: "Action",
      className: "text-right",
      render: (b: BomLine) => (
        <div className="flex justify-end gap-2">
          <IconButton buttonClassName="px-2 py-1" onClick={() => onEdit(b.id ?? null)}>
            <Edit3 size={16} />
          </IconButton>
          <IconButton
            variant="warn"
            buttonClassName="px-2 py-1"
            onClick={() => b.id != null && onDelete(b.id)}
          >
            <Trash2 size={16} />
          </IconButton>
        </div>
      ),
    },
    { key: "fg_code", header: "FG", render: (b: BomLine) => <b>{b.fg_code}</b> },
    { key: "component_code", header: "Component" },
    { key: "usage", header: "Usage", render: (b: BomLine) => b.usage ?? "-" },
    { key: "unit_code", header: "Unit", render: (b: BomLine) => b.unit_code || "-" },
    { key: "substitute", header: "Substitute", render: (b: BomLine) => b.substitute || "-" },
    {
      key: "scrap_pct",
      header: "Scrap %",
      render: (b: BomLine) =>
        typeof b.scrap_pct === "number" ? `${b.scrap_pct}%` : "-",
    },
    { key: "remarks", header: "Remarks", render: (b: BomLine) => b.remarks || "-" },
  ] as const;

  return (
    <section>
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={
            fgFilter
              ? `ค้นหาใน FG ${fgFilter} (component/usage/unit/substitute/remarks)`
              : "ค้นหา fg/component/usage/unit/substitute/remarks"
          }
        />
        <div className="ml-auto">
          <IconButton variant="ok" label="New BOM Line" onClick={onAdd}>
            <Plus size={18} />
          </IconButton>
        </div>
      </div>

      <CommonTable<BomLine>
        columns={columns as any}
        data={pagedData ?? []}  // กันกรณี null
        pagination={{
          total: total ?? 0,
          page,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
          pageSizes: [10, 20, 50],
        }}
      />
    </section>
  );
};

export default BomListSection;