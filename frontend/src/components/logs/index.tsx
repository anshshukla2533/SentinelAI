import { StatusBadge, relativeTime } from '../common';
import type { IncidentRecord, LogRecord } from '../../types';

export function DataTable({ rows, alertMode }: { rows: Array<LogRecord | IncidentRecord>; alertMode?: boolean }) {
  return (
    <div className="overflow-hidden rounded-[1.3rem] border border-white/10">
      <div className="grid grid-cols-[1fr_0.7fr_0.8fr_1.1fr] gap-0 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-white/45">
        <div>{alertMode ? 'Alert' : 'Time'}</div>
        <div>Device</div>
        <div>Severity</div>
        <div>{alertMode ? 'Status' : 'Message'}</div>
      </div>
      <div className="divide-y divide-white/10">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_0.7fr_0.8fr_1.1fr] items-center px-4 py-4 text-sm">
            {'message' in row ? (
              <>
                <div className="text-white/80">{relativeTime(row.created_at)}</div>
                <div className="font-semibold">{row.service_name}</div>
                <StatusBadge status={row.level} />
                <div className="text-white/65">{row.message}</div>
              </>
            ) : (
              <>
                <div className="font-semibold">{row.title}</div>
                <div className="text-white/70">{row.service_name}</div>
                <StatusBadge status={row.severity} />
                <div className="text-white/65">{row.status}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

