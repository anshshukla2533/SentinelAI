import { StatusBadge } from '../common';

export function AlertRow({ title, detail, tone }: { title: string; detail: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">{title}</div>
          <div className="mt-1 text-sm text-white/55">{detail}</div>
        </div>
        <StatusBadge status={tone} />
      </div>
    </div>
  );
}

export function AlertPriority({ label, count, tone }: { label: string; count: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{label}</div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">{count}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-white/10">
        <div
          className={[
            'h-2 rounded-full',
            tone === 'critical' ? 'bg-red-400' : tone === 'warning' ? 'bg-amber-400' : 'bg-sky-400',
          ].join(' ')}
          style={{ width: `${Math.max(20, Math.min(100, count * 3))}%` }}
        />
      </div>
    </div>
  );
}

