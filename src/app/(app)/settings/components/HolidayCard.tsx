import Dropdown from "@/src/components/shared/input/Dropdown";
import { Trash2 } from "lucide-react";
import React from "react";

type Holiday = {
  start_date: string;
  end_date: string;
  description: string;
  is_recurring: boolean;
};

type HolidayCardProps = {
  holidays: Holiday[];
  setHolidays: React.Dispatch<React.SetStateAction<Holiday[]>>;
  isEditing: boolean;
};

function toBool(value: string): boolean {
  return value === "true";
}

const HolidayCard: React.FC<HolidayCardProps> = ({
  holidays,
  setHolidays,
  isEditing,
}) => {
  const addEmptyRow = () => {
    setHolidays([
      ...holidays,
      {
        start_date: "",
        end_date: "",
        description: "",
        is_recurring: false,
      },
    ]);
  };

  const removeRow = (index: number) => {
    setHolidays(holidays.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, updated: Partial<Holiday>) => {
    setHolidays(
      holidays.map((h, i) => (i === index ? { ...h, ...updated } : h))
    );
  };

  return (
    <section className="scroll-mt-24 bg-white border rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Calendar / Holidays</h2>
        <span className="text-xs rounded-full px-2 py-0.5 border bg-slate-50 text-slate-500">
          {isEditing ? "Editing" : "Read-only"}
        </span>
      </div>

      <fieldset disabled={!isEditing} className={!isEditing ? "opacity-80 select-none" : ""}>
        <div className="overflow-auto rounded-md border border-slate-200">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100 text-slate-600 text-xs">
              <tr>
                <th className="px-4 py-2 border-b border-slate-200 w-40">Start Date</th>
                <th className="px-4 py-2 border-b border-slate-200 w-40">End Date</th>
                <th className="px-4 py-2 border-b border-slate-200">Description</th>
                <th className="px-4 py-2 border-b border-slate-200 w-32">Recurring</th>
                {isEditing && <th className="px-4 py-2 border-b border-slate-200 w-10 text-center"></th>}
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday, index) => (
                <tr
                  key={index}
                  className="even:bg-white odd:bg-slate-50 hover:bg-blue-50 transition"
                >
                  <td className="px-4 py-2 border-b border-slate-100">
                    <input
                      type="date"
                      value={holiday.start_date}
                      onChange={(e) => updateRow(index, { start_date: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-slate-100">
                    <input
                      type="date"
                      value={holiday.end_date}
                      onChange={(e) => updateRow(index, { end_date: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-slate-100">
                    <input
                      type="text"
                      value={holiday.description}
                      placeholder="Description"
                      onChange={(e) => updateRow(index, { description: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-slate-100">
                    <select
                      value={String(holiday.is_recurring)}
                      onChange={(e) =>
                        updateRow(index, { is_recurring: toBool(e.target.value) })
                      }
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>                  
                  </td>
                  {isEditing && (
                    <td className="px-2 py-2 border-b border-slate-100 text-center">
                      <button
                        onClick={() => removeRow(index)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {isEditing && (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={addEmptyRow}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      + Add Holiday
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </fieldset>
    </section>
  );
};

export default HolidayCard;
