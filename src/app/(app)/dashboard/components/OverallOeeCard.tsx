// src/components/OverallOeeCard.tsx
import React from "react";
import ProgressRing from "../shared/card/ProgressRingCard";

type OverallOeeCardProps = {
  percent: number;
  target: string;
  difference: string;
};

export default function OverallOeeCard({ percent, target, difference }: OverallOeeCardProps) {
  return (
    <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6 border border-gray-200 kpi-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Overall OEE</h3>
        <div className="text-2xl">📊</div>
      </div>

      <div className="relative w-24 h-24 mx-auto mb-4">
        <ProgressRing radius={48} stroke={8} progress={percent} color="#10b981" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{percent}%</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">{target}</p>
        <p className="text-sm text-yellow-600">{difference}</p>
      </div>
    </div>
  );
}
