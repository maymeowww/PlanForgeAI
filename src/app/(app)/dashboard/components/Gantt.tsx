"use client";
import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";

/** ====== TYPES ====== */
type Tone = "blue" | "emerald" | "amber" | "rose" | "slate";
type Bar = {
  startH: number;      // ชั่วโมงเริ่ม (0–24)
  durH: number;        // ระยะเวลา (ชั่วโมง)
  tone: Tone;
  text: string;
  meta?: string;       // shown in tooltip
};
type Row = { label: string; bars: Bar[] };

/** ====== DATA (By Machine) ====== */
const rows: Row[] = [
  {
    label: "MC-01",
    bars: [
      { startH: 1, durH: 2.5, tone: "blue", text: "ORD-1001 (A)" },
      { startH: 3.6, durH: 2.2, tone: "emerald", text: "ORD-1007 (B)" },
      { startH: 6.0, durH: 1.0, tone: "amber", text: "Setup" },
    ],
  },
  {
    label: "MC-02",
    bars: [
      { startH: 0.0, durH: 1.8, tone: "rose", text: "ORD-1012 (Rush)" },
      { startH: 2.2, durH: 3.0, tone: "blue", text: "ORD-1005" },
    ],
  },
  { label: "MC-03", bars: [{ startH: 5.0, durH: 3.2, tone: "emerald", text: "ORD-1002" }] },
];

/** ====== STYLE MAP ====== */
const toneBg: Record<Tone, string> = {
  blue: "bg-blue-600/90",
  emerald: "bg-emerald-600/90",
  amber: "bg-amber-500/90",
  rose: "bg-rose-600/90",
  slate: "bg-slate-500/90",
};

/** ====== HELPERS ====== */
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const hh = (n: number) => String(Math.floor(n)).padStart(2, "0");
const mm = (n: number) => String(Math.round((n % 1) * 60)).padStart(2, "0");
const fmtHM = (hr: number) => `${hh(hr)}:${mm(hr)}`;

/** ====== COMPONENT ====== */
export default function GanttSection() {
  // zoom: px per hour (min 40, max 240)
  const [pxPerHour, setPxPerHour] = useState(96);
  const minPx = 40, maxPx = 240;

  // visible range (0–24h), allow future ext.
  const hours = 24;

  // refs for pan/zoom focus
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // calc full width in px
  const trackW = useMemo(() => Math.ceil(hours * pxPerHour), [hours, pxPerHour]);

  // Ctrl + wheel to zoom toward cursor
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();

    const el = scrollerRef.current;
    if (!el) return;

    const { left } = el.getBoundingClientRect();
    const cursorX = e.clientX - left + el.scrollLeft; // absolute x within content
    const hrAtCursorBefore = cursorX / pxPerHour;

    const next = clamp(pxPerHour * (e.deltaY < 0 ? 1.1 : 0.9), minPx, maxPx);
    setPxPerHour(next);

    // keep same hour under cursor after zoom
    requestAnimationFrame(() => {
      el.scrollLeft = hrAtCursorBefore * next - (e.clientX - left);
    });
  }, [pxPerHour]);

  // Buttons zoom
  const zoomIn  = () => setPxPerHour((v) => clamp(v * 1.15, minPx, maxPx));
  const zoomOut = () => setPxPerHour((v) => clamp(v / 1.15, minPx, maxPx));
  const zoomFit = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const usable = el.clientWidth - 140; // minus label col (sticky)
    const fit = clamp(usable / hours, minPx, maxPx);
    setPxPerHour(fit);
  };

  // Current time line (optional: use real time)
  const [nowH, setNowH] = useState<number>(() => {
    const d = new Date();
    return d.getHours() + d.getMinutes() / 60;
  });
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setNowH(d.getHours() + d.getMinutes() / 60);
    }, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // grid background CSS (major: 1h, minor: 15m when zoomed in)
  const gridStyle: React.CSSProperties = useMemo(() => {
    const major = pxPerHour;            // 1h
    const minor = pxPerHour / 4;        // 15m
    const showMinor = pxPerHour >= 100; // threshold
    const layers = [
      `linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px) ${major}px 100%`,
      showMinor
        ? `,linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px) ${minor}px 100%`
        : "",
    ].join("");
    return {
      backgroundImage: layers,
      backgroundSize: showMinor ? `${major}px 100%, ${minor}px 100%` : `${major}px 100%`,
    };
  }, [pxPerHour]);

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-800 shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">แผนการผลิต (Gantt)</h2>
        <div className="flex items-center gap-2">
          <button onClick={zoomOut} className="rounded-md px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100">–</button>
          <input
            type="range"
            min={minPx}
            max={maxPx}
            step={1}
            value={pxPerHour}
            onChange={(e) => setPxPerHour(Number(e.target.value))}
            className="w-40 accent-blue-500"
            title="Zoom"
          />
          <button onClick={zoomIn} className="rounded-md px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100">+</button>
          <button onClick={zoomFit} className="rounded-md px-2 py-1 text-xs bg-blue-600 text-white">Fit</button>
        </div>
      </div>

      {/* Time header */}
      <div className="overflow-x-auto" onWheel={onWheel} ref={scrollerRef}>
        <div className="min-w-[720px]">
          <TimeHeader hours={hours} pxPerHour={pxPerHour} />
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {rows.map((r) => (
              <GanttRow key={r.label} row={r} pxPerHour={pxPerHour} trackW={trackW} gridStyle={gridStyle} nowH={nowH} />
            ))}
          </div>
        </div>
      </div>

      <Legend />
    </section>
  );
}

