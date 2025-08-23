import React from "react";
import { Trash2 } from "lucide-react";

type OTRules = {
  daily_cap_hours: number;
  allow_weekend_ot: boolean;
  default_setup_min: number;
  default_buffer_min: number;
};

type SetupMatrixRule = {
  from: string;
  to: string;
  setup_min: number;
};

type Props = {
  otRules: OTRules;
  setOTRules: React.Dispatch<React.SetStateAction<OTRules>>;
  setupMatrix: SetupMatrixRule[];
  setSetupMatrix: React.Dispatch<React.SetStateAction<SetupMatrixRule[]>>;
  isEditing: boolean;
  toBool: (val: string) => boolean;
};

const th = "px-4 py-2 text-left text-xs font-semibold text-slate-600 border-b border-slate-200";
const cell = "px-4 py-2 border-b border-slate-100";

const OTCard: React.FC<Props> = ({
  otRules,
  setOTRules,
  setupMatrix,
  setSetupMatrix,
  isEditing,
  toBool,
}) => {
  return (
    <section
      id="ot"
      className="scroll-mt-24 bg-white border rounded-2xl shadow-sm p-4 mt-4"
    >
      <h2 className="text-lg font-semibold mb-2">OT Rules / Setup Time / Buffer</h2>

      <fieldset disabled={!isEditing} className={!isEditing ? "opacity-80 select-none" : ""}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <label className="flex items-center gap-3">
            <span className="w-48 text-sm">OT Daily Cap (hours)</span>
            <input
              type="number"
              min={0}
              step={0.5}
              className="rounded-md border border-slate-300 px-3 py-1 w-32 text-sm"
              value={otRules.daily_cap_hours}
              onChange={(e) =>
                setOTRules({ ...otRules, daily_cap_hours: Number(e.target.value) || 0 })
              }
            />
          </label>

          <label className="flex items-center gap-3">
            <span className="w-48 text-sm">Allow Weekend OT</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-1 w-40 text-sm"
              value={String(otRules.allow_weekend_ot)}
              onChange={(e) =>
                setOTRules({ ...otRules, allow_weekend_ot: toBool(e.target.value) })
              }
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="flex items-center gap-3">
            <span className="w-48 text-sm">Default Setup (min)</span>
            <input
              type="number"
              min={0}
              step={1}
              className="rounded-md border border-slate-300 px-3 py-1 w-32 text-sm"
              value={otRules.default_setup_min}
              onChange={(e) =>
                setOTRules({ ...otRules, default_setup_min: Number(e.target.value) || 0 })
              }
            />
          </label>

          <label className="flex items-center gap-3">
            <span className="w-48 text-sm">Default Buffer before Due (min)</span>
            <input
              type="number"
              min={0}
              step={5}
              className="rounded-md border border-slate-300 px-3 py-1 w-32 text-sm"
              value={otRules.default_buffer_min}
              onChange={(e) =>
                setOTRules({ ...otRules, default_buffer_min: Number(e.target.value) || 0 })
              }
            />
          </label>
        </div>

        <hr className="my-6 border-slate-300" />

        <h3 className="text-sm font-semibold text-slate-700 mb-2">
          Setup Matrix (product → product)
        </h3>
        <div className="overflow-auto rounded-md border border-slate-200">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100 text-slate-600 text-xs">
              <tr>
                <th className={th} style={{ width: 170 }}>
                  From Product
                </th>
                <th className={th} style={{ width: 170 }}>
                  To Product
                </th>
                <th className={th} style={{ width: 160 }}>
                  Setup (min)
                </th>
                {isEditing && <th className={th} style={{ width: 60 }}></th>}
              </tr>
            </thead>
            <tbody>
              {setupMatrix.map((r, i) => (
                <tr
                  key={i}
                  className="even:bg-white odd:bg-slate-50 hover:bg-blue-50 transition"
                >
                  <td className={cell}>
                    <input
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      placeholder="P1"
                      value={r.from}
                      onChange={(e) =>
                        setSetupMatrix(
                          setupMatrix.map((x, j) =>
                            j === i ? { ...x, from: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className={cell}>
                    <input
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      placeholder="P2"
                      value={r.to}
                      onChange={(e) =>
                        setSetupMatrix(
                          setupMatrix.map((x, j) =>
                            j === i ? { ...x, to: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      value={r.setup_min}
                      onChange={(e) =>
                        setSetupMatrix(
                          setupMatrix.map((x, j) =>
                            j === i ? { ...x, setup_min: Number(e.target.value) || 0 } : x
                          )
                        )
                      }
                    />
                  </td>
                  {isEditing && (
                    <td className={`${cell} text-center`}>
                      <button
                        className="text-rose-600 hover:text-rose-800 p-1"
                        onClick={() =>
                          setSetupMatrix(setupMatrix.filter((_, j) => j !== i))
                        }
                        title="Remove rule"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isEditing && (
          <div className="mt-3 text-center">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
              onClick={() =>
                setSetupMatrix([...setupMatrix, { from: "", to: "", setup_min: 10 }])
              }
            >
              + Add Rule
            </button>
          </div>
        )}
      </fieldset>
    </section>
  );
};

export default OTCard;
