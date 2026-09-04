import { Card, SectionCard, demoServices } from '../../components/common';
import { DeviceTable } from '../../components/device';
import { MetricTile } from '../../components/monitoring';
import { useWorkspaceData } from '../../hooks/useWorkspaceData';

export function DevicesPage() {
  const data = useWorkspaceData();

  return (
    <div className="space-y-5">
      <SectionCard title="Devices" subtitle="View and manage all monitored machines">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricTile label="Total Devices" value={String(data.machines.length || 134)} tone="violet" />
          <MetricTile label="Online" value={String(data.machines.filter((s) => s.status === 'registered').length || 128)} tone="emerald" />
          <MetricTile label="Offline" value={String(data.machines.filter((s) => s.status === 'disabled').length || 6)} tone="amber" />
          <MetricTile label="Critical" value={String(data.incidents.filter((incident) => incident.severity === 'critical').length || 3)} tone="red" />
          <MetricTile label="Maintenance" value={String(data.machines.filter((s) => s.status === 'warning').length || 2)} tone="cyan" />
        </div>

      </SectionCard>

      <Card title="Device roster" subtitle="Live and historical machine records from the backend">
        <DeviceTable services={data.services.length > 0 ? data.services : demoServices()} />
      </Card>
    </div>
  );
}