/** ====== SUB-COMPONENTS ====== */

function TimeHeader({ hours, pxPerHour }: { hours: number; pxPerHour: number }) {
  const labels = Array.from({ length: hours + 1 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
  return (
    <div className="sticky top-0 z-10 grid"
         style={{ gridTemplateColumns: `140px ${hours * pxPerHour}px` }}>
      <div className="bg-white dark:bg-slate-800" />
      <div className="relative bg-white dark:bg-slate-800">
        {/* hour labels */}
        {labels.map((t, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 text-xs text-slate-500 dark:text-slate-400"
            style={{ left: i * pxPerHour }}
          >
            {t}
          </div>
        ))}
        <div className="h-8" />
      </div>
    </div>
  );
}

function GanttRow({
  row,
  pxPerHour,
  trackW,
  gridStyle,
  nowH,
}: {
  row: Row;
  pxPerHour: number;
  trackW: number;
  gridStyle: React.CSSProperties;
  nowH: number;
}) {
  return (
    <div
      className="grid items-stretch relative"
      style={{ gridTemplateColumns: `140px ${trackW}px` }}
    >
      {/* Label (sticky) */}
      <div className="px-3 py-3 text-sm font-medium sticky left-0 z-10 bg-white dark:bg-slate-800">
        {row.label}
      </div>

      {/* Track */}
      <div className="relative" style={gridStyle}>
        <div className="h-12" />

        {/* Current time line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-rose-400/80"
          style={{ left: nowH * pxPerHour }}
          title={`Now ${fmtHM(nowH)}`}
        />

        {/* Bars */}
        {row.bars.map((b, i) => (
          <div
            key={i}
            className={`group absolute top-2 h-8 rounded-md text-white text-xs px-2 flex items-center gap-2 shadow ${toneBg[b.tone]}`}
            style={{
              left: b.startH * pxPerHour,
              width: Math.max(6, b.durH * pxPerHour),
            }}
            title={`${b.text} • ${fmtHM(b.startH)}–${fmtHM(b.startH + b.durH)} • ${b.durH.toFixed(2)}h`}
          >
            <span className="truncate">{b.text}</span>
            {/* tooltip */}
            <span className="pointer-events-none absolute -top-7 left-2 hidden whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[11px] text-white shadow group-hover:block">
              {fmtHM(b.startH)}–{fmtHM(b.startH + b.durH)} ({b.durH.toFixed(2)}h)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="px-4 pb-4 mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
      <span className="inline-flex items-center gap-1"><i className="inline-block w-3 h-3 rounded bg-blue-600" /> ปกติ</span>
      <span className="inline-flex items-center gap-1"><i className="inline-block w-3 h-3 rounded bg-emerald-600" /> ต่อเนื่อง</span>
      <span className="inline-flex items-center gap-1"><i className="inline-block w-3 h-3 rounded bg-amber-500" /> Setup</span>
      <span className="inline-flex items-center gap-1"><i className="inline-block w-3 h-3 rounded bg-rose-600" /> เร่งด่วน</span>
    </div>
  );
}
