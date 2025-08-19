type SegmentOption = {
  label: string;
  value: "users" | "groups";
};

type Props = {
  value: "users" | "groups";
  onChange: (v: "users" | "groups") => void;
};

const options: SegmentOption[] = [
  { label: "Users", value: "users" },
  { label: "Groups & Permissions", value: "groups" },
];

export default function Segment({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            value === opt.value
              ? "bg-slate-100 text-slate-900"
              : "text-slate-600 hover:bg-slate-50"
          }`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
