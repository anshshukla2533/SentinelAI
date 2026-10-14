import { Card, EmptyStateMini, SectionCard } from '../../components/common';
import { DeviceTable } from '../../components/device';
import { MetricTile } from '../../components/monitoring';
import { useWorkspaceData } from '../../hooks/useWorkspaceData';

export function DevicesPage() {
  const data = useWorkspaceData();

  return (
    <div className="space-y-5">
      <SectionCard title="Devices" subtitle="View and manage all monitored machines">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricTile label="Total Devices" value={String(data.machines.length)} tone="violet" />
          <MetricTile label="Online" value={String(data.machines.filter((machine) => machine.last_seen_at && Date.now() - new Date(machine.last_seen_at).getTime() <= 30000).length)} tone="emerald" />
          <MetricTile label="Offline" value={String(data.machines.filter((machine) => !machine.last_seen_at || Date.now() - new Date(machine.last_seen_at).getTime() > 30000).length)} tone="amber" />
          <MetricTile label="Critical" value={String(data.incidents.filter((incident) => incident.severity === 'critical').length)} tone="red" />
          <MetricTile label="Maintenance" value={String(data.machines.filter((machine) => machine.status === 'warning').length)} tone="cyan" />
        </div>

      </SectionCard>

      <Card title="Device roster" subtitle="Live and historical machine records from the backend">
        {data.services.length > 0 ? <DeviceTable services={data.services} /> : <EmptyStateMini text="No real device telemetry received yet." />}
      </Card>
    </div>
  );
}
