import { StatusBadge, UsageBar, relativeTime, randomRange } from '../common';
import type { ServiceSummary } from '../../types';

export function DeviceTable({ services }: { services: ServiceSummary[] }) {
  return (
    <div className="overflow-hidden rounded-[1.3rem] border border-white/10">
      <div className="grid grid-cols-[1.2fr_0.65fr_0.9fr_0.8fr_0.8fr] gap-0 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-white/45">
        <div>Device</div>
        <div>Status</div>
        <div>OS</div>
        <div>CPU / Memory</div>
        <div>Last seen</div>
      </div>
      <div className="divide-y divide-white/10">
        {services.map((service) => (
          <div key={service.id} className="grid grid-cols-[1.2fr_0.65fr_0.9fr_0.8fr_0.8fr] items-center gap-0 px-4 py-4 text-sm">
            <div>
              <div className="font-semibold">{service.name}</div>
              <div className="text-xs text-white/45">{service.hostname ?? 'unknown-host'}</div>
            </div>
            <StatusBadge status={service.status} />
            <div className="text-white/70">{service.latest_metric?.operating_system ?? 'Ubuntu 24.04 LTS'}</div>
            <div className="space-y-2">
              <UsageBar label="CPU" value={service.latest_metric?.cpu ?? randomRange(12, 82)} tone="violet" />
              <UsageBar label="Memory" value={service.latest_metric?.memory ?? randomRange(14, 76)} tone="cyan" />
            </div>
            <div className="text-white/60">{relativeTime(service.last_seen_at ?? service.created_at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeviceUsageList({ services }: { services: ServiceSummary[] }) {
  return (
    <div className="space-y-3">
      {services.map((service, index) => (
        <div key={service.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{service.name}</div>
              <div className="text-xs text-white/45">{service.hostname ?? `host-${index + 1}`}</div>
            </div>
            <div className="text-sm font-semibold text-violet-200">{Math.round(service.latest_metric?.cpu ?? randomRange(12, 94))}%</div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${service.latest_metric?.cpu ?? randomRange(12, 94)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

