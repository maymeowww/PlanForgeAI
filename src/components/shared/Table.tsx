import React from "react";
import { Plus, Upload, Edit3, Trash2, X } from "lucide-react";

type TableColumn<T> = {
  key: keyof T | string;
  label: string;
  width?: string;
  render?: (item: T) => React.ReactNode;
};

type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  openOrderModal: (id: number | string) => void;
  delOrder: (id: number | string) => void;
};

function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages === 0) return null;

  const pagesToShow = 5;
  let startPage = Math.max(currentPage - Math.floor(pagesToShow / 2), 1);
  let endPage = startPage + pagesToShow - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - pagesToShow + 1, 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav
      className="flex items-center flex-col md:flex-row justify-between w-full gap-2"
      aria-label="Table navigation"
    >
      <span className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-medium text-gray-900">
          {(currentPage - 1) * pageSize + 1}
        </span>{" "}
        to{" "}
        <span className="font-medium text-gray-900">
          {Math.min(currentPage * pageSize, totalItems)}
        </span>{" "}
        of{" "}
        <span className="font-medium text-gray-900">{totalItems}</span> entries
      </span>

      <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
          >
            Previous
          </button>
        </li>

        {startPage > 1 && (
          <>
            <li>
              <button
                onClick={() => onPageChange(1)}
                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
              >
                1
              </button>
            </li>
            {startPage > 2 && (
              <li className="flex items-center px-2 text-gray-400">…</li>
            )}
          </>
        )}

        {pages.map((p) => (
          <li key={p}>
            <button
              onClick={() => onPageChange(p)}
              className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${
                p === currentPage
                  ? "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                  : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
              }`}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </button>
          </li>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <li className="flex items-center px-2 text-gray-400">…</li>
            )}
            <li>
              <button
                onClick={() => onPageChange(totalPages)}
                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
              >
                {totalPages}
              </button>
            </li>
          </>
        )}

        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}


const IconButton = ({
  children,
  tooltip,
  variant,
  onClick,
}: {
  children: React.ReactNode;
  tooltip?: string;
  variant?: "warn" | "default";
  onClick: () => void;
}) => {
  const baseClasses =
    "p-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer inline-flex items-center justify-center";
  const warnClasses = "text-red-600 hover:bg-red-100";

  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`${baseClasses} ${variant === "warn" ? warnClasses : "text-gray-600"}`}
      type="button"
    >
      {children}
    </button>
  );
};

export default function Table<T>({
  columns,
  data,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  openOrderModal,
  delOrder,
}: TableProps<T>) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-5 py-3 border-b border-gray-200 font-semibold text-gray-700"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
            <th className="px-5 py-3 border-b border-gray-200 w-24 text-center font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-6 text-gray-500">
                No data found.
              </td>
            </tr>
          )}

          {data.map((item, i) => (
            <tr
              key={i}
              className="even:bg-white odd:bg-gray-50 hover:bg-blue-50 cursor-pointer transition"
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-5 py-3 border-b border-gray-200 align-middle"
                >
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}

              <td className="px-5 py-3 border-b border-gray-200 text-center">
                <div className="inline-flex gap-2 justify-center">
                    <IconButton
                    tooltip="Edit"
                    onClick={() => openOrderModal((item as any).id)}
                    >
                    <Edit3 size={16} />
                    </IconButton>

                    <IconButton
                    tooltip="Delete"
                    variant="warn"
                    onClick={() => delOrder((item as any).id)}
                    >
                    <Trash2 size={16} />
                    </IconButton>
                </div>
                </td>

            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4 px-5 py-3 bg-gray-50 rounded-b-md text-gray-600 text-sm select-none">     
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
