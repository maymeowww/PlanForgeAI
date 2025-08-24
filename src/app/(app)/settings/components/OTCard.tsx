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
  otRules: OTRules | null;
  setOTRules: React.Dispatch<React.SetStateAction<OTRules | null>>;
  setupMatrix: SetupMatrixRule[];
  setSetupMatrix: React.Dispatch<React.SetStateAction<SetupMatrixRule[]>>;
  isEditing: boolean;
  toBool: (val: string) => boolean;
};

/* ---- table styles (รองรับ dark) ---- */
const th =
  "px-4 py-2 text-left text-xs font-semibold " +
  "text-slate-700 border-b border-slate-200 " +
  "dark:text-slate-300 dark:border-slate-700";

const cell =
  "px-4 py-2 border-b border-slate-100 " +
  "dark:border-slate-700";

const rowBase =
  "transition hover:bg-blue-50 even:bg-white odd:bg-slate-50 " +
  "dark:hover:bg-slate-800/70 dark:even:bg-slate-900 dark:odd:bg-slate-800";

const inputBase =
  "w-full rounded-md border px-2 py-1 text-sm " +
  "bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 " +
  "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 " +
  "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-700 " +
  "dark:focus:ring-sky-500/40 dark:focus:border-sky-500";

const OTCard: React.FC<Props> = ({
  otRules,
  setOTRules,
  setupMatrix,
  setSetupMatrix,
  isEditing,
  toBool,
}) => {
  // ป้องกัน otRules เป็น null
  if (!otRules) {
    return <p>Loading OT rules...</p>;
  }

  return (
    <section
      id="ot"
      className="scroll-mt-24 mt-4 rounded-2xl border p-4 shadow-sm
                 bg-white border-slate-200
                 dark:bg-slate-900 dark:border-slate-700"
    >
      <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
        OT Rules / Setup Time / Buffer
      </h2>

      <fieldset
        disabled={!isEditing}
        className={!isEditing ? "select-none opacity-80" : ""}
      >
        {/* ---- Rules Form ---- */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3">
            <span className="w-48 text-sm text-slate-700 dark:text-slate-300">
              OT Daily Cap (hours)
            </span>
            <input
              type="number"
              min={0}
              step={0.5}
              className={`${inputBase} w-32`}
              value={otRules.daily_cap_hours}
              onChange={(e) =>
                setOTRules({
                  ...otRules,
                  daily_cap_hours: Number(e.target.value) || 0,
                })
              }
            />
          </label>

          <label className="flex items-center gap-3">
            <span className="w-48 text-sm text-slate-700 dark:text-slate-300">
              Allow Weekend OT
            </span>
            <select
              className={`${inputBase} w-40`}
              value={String(otRules.allow_weekend_ot)}
              onChange={(e) =>
                setOTRules({
                  ...otRules,
                  allow_weekend_ot: toBool(e.target.value),
                })
              }
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="flex items-center gap-3">
            <span className="w-48 text-sm text-slate-700 dark:text-slate-300">
              Default Setup (min)
            </span>
            <input
              type="number"
              min={0}
              step={1}
              className={`${inputBase} w-32`}
              value={otRules.default_setup_min}
              onChange={(e) =>
                setOTRules({
                  ...otRules,
                  default_setup_min: Number(e.target.value) || 0,
                })
              }
            />
          </label>

          <label className="flex items-center gap-3">
            <span className="w-48 text-sm text-slate-700 dark:text-slate-300">
              Default Buffer before Due (min)
            </span>
            <input
              type="number"
              min={0}
              step={5}
              className={`${inputBase} w-32`}
              value={otRules.default_buffer_min}
              onChange={(e) =>
                setOTRules({
                  ...otRules,
                  default_buffer_min: Number(e.target.value) || 0,
                })
              }
            />
          </label>
        </div>

        <hr className="my-6 border-slate-200 dark:border-slate-700" />

        {/* ---- Setup Matrix ---- */}
        <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Setup Matrix (product → product)
        </h3>
        <div className="overflow-auto rounded-md border border-slate-200 dark:border-slate-700">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
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
                <tr key={`${r.from}-${r.to}-${i}`} className={rowBase}>
                  <td className={cell}>
                    <input
                      className={inputBase}
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
                      className={inputBase}
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
                      className={inputBase}
                      value={r.setup_min}
                      onChange={(e) =>
                        setSetupMatrix(
                          setupMatrix.map((x, j) =>
                            j === i
                              ? { ...x, setup_min: Number(e.target.value) || 0 }
                              : x
                          )
                        )
                      }
                    />
                  </td>
                  {isEditing && (
                    <td className={`${cell} text-center`}>
                      <button
                        className="p-1 text-rose-600 hover:text-rose-700 focus:outline-none
                                   dark:text-rose-400 dark:hover:text-rose-300"
                        onClick={() =>
                          setSetupMatrix(setupMatrix.filter((_, j) => j !== i))
                        }
                        title="Remove rule"
                        type="button"
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
              className="inline-flex items-center gap-1 text-sm font-medium
                         text-blue-600 hover:text-blue-700
                         dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() =>
                setSetupMatrix([
                  ...setupMatrix,
                  { from: "", to: "", setup_min: 10 },
                ])
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
