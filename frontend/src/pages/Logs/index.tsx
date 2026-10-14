import { Card, EmptyStateMini, SectionCard } from '../../components/common';
import { DataTable } from '../../components/logs';
import { MetricTile } from '../../components/monitoring';
import { useWorkspaceData } from '../../hooks/useWorkspaceData';

export function LogsPage() {
  const data = useWorkspaceData();
  const logs = data.logs;

  return (
    <div className="space-y-5">
      <SectionCard title="Logs" subtitle="View and analyze all system logs in real time">
        <div className="grid gap-4 xl:grid-cols-5">
          <MetricTile label="Total Logs" value={String(logs.length)} tone="violet" />
          <MetricTile label="Critical" value={String(logs.filter((item) => item.level === 'critical').length)} tone="red" />
          <MetricTile label="Warning" value={String(logs.filter((item) => item.level === 'warning').length)} tone="amber" />
          <MetricTile label="Info" value={String(logs.filter((item) => item.level === 'info').length)} tone="cyan" />
          <MetricTile label="Unique Devices" value={String(new Set(logs.map((item) => item.machine_id).filter(Boolean)).size)} tone="emerald" />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.95fr]">
          <Card title="Logs by severity" subtitle="Live log distribution">
            {logs.length ? <div className="space-y-3">{(['critical', 'warning', 'error', 'info', 'debug'] as const).map((level) => <div key={level} className="flex justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"><span className="capitalize">{level}</span><span className="font-semibold">{logs.filter((item) => item.level === level).length}</span></div>)}</div> : <EmptyStateMini text="No log data received yet." />}
          </Card>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <Card title="Recent logs" subtitle="Latest entries from the backend">
            {logs.length > 0 ? <DataTable rows={logs.slice(0, 10)} /> : <EmptyStateMini text="No logs received yet." />}
          </Card>
        </div>
      </SectionCard>
    </div>
  );
}

