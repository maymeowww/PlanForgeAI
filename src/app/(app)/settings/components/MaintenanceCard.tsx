import React from "react";
import { Trash2 } from "lucide-react";

interface MaintWin {
  machine_id: string;
  start_dt: string;
  end_dt: string;
  type: "PM" | "Unplanned";
  note: string;
}

interface Props {
  maint: MaintWin[];
  setMaint: (data: MaintWin[]) => void;
  isEditing: boolean;
  th: string;
  cell: string;
}

const MaintenanceCard: React.FC<Props> = ({
  maint,
  setMaint,
  isEditing,
  th,
  cell,
}) => {
  const addEmptyRow = () => {
    setMaint([
      ...maint,
      {
        machine_id: "",
        start_dt: "",
        end_dt: "",
        type: "PM",
        note: "",
      },
    ]);
  };

  return (
    <section
      id="maint"
      className="scroll-mt-24 bg-white border rounded-2xl shadow-sm p-4"
    >
      <h2 className="text-lg font-semibold mb-4">Maintenance Windows</h2>

      <fieldset disabled={!isEditing} className={!isEditing ? "opacity-80 select-none" : ""}>
        <div className="overflow-auto rounded-md border border-slate-200">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100 text-slate-600 text-xs">
              <tr>
                <th className={th + " w-32"}>Machine ID</th>
                <th className={th + " w-56"}>Start</th>
                <th className={th + " w-56"}>End</th>
                <th className={th + " w-40"}>Type</th>
                <th className={th}>Note</th>
                {isEditing && <th className={th + " w-10 text-center"} />}
              </tr>
            </thead>
            <tbody>
              {maint.map((m, i) => (
                <tr
                  key={i}
                  className="even:bg-white odd:bg-slate-50 hover:bg-blue-50 transition"
                >
                  <td className={cell}>
                    <input
                      className="w-full rounded-md border border-slate-300 px-2 py-1"
                      placeholder="M1"
                      value={m.machine_id}
                      onChange={(e) =>
                        setMaint(
                          maint.map((x, j) =>
                            j === i ? { ...x, machine_id: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="datetime-local"
                      className="w-full rounded-md border border-slate-300 px-2 py-1"
                      value={m.start_dt}
                      onChange={(e) =>
                        setMaint(
                          maint.map((x, j) =>
                            j === i ? { ...x, start_dt: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="datetime-local"
                      className="w-full rounded-md border border-slate-300 px-2 py-1"
                      value={m.end_dt}
                      onChange={(e) =>
                        setMaint(
                          maint.map((x, j) =>
                            j === i ? { ...x, end_dt: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className={cell}>
                    <select
                      className="w-full rounded-md border border-slate-300 px-2 py-1"
                      value={m.type}
                      onChange={(e) =>
                        setMaint(
                          maint.map((x, j) =>
                            j === i
                              ? { ...x, type: e.target.value as MaintWin["type"] }
                              : x
                          )
                        )
                      }
                    >
                      <option value="PM">PM</option>
                      <option value="Unplanned">Unplanned</option>
                    </select>
                  </td>
                  <td className={cell}>
                    <input
                      className="w-full rounded-md border border-slate-300 px-2 py-1"
                      placeholder="note"
                      value={m.note}
                      onChange={(e) =>
                        setMaint(
                          maint.map((x, j) =>
                            j === i ? { ...x, note: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                  {isEditing && (
                    <td className={cell + " text-center"}>
                      <button
                        onClick={() =>
                          setMaint(maint.filter((_, j) => j !== i))
                        }
                        className="text-rose-600 hover:text-rose-800 p-1 disabled:opacity-50"
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
                  <td colSpan={6} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={addEmptyRow}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      + Add Maintenance Window
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

export default MaintenanceCard;
