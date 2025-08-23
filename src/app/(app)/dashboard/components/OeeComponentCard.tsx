// src/components/OeeComponentCard.tsx
import React from "react";
import ProgressRing from "../shared/card/ProgressRingCard";

type OeeComponentCardProps = {
  percent: number;
  title: string;
  target: string;
  difference: string;
  color: string;
  differenceColorClass: string; // เช่น text-primary, text-warning, text-success
};

export default function OeeComponentCard({
  percent,
  title,
  target,
  difference,
  color,
  differenceColorClass,
}: OeeComponentCardProps) {
  return (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-3">
        <ProgressRing radius={40} stroke={6} progress={percent} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{percent}%</span>
        </div>
      </div>
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600">{target}</p>
      <p className={`text-sm ${differenceColorClass}`}>{difference}</p>
    </div>
  );
}
