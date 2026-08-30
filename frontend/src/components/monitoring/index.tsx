import { average } from '../common';
import { Sparkline } from '../charts';

export function MetricTile({
  label,
  value,
  tone,
  sparkline,
}: {
  label: string;
  value: string;
  tone: 'violet' | 'cyan' | 'amber' | 'emerald' | 'red';
  sparkline?: number[];
}) {
  const toneStyles: Record<'violet' | 'cyan' | 'amber' | 'emerald' | 'red', string> = {
    violet: 'from-violet-500/18 to-fuchsia-500/10 text-violet-100',
    cyan: 'from-sky-500/18 to-cyan-500/10 text-sky-100',
    amber: 'from-orange-500/18 to-amber-500/10 text-amber-100',
    emerald: 'from-emerald-500/18 to-green-500/10 text-emerald-100',
    red: 'from-red-500/18 to-rose-500/10 text-red-100',
  };

  return (
    <div className={`rounded-[1.5rem] border border-white/10 bg-gradient-to-br ${toneStyles[tone]} p-4`}>
      <div className="text-xs uppercase tracking-[0.25em] text-white/55">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
      {sparkline ? <Sparkline values={sparkline} /> : null}
    </div>
  );
}

export function trendAverage(values: number[]) {
  return Math.round(average(values));
}

