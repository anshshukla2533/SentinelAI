import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, DetailCard, SectionCard, SuccessBanner, demoIncidents } from '../../components/common';
import { BarsChart, DonutChart } from '../../components/charts';
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
          <MetricTile label="Critical Alerts" value={String(incidents.filter((item) => item.severity === 'critical').length || 18)} tone="red" sparkline={[15, 21, 17, 22, 20, 24, 18]} />
          <MetricTile label="Warning Alerts" value={String(incidents.filter((item) => item.severity === 'warning').length || 56)} tone="amber" sparkline={[14, 18, 22, 20, 24, 19, 21]} />
          <MetricTile label="Info Alerts" value={String(incidents.filter((item) => item.severity === 'info').length || 142)} tone="cyan" sparkline={[9, 11, 14, 13, 16, 18, 17]} />
          <MetricTile label="Resolved Alerts" value={String(incidents.filter((item) => item.status === 'resolved').length || 312)} tone="emerald" sparkline={[12, 14, 16, 18, 21, 20, 24]} />
          <MetricTile label="Total Alerts" value={String(incidents.length || 528)} tone="violet" sparkline={[20, 24, 28, 25, 30, 33, 31]} />
          <MetricTile label="MTTR" value="24m 32s" tone="cyan" sparkline={[15, 13, 12, 10, 11, 9, 8]} />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.7fr_0.95fr]">
          <Card title="Alerts over time" subtitle="Trend of critical, warning, and info alerts">
            <BarsChart accent="alerts" />
          </Card>
          <Card title="Alerts by severity" subtitle="Fleet alert distribution">
            <DonutChart total={incidents.length || 528} label="Total Alerts" />
          </Card>
          <Card title="Active alerts by priority" subtitle="Fast-response queue">
            <div className="space-y-3">
              {[
                ['High Priority', 8, 'critical'],
                ['Medium Priority', 19, 'warning'],
                ['Low Priority', 31, 'info'],
              ].map(([label, count, tone]) => (
                <AlertPriority key={label as string} label={label as string} count={Number(count)} tone={tone as string} />
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
            <DataTable rows={incidents.length > 0 ? incidents.slice(0, 10) : demoIncidents()} alertMode />
          </Card>
          <Card title="Alert details" subtitle="Selected incident context">
            <div className="space-y-3">
              <SuccessBanner title="High CPU usage" text="CPU usage on SERVER-02 has crossed the threshold for more than 5 minutes." />
              <DetailCard label="Device" value="SERVER-02 (192.168.1.16)" />
              <DetailCard label="Source" value="System Monitor" />
              <DetailCard label="Alert Type" value="Performance" />
              <DetailCard label="Status" value="Active" />
            </div>
          </Card>
        </div>
      </SectionCard>
    </div>
  );
}

