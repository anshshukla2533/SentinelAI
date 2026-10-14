import { Card, EmptyStateMini, KeyValueRow, SectionCard, average } from '../../components/common';
import { DonutChart } from '../../components/charts';
import { DeviceUsageList } from '../../components/device';
import { MetricTile } from '../../components/monitoring';
import { AlertRow } from '../../components/alerts';
import { useWorkspaceData } from '../../hooks/useWorkspaceData';

export function MonitoringPage() {
  const data = useWorkspaceData();
  const services = data.services;
  const cpuSeries = data.metrics.map((metric) => metric.cpu);
  const memorySeries = data.metrics.map((metric) => metric.memory);
  const diskSeries = data.metrics.map((metric) => metric.disk).filter((value): value is number => typeof value === 'number');
  const networkIn = data.metrics.reduce((total, metric) => total + (metric.network_recv ?? 0), 0);
  const networkOut = data.metrics.reduce((total, metric) => total + (metric.network_sent ?? 0), 0);
  const loadAverage = data.metrics.length ? average(data.metrics.map((metric) => metric.load_average ?? 0)) : null;

  return (
    <div className="space-y-5">
      <SectionCard title="Monitoring" subtitle="Real-time system metrics and performance monitoring">
        <div className="grid gap-4 xl:grid-cols-6">
          <MetricTile label="Average CPU" value={cpuSeries.length ? `${Math.round(average(cpuSeries))}%` : '--'} tone="violet" sparkline={cpuSeries} />
          <MetricTile label="Average Memory" value={memorySeries.length ? `${Math.round(average(memorySeries))}%` : '--'} tone="cyan" sparkline={memorySeries} />
          <MetricTile label="Average Disk" value={diskSeries.length ? `${Math.round(average(diskSeries))}%` : '--'} tone="amber" sparkline={diskSeries} />
          <MetricTile label="Total Network In" value={data.metrics.length ? `${Math.round(networkIn / 1024 / 1024)} MB` : '--'} tone="emerald" />
          <MetricTile label="Total Network Out" value={data.metrics.length ? `${Math.round(networkOut / 1024 / 1024)} MB` : '--'} tone="violet" />
          <MetricTile label="Avg Load Average" value={loadAverage === null ? '--' : loadAverage.toFixed(2)} tone="cyan" />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.85fr_0.8fr]">
          <Card title="CPU utilization (%)" subtitle="Latest received samples">
            {cpuSeries.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{data.metrics.slice(0, 8).map((metric) => <div key={metric.id} className="rounded-xl border border-white/10 bg-white/5 p-3"><div className="text-xs text-white/50">{metric.service_name}</div><div className="mt-2 text-xl font-bold">{metric.cpu}%</div></div>)}</div> : <EmptyStateMini text="No CPU telemetry received yet." />}
          </Card>
          <Card title="System overview" subtitle="Workspace health summary">
            <div className="space-y-3">
              {[
                ['Total Devices', String(services.length)],
                ['Online Devices', String(services.filter((item) => item.status === 'healthy').length)],
                ['Offline Devices', String(services.filter((item) => item.status === 'critical').length)],
                ['Critical Alerts', String(data.incidents.filter((item) => item.severity === 'critical').length)],
                ['Maintenance', String(services.filter((item) => item.status === 'warning').length)],
              ].map(([label, value]) => (
                <KeyValueRow key={label} label={label} value={value} />
              ))}
            </div>
          </Card>
          <Card title="Resource Distribution" subtitle="Overall fleet composition">
            <DonutChart total={services.length} />
          </Card>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <Card title="Recent alerts" subtitle="Issues needing attention">
            <div className="space-y-3">
              {data.incidents.slice(0, 4).map((incident) => (
                <AlertRow key={incident.id} title={incident.title} detail={incident.service_name} tone={incident.severity} />
              ))}
              {data.incidents.length === 0 ? <EmptyStateMini text="No alerts yet. Once your agent starts reporting, this area will light up." /> : null}
            </div>
          </Card>
          <Card title="Top devices by usage" subtitle="Highest resource consumers right now">
            <DeviceUsageList services={services.slice(0, 5)} />
          </Card>
        </div>
      </SectionCard>
    </div>
  );
}

