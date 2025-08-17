import SectionCard from "./SectionCard";

export default function ActiveAlarms() {
  return (
    <SectionCard title="Active Alarms">
      <div className="space-y-3">
        <div className="flex items-start space-x-3 p-3 bg-danger/5 rounded-lg border border-danger/20">
          <div className="w-2 h-2 bg-danger rounded-full mt-2 alarm-blink" />
          <div className="flex-1">
            <h4 className="font-medium text-danger">Line C - Material Jam</h4>
            <p className="text-sm text-gray-600">Packaging line stopped due to material jam</p>
            <p className="text-xs text-gray-500">Started: 14:23 • Duration: 12 min</p>
          </div>
          <button className="text-xs bg-danger text-white px-2 py-1 rounded hover:bg-red-600">Acknowledge</button>
        </div>

        <div className="flex items-start space-x-3 p-3 bg-warning/5 rounded-lg border border-warning/20">
          <div className="w-2 h-2 bg-warning rounded-full mt-2" />
          <div className="flex-1">
            <h4 className="font-medium text-warning">Line B - Low Efficiency</h4>
            <p className="text-sm text-gray-600">Performance below 70% threshold</p>
            <p className="text-xs text-gray-500">Started: 13:45 • Duration: 50 min</p>
          </div>
          <button className="text-xs bg-warning text-white px-2 py-1 rounded hover:bg-yellow-600">Investigate</button>
        </div>

        <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="w-2 h-2 bg-primary rounded-full mt-2" />
          <div className="flex-1">
            <h4 className="font-medium text-primary">Maintenance Due</h4>
            <p className="text-sm text-gray-600">Line A scheduled maintenance in 2 hours</p>
            <p className="text-xs text-gray-500">Scheduled: 16:30 • Duration: 30 min</p>
          </div>
          <button className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-blue-600">Schedule</button>
        </div>
      </div>
    </SectionCard>
  );
}
