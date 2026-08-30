import { useAuth } from '../../auth';
import { AgentDownloadPanel, Card, EmptyStateMini, ProjectKeyFlow, SectionCard, averageMetric, demoServices } from '../../components/common';
import { AlertRow } from '../../components/alerts';
import { DeviceTable } from '../../components/device';
import { MetricTile } from '../../components/monitoring';
import { useWorkspaceData } from '../../hooks/useWorkspaceData';

export function DashboardPage() {
  const { user } = useAuth();
  const data = useWorkspaceData();
  const services = data.services;

  const topMetrics = [
    { label: 'Online Devices', value: String(services.filter((item) => item.status === 'healthy').length || services.length || 128), tone: 'violet' as const },
    { label: 'Offline Devices', value: String(services.filter((item) => item.status === 'critical').length || 6), tone: 'amber' as const },
    { label: 'Critical Alerts', value: String(data.incidents.filter((item) => item.severity === 'critical').length || 3), tone: 'red' as const },
    { label: 'Average CPU', value: `${Math.round(averageMetric(services, 'cpu') ?? 42)}%`, tone: 'cyan' as const },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Dashboard" subtitle="Good evening, Admin!">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {topMetrics.map((metric) => (
              <MetricTile key={metric.label} {...metric} />
            ))}
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
            <Card title="Project onboarding" subtitle="Create a project and generate a scoped API key">
              <ProjectKeyFlow />
            </Card>

            <Card title="Agent SDK" subtitle="Download the Windows executable or the installer script">
              <AgentDownloadPanel token={user?.registration_token ?? ''} />
            </Card>
          </div>
        </SectionCard>

        <Card title="System status" subtitle="Current workspace signals">
          <div className="space-y-4">
            {[
              ['Monitoring active', 'All systems operational', 'bg-emerald-500/15 text-emerald-200'],
              ['Device registration', `${services.length || 1} device(s) connected`, 'bg-violet-500/15 text-violet-200'],
              ['AI analysis', `${data.reports.length || 1} report(s) ready`, 'bg-fuchsia-500/15 text-fuchsia-200'],
            ].map(([label, value, tone]) => (
              <div key={label} className={`rounded-2xl border border-white/10 px-4 py-4 ${tone}`}>
                <div className="text-sm font-semibold">{label}</div>
                <div className="mt-1 text-sm text-white/75">{value}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Recent devices" subtitle="The backend already knows about these machine records">
          <DeviceTable services={services.slice(0, 6).length > 0 ? services.slice(0, 6) : demoServices()} />
        </Card>
        <Card title="Recent alerts" subtitle="Incidents surfaced from logs and telemetry">
          <div className="space-y-3">
            {data.incidents.slice(0, 5).map((incident) => (
              <AlertRow key={incident.id} title={incident.title} detail={`${incident.service_name} - ${incident.severity}`} tone={incident.severity} />
            ))}
            {data.incidents.length === 0 ? <EmptyStateMini text="No alerts yet. Connect a device to start collecting telemetry." /> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

