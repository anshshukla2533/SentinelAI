import { Card, EmptyStateMini, KeyValueRow, SectionCard, demoServices, average } from '../../components/common';
import { BarsChart, DonutChart, MultiLineChart } from '../../components/charts';
import { DeviceUsageList } from '../../components/device';
import { MetricTile } from '../../components/monitoring';
import { AlertRow } from '../../components/alerts';
import { useWorkspaceData } from '../../hooks/useWorkspaceData';

export function MonitoringPage() {
  const data = useWorkspaceData();
  const services = data.services.length > 0 ? data.services : demoServices();
  const cpuSeries = services.map((service) => service.latest_metric?.cpu ?? 42);
  const memorySeries = services.map((service) => service.latest_metric?.memory ?? 50);
  const diskSeries = services.map((service) => service.latest_metric?.disk ?? 61);

  return (
    <div className="space-y-5">
      <SectionCard title="Monitoring" subtitle="Real-time system metrics and performance monitoring">
        <div className="grid gap-4 xl:grid-cols-6">
          <MetricTile label="Average CPU" value={`${Math.round(average(cpuSeries))}%`} tone="violet" sparkline={cpuSeries} />
          <MetricTile label="Average Memory" value={`${Math.round(average(memorySeries))}%`} tone="cyan" sparkline={memorySeries} />
          <MetricTile label="Average Disk" value={`${Math.round(average(diskSeries))}%`} tone="amber" sparkline={diskSeries} />
          <MetricTile label="Total Network In" value="1.42 TB" tone="emerald" sparkline={[20, 32, 28, 40, 46, 60, 58]} />
          <MetricTile label="Total Network Out" value="892 GB" tone="violet" sparkline={[14, 24, 18, 34, 46, 38, 42]} />
          <MetricTile label="Avg Load Average" value="1.28" tone="cyan" sparkline={[12, 18, 24, 22, 28, 31, 29]} />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.85fr_0.8fr]">
          <Card title="CPU utilization (%)" subtitle="Multi-device trend">
            <MultiLineChart />
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
            <DonutChart total={services.length || 134} />
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

