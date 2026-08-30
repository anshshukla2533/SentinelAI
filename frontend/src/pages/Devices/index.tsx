import { useState } from 'react';
import { CheckMarkIcon, Card, Field, SectionCard, SuccessBanner, demoServices } from '../../components/common';
import { DeviceTable } from '../../components/device';
import { MetricTile } from '../../components/monitoring';
import { useAuth } from '../../auth';
import { useWorkspaceData } from '../../hooks/useWorkspaceData';

export function DevicesPage() {
  const { user } = useAuth();
  const data = useWorkspaceData();
  const [created, setCreated] = useState(false);
  const [hostname, setHostname] = useState('server-1');

  return (
    <div className="space-y-5">
      <SectionCard title="Devices" subtitle="View and manage all monitored machines">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricTile label="Total Devices" value={String(data.services.length || 134)} tone="violet" />
          <MetricTile label="Online" value={String(data.services.filter((s) => s.status === 'healthy').length || 128)} tone="emerald" />
          <MetricTile label="Offline" value={String(data.services.filter((s) => s.status === 'critical').length || 6)} tone="amber" />
          <MetricTile label="Critical" value={String(data.incidents.filter((incident) => incident.severity === 'critical').length || 3)} tone="red" />
          <MetricTile label="Maintenance" value={String(data.services.filter((s) => s.status === 'warning').length || 2)} tone="cyan" />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <Card title="Create project / API key" subtitle="This button confirms the project and reveals the key for your agent">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Project name" value={hostname} onChange={setHostname} />
                <Field label="API key" value={user?.registration_token ?? 'sk_live_placeholder'} readOnly />
              </div>
              <button
                type="button"
                onClick={() => setCreated(true)}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:translate-y-[-1px]"
              >
                {created ? 'Project created' : 'Create project / API key'}
                <CheckMarkIcon ready={created} />
              </button>
              {created ? (
                <SuccessBanner
                  title="Project created"
                  text={`API key generated for ${hostname}. Copy it into the agent installer on the target device.`}
                />
              ) : null}
            </div>
          </Card>

          <Card title="Install the agent" subtitle="Download the executable and bind it to the new API key">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75">
                Download the agent SDK from the dashboard, then enter the API key during setup.
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Host name" value={hostname} readOnly />
                <Field label="Installation state" value={created ? 'Ready to install' : 'Create a project first'} readOnly />
              </div>
            </div>
          </Card>
        </div>
      </SectionCard>

      <Card title="Device roster" subtitle="Live and historical machine records from the backend">
        <DeviceTable services={data.services.length > 0 ? data.services : demoServices()} />
      </Card>
    </div>
  );
}

