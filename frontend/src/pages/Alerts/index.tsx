import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, EmptyStateMini, SectionCard } from '../../components/common';
import { AlertPriority, AlertRow } from '../../components/alerts';
import { DataTable } from '../../components/logs';
import { MetricTile } from '../../components/monitoring';
import { useWorkspaceData } from '../../hooks/useWorkspaceData';

export function AlertsPage() {
  const data = useWorkspaceData();
  const incidents = data.incidents;

  return (
    <div className="space-y-5">
      <SectionCard title="Alerts" subtitle="Detect, prioritize and respond to critical events in real time">
        <div className="grid gap-4 xl:grid-cols-6">
          <MetricTile label="Critical Alerts" value={String(incidents.filter((item) => item.severity === 'critical').length)} tone="red" />
          <MetricTile label="Warning Alerts" value={String(incidents.filter((item) => item.severity === 'warning').length)} tone="amber" />
          <MetricTile label="Info Alerts" value={String(incidents.filter((item) => item.severity === 'info').length)} tone="cyan" />
          <MetricTile label="Resolved Alerts" value={String(incidents.filter((item) => item.status === 'resolved').length)} tone="emerald" />
          <MetricTile label="Total Alerts" value={String(incidents.length)} tone="violet" />
          <MetricTile label="MTTR" value="--" tone="cyan" />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.7fr_0.95fr]">
          <Card title="Alerts by severity" subtitle="Live incident distribution">
            {incidents.length ? <div className="space-y-3">{(['critical', 'warning', 'info'] as const).map((severity) => <div key={severity} className="flex justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"><span className="capitalize">{severity}</span><span className="font-semibold">{incidents.filter((item) => item.severity === severity).length}</span></div>)}</div> : <EmptyStateMini text="No alert data received yet." />}
          </Card>
          <Card title="Active alerts by priority" subtitle="Fast-response queue">
            <div className="space-y-3">
              {(['critical', 'warning', 'info'] as const).map((severity) => (
                <AlertPriority key={severity} label={`${severity[0].toUpperCase()}${severity.slice(1)} priority`} count={incidents.filter((item) => item.severity === severity && item.status !== 'resolved').length} tone={severity} />
              ))}
              <Link to="/dashboard/devices" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-500">
                View all active alerts
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <Card title="Alert list" subtitle="Recent incidents from the backend">
            {incidents.length > 0 ? <DataTable rows={incidents.slice(0, 10)} alertMode /> : <EmptyStateMini text="No incidents received yet." />}
          </Card>
        </div>
      </SectionCard>
    </div>
  );
}

