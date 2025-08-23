import React from "react";

const accentColors: Record<string, { bg: string; text: string }> = {
  danger: { bg: "bg-red-100", text: "text-red-600" },
  success: { bg: "bg-green-100", text: "text-green-600" },
  warning: { bg: "bg-yellow-100", text: "text-yellow-600" },
  primary: { bg: "bg-blue-100", text: "text-blue-600" },
  ai: { bg: "bg-indigo-100", text: "text-indigo-600" }, 
};

export default function Card({
  icon,
  title,
  value,
  subtitle,
  accent = "primary",
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  accent?: keyof typeof accentColors;
}) {
  const colors = accentColors[accent] || accentColors.primary;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 kpi-card">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${colors.bg} rounded-lg w-10 h-10 flex items-center justify-center`}>
          <span className={`${colors.text} text-xl`}>{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className={`text-sm ${colors.text}`}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
