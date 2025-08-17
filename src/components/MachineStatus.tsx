import SectionCard from "./SectionCard";

export default function MachineStatus() {
  return (
    <SectionCard title="Machine Status">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-success rounded-full status-indicator" />
            <div>
              <h4 className="font-medium text-gray-900">Line A - Injection Molding</h4>
              <p className="text-sm text-gray-600">Running • 142 pcs/hr • OEE: 78%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-success">Normal</p>
            <p className="text-xs text-gray-500">Temp: 185°C</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-warning/5 rounded-lg border border-warning/20">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-warning rounded-full status-indicator" />
            <div>
              <h4 className="font-medium text-gray-900">Line B - Assembly</h4>
              <p className="text-sm text-gray-600">Running • 98 pcs/hr • OEE: 65%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-warning">Warning</p>
            <p className="text-xs text-gray-500">Low efficiency</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-danger/5 rounded-lg border border-danger/20">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-danger rounded-full alarm-blink" />
            <div>
              <h4 className="font-medium text-gray-900">Line C - Packaging</h4>
              <p className="text-sm text-gray-600">Stopped • 0 pcs/hr • OEE: 0%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-danger">Alarm</p>
            <p className="text-xs text-gray-500">Jam detected</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
