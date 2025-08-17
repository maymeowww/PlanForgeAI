type Props = {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: "primary" | "success" | "warning" | "danger" | "ai";
};

export default function KpiCard({ title, value, subtitle, icon, accent = "primary" }: Props) {
  const accentClass = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    danger: "text-danger bg-danger/10",
    ai: "text-ai bg-ai/10",
  }[accent];
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 kpi-card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 ${accentClass} rounded-lg flex items-center justify-center`}>
            <span className="text-xl">{icon}</span>
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
