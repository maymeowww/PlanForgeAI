"use client";

import React from "react";
import clsx from "clsx";

type StatusType = "success" | "warning" | "danger";

interface MachineStatus {
  id: string;
  line: string;
  description: string;
  rate: string;
  oee: string;
  status: StatusType;
  statusText: string;
  extra: string;
}

interface Props {
  title?: string;
  machines: MachineStatus[];
}

const statusClasses: Record<StatusType, string> = {
  success: "bg-green-50 border-green-200 text-green-600",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-600",
  danger: "bg-red-50 border-red-200 text-red-600",
};

const indicatorClasses: Record<StatusType, string> = {
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500 animate-pulse",
};

export default function MachineStatusCard({ title = "Machine Status", machines }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      <div className="space-y-4">
        {machines.map((m) => (
          <div
            key={m.id}
            className={clsx(
              "flex items-center justify-between p-4 rounded-lg border",
              statusClasses[m.status]
            )}
          >
            {/* Left side */}
            <div className="flex items-center space-x-3">
              <div
                className={clsx("w-3 h-3 rounded-full status-indicator", indicatorClasses[m.status])}
              />
              <div>
                <h4 className="font-medium text-gray-900">{m.line}</h4>
                <p className="text-sm text-gray-600">
                  {m.description} • {m.rate} • OEE: {m.oee}
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="text-right">
              <p className={clsx("text-sm font-medium", statusClasses[m.status].split(" ")[2])}>
                {m.statusText}
              </p>
              <p className="text-xs text-gray-500">{m.extra}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}