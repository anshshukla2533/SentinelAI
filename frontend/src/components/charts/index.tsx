import { LegendPill } from '../common';

export function linePoints(values: number[], width: number, height: number) {
  const max = Math.max(...values, 1);
  const stepX = width / Math.max(values.length - 1, 1);
  return values
    .map((value, index) => {
      const x = index * stepX;
      const y = height - (value / max) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');
}

export function Sparkline({ values }: { values: number[] }) {
  return (
    <svg viewBox="0 0 100 28" className="mt-3 h-8 w-full">
      <polyline fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" points={linePoints(values, 100, 28)} />
    </svg>
  );
}

export function SparkMulti({ values }: { values: number[][] }) {
  return (
    <svg viewBox="0 0 100 56" className="h-56 w-full">
      {values.map((series, index) => (
        <polyline
          key={index}
          fill="none"
          stroke={['#8b5cf6', '#22d3ee', '#10b981'][index] ?? '#8b5cf6'}
          strokeWidth="2"
          points={linePoints(series, 100, 56)}
        />
      ))}
    </svg>
  );
}

export function SparkBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="grid h-56 grid-flow-col items-end gap-2">
      {values.map((value, index) => (
        <div key={index} className="flex h-full items-end">
          <div className="w-full rounded-t-lg bg-gradient-to-t from-violet-500 to-fuchsia-400" style={{ height: `${(value / max) * 100}%` }} />
        </div>
      ))}
    </div>
  );
}

export function MultiLineChart() {
  return (
    <div className="space-y-4">
      <SparkMulti
        values={[
          [22, 28, 36, 48, 42, 55, 49, 60, 58, 66, 72, 68, 74, 63, 59, 45, 54, 61, 56, 65],
          [18, 24, 30, 35, 41, 39, 45, 52, 48, 56, 59, 54, 61, 58, 49, 43, 44, 49, 51, 55],
          [14, 16, 22, 24, 28, 33, 31, 37, 41, 38, 43, 40, 45, 42, 36, 30, 32, 35, 31, 34],
        ]}
      />
      <div className="flex flex-wrap gap-3 text-xs text-white/65">
        <LegendPill color="bg-violet-500" label="CPU" />
        <LegendPill color="bg-cyan-500" label="Memory" />
        <LegendPill color="bg-emerald-500" label="Disk" />
      </div>
    </div>
  );
}

export function BarsChart({ accent }: { accent?: string }) {
  const bars = accent === 'alerts'
    ? [20, 28, 24, 26, 22, 30, 34, 32, 38, 45, 41, 36, 30, 28, 26, 29, 33, 31, 27, 25]
    : [14, 18, 12, 16, 15, 22, 20, 26, 30, 33, 29, 27, 23, 24, 28, 26, 20, 18, 19, 21];

  return (
    <div>
      <SparkBars values={bars} />
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/65">
        <LegendPill color="bg-violet-500" label="Critical" />
        <LegendPill color="bg-amber-500" label="Warning" />
        <LegendPill color="bg-sky-500" label="Info" />
      </div>
    </div>
  );
}

export function DonutChart({ total, label }: { total: number; label?: string }) {
  const ring = Math.max(134, total);
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative h-44 w-44 rounded-full"
        style={{
          background: 'conic-gradient(from 90deg, #22c55e 0 42%, #f97316 42% 58%, #ef4444 58% 76%, #8b5cf6 76% 100%)',
        }}
      >
        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-[#0b1224] text-center">
          <div className="text-4xl font-black">{ring}</div>
          <div className="text-sm text-white/55">{label ?? 'Total Devices'}</div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2 text-xs text-white/65">
        <LegendPill color="bg-emerald-500" label="Healthy" />
        <LegendPill color="bg-amber-500" label="Warning" />
        <LegendPill color="bg-red-500" label="Critical" />
        <LegendPill color="bg-violet-500" label="Other" />
      </div>
    </div>
  );
}

