type RingProps = {
  size?: number; // px
  stroke?: number;
  percent: number; // 0..100
  color?: string; // tailwind HEX, e.g. #10b981
  label?: string;
};

export default function ProgressRing({ size = 96, stroke = 8, percent, color = "#10b981", label }: RingProps) {
  const r = (size/2) - stroke;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - percent / 100);
  const center = size/2;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="progress-ring" width={size} height={size}>
        <circle cx={center} cy={center} r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="transparent" />
        <circle
          cx={center}
          cy={center}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          className="progress-ring-circle"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{label ?? `${percent}%`}</span>
      </div>
    </div>
  );
}
