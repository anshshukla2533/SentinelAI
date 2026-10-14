import { Card, SectionCard } from '../../components/common';
import { MachineRegistrationPanel } from '../../components/device/MachineRegistrationPanel';
import { useWorkspaceData } from '../../hooks/useWorkspaceData';

export function AddSystemPage() {
  const data = useWorkspaceData();

  return (
    <div className="space-y-5">
      <SectionCard title="Add System" subtitle="Register a machine, create its machine code, and install the Sentinel agent">
        <Card title="Machine setup" subtitle="The generated machine code is scoped to your account and this device">
          <MachineRegistrationPanel machines={data.machines} />
        </Card>
      </SectionCard>
    </div>
  );
}
