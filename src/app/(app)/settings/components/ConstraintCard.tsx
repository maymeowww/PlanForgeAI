import React from "react";

type Constraints = {
  enforce_maintenance: boolean;
  enforce_material_ready: boolean;
  material_ready_offset_min: number;
  freeze_window_min: number;
};

type Props = {
  constraints: Constraints;
  setConstraints: React.Dispatch<React.SetStateAction<Constraints>>;
  isEditing: boolean;
  toBool: (val: string) => boolean;
};

const ConstraintCard: React.FC<Props> = ({
  constraints,
  setConstraints,
  isEditing,
  toBool,
}) => {
  return (
    <section
      id="constraints"
      className="scroll-mt-24 bg-white border rounded-2xl shadow-sm p-4 mt-4"
    >
      <h2 className="text-lg font-semibold mb-4">
        Constraints (Maintenance, Material Ready)
      </h2>

      <fieldset disabled={!isEditing} className={!isEditing ? "opacity-80 select-none" : ""}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3">
            <span className="w-56 text-sm">Enforce Maintenance Windows</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-1 w-40 text-sm"
              value={String(constraints.enforce_maintenance)}
              onChange={(e) =>
                setConstraints({
                  ...constraints,
                  enforce_maintenance: toBool(e.target.value),
                })
              }
              disabled={!isEditing}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="flex items-center gap-3">
            <span className="w-56 text-sm">Enforce Material Ready</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-1 w-40 text-sm"
              value={String(constraints.enforce_material_ready)}
              onChange={(e) =>
                setConstraints({
                  ...constraints,
                  enforce_material_ready: toBool(e.target.value),
                })
              }
              disabled={!isEditing}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="flex items-center gap-3">
            <span className="w-56 text-sm">Material Ready Offset (min)</span>
            <input
              type="number"
              min={0}
              step={5}
              className="rounded-md border border-slate-300 px-3 py-1 w-32 text-sm"
              value={constraints.material_ready_offset_min}
              onChange={(e) =>
                setConstraints({
                  ...constraints,
                  material_ready_offset_min: Number(e.target.value) || 0,
                })
              }
              disabled={!isEditing}
            />
          </label>

          <label className="flex items-center gap-3">
            <span className="w-56 text-sm">Freeze Window (min)</span>
            <input
              type="number"
              min={0}
              step={5}
              className="rounded-md border border-slate-300 px-3 py-1 w-32 text-sm"
              value={constraints.freeze_window_min}
              onChange={(e) =>
                setConstraints({
                  ...constraints,
                  freeze_window_min: Number(e.target.value) || 0,
                })
              }
              disabled={!isEditing}
            />
          </label>
        </div>
      </fieldset>
    </section>
  );
};

export default ConstraintCard;
