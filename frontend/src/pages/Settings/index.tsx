import { Card, SectionCard } from '../../components/common';

export function SettingsPage() {
  return (
    <SectionCard title="Settings" subtitle="Workspace configuration and account controls">
      <Card title="General" subtitle="Placeholder for profile, alerts, and notification preferences">
        <div className="text-sm text-white/60">
          Settings are scaffolded here so the page matches the product structure while backend integration is expanded later.
        </div>
      </Card>
    </SectionCard>
  );
}

