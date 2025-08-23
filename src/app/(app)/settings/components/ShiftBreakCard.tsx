import { Trash2 } from "lucide-react";
import React, { useCallback } from "react";

type Shift = {
  code: string;
  start: string;
  end: string;
  lines: string[];
};

type Break = {
  shift_code: string;
  start: string;
  end: string;
};

type Props = {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  breaks: Break[];
  setBreaks: React.Dispatch<React.SetStateAction<Break[]>>;
  isEditing: boolean;
};

const th = "px-4 py-2 text-left text-xs font-semibold text-slate-600 border-b border-slate-200";
const cell = "px-4 py-2 border-b border-slate-100";

const toArrayString = (arr: string[]) => arr.join(",");

const ShiftBreakCard: React.FC<Props> = ({
  shifts,
  setShifts,
  breaks,
  setBreaks,
  isEditing,
}) => {
  // Shift handlers
  const addShiftRow = useCallback(() => {
    setShifts((prev) => [...prev, { code: "", start: "08:00", end: "17:00", lines: [] }]);
  }, [setShifts]);

  const removeShiftRow = useCallback(
    (index: number) => {
      setShifts((prev) => prev.filter((_, i) => i !== index));
    },
    [setShifts]
  );

  const updateShiftRow = useCallback(
    (index: number, updated: Partial<Shift>) => {
      setShifts((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...updated } : s))
      );
    },
    [setShifts]
  );

  // Break handlers
  const addBreakRow = useCallback(() => {
    setBreaks((prev) => [...prev, { shift_code: "", start: "12:00", end: "13:00" }]);
  }, [setBreaks]);

  const removeBreakRow = useCallback(
    (index: number) => {
      setBreaks((prev) => prev.filter((_, i) => i !== index));
    },
    [setBreaks]
  );

  const updateBreakRow = useCallback(
    (index: number, updated: Partial<Break>) => {
      setBreaks((prev) =>
        prev.map((b, i) => (i === index ? { ...b, ...updated } : b))
      );
    },
    [setBreaks]
  );

  return (
    <section className="scroll-mt-24 bg-white border rounded-2xl shadow-sm p-4 mt-4">
      <h2 className="text-lg font-semibold mb-2">Shifts & Breaks</h2>
      <p className="text-xs text-slate-500 mb-4">นิยามกะทำงานและช่วงพัก</p>

      <fieldset disabled={!isEditing} className={!isEditing ? "opacity-80 select-none" : ""}>
        {/* Shifts Table */}
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Shifts</h3>
        <div className="overflow-auto rounded-md border border-slate-200">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100 text-slate-600 text-xs">
              <tr>
                <th className={`${th} w-36`}>Shift Code</th>
                <th className={`${th} w-40`}>Start</th>
                <th className={`${th} w-40`}>End</th>
                <th className={th}>Lines (optional)</th>
                {isEditing && <th className={`${th} w-10 text-center`}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {shifts.map((s, i) => (
                <tr
                  key={i}
                  className="even:bg-white odd:bg-slate-50 hover:bg-blue-50 transition"
                >
                  <td className={cell}>
                    <input
                      type="text"
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      placeholder="A"
                      value={s.code}
                      onChange={(e) => updateShiftRow(i, { code: e.target.value })}
                      disabled={!isEditing}
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="time"
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      value={s.start}
                      onChange={(e) => updateShiftRow(i, { start: e.target.value })}
                      disabled={!isEditing}
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="time"
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      value={s.end}
                      onChange={(e) => updateShiftRow(i, { end: e.target.value })}
                      disabled={!isEditing}
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="text"
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      placeholder="Assembly,Packing"
                      value={toArrayString(s.lines)}
                      onChange={(e) =>
                        updateShiftRow(i, {
                          lines: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      disabled={!isEditing}
                    />
                  </td>
                  {isEditing && (
                    <td className={`${cell} text-center`}>
                      <button
                        onClick={() => removeShiftRow(i)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                        title="Remove"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {isEditing && (
                <tr>
                  <td colSpan={isEditing ? 5 : 4} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={addShiftRow}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      + Add Shift
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Breaks Table */}
        <h3 className="text-sm font-semibold text-slate-700 mt-6 mb-2">Breaks</h3>
        <div className="overflow-auto rounded-md border border-slate-200">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100 text-slate-600 text-xs">
              <tr>
                <th className={`${th} w-36`}>Shift Code</th>
                <th className={`${th} w-40`}>Break Start</th>
                <th className={`${th} w-40`}>Break End</th>
                {isEditing && <th className={`${th} w-10 text-center`}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {breaks.map((b, i) => (
                <tr
                  key={i}
                  className="even:bg-white odd:bg-slate-50 hover:bg-blue-50 transition"
                >
                  <td className={cell}>
                    <input
                      type="text"
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      placeholder="A"
                      value={b.shift_code}
                      onChange={(e) => updateBreakRow(i, { shift_code: e.target.value })}
                      disabled={!isEditing}
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="time"
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      value={b.start}
                      onChange={(e) => updateBreakRow(i, { start: e.target.value })}
                      disabled={!isEditing}
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="time"
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      value={b.end}
                      onChange={(e) => updateBreakRow(i, { end: e.target.value })}
                      disabled={!isEditing}
                    />
                  </td>
                  {isEditing && (
                    <td className={`${cell} text-center`}>
                      <button
                        onClick={() => removeBreakRow(i)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                        title="Remove"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {isEditing && (
                <tr>
                  <td colSpan={isEditing ? 4 : 3} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={addBreakRow}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      + Add Break
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

export default ShiftBreakCard;
