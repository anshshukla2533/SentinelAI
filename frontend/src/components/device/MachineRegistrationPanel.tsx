import { useMemo, useState } from 'react';
import { Check, Copy, Download, Plus, Terminal } from 'lucide-react';
import { API_BASE_URL } from '../../api';
import { useAuth } from '../../auth';
import { createMachine, revokeMachine, rotateMachineKey } from '../../services/machines';
import type { MachineRecord } from '../../types';
import { ConfigRow, Field, SuccessBanner } from '../common';

export function MachineRegistrationPanel({ machines = [] }: { machines?: MachineRecord[] }) {
  const { getToken } = useAuth();
  const [name, setName] = useState('server-1');
  const [hostname, setHostname] = useState('server-1');
  const [createdMachine, setCreatedMachine] = useState<MachineRecord | null>(null);
  const [machineApiKey, setMachineApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const activeApiKey = machineApiKey || 'Create a machine to generate the API key';
  const installCommand = useMemo(() => {
    if (!machineApiKey) {
      return 'sentinel-agent.exe install --server https://api.sentinelai.com --api-key <generated-key> --hostname server-1';
    }
    return `sentinel-agent.exe install --server ${API_BASE_URL} --api-key ${machineApiKey} --hostname ${hostname}`;
  }, [hostname, machineApiKey]);

  const copyCommand = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const copyMachineCode = async () => {
    if (!machineApiKey) return;
    await navigator.clipboard.writeText(machineApiKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      const response = await createMachine({ name, hostname }, token);
      setCreatedMachine(response.machine);
      setMachineApiKey(response.machine_api_key);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : 'Failed to create machine';
      const existingMachine = machines.find((machine) => machine.name === name && machine.hostname === hostname);
      if (message.includes('Machine already exists') && existingMachine) {
        try {
          const token = await getToken();
          const response = await rotateMachineKey(existingMachine.id, token);
          setCreatedMachine(response.machine);
          setMachineApiKey(response.machine_api_key);
          return;
        } catch (rotateError) {
          setError(rotateError instanceof Error ? rotateError.message : 'Failed to reissue machine API key');
        }
      } else {
        setError(message.includes('Machine already exists')
          ? 'This machine already exists. Use Reissue on the registered machine below to generate a new API key.'
          : message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReissue = async (machine: MachineRecord) => {
    try {
      const token = await getToken();
      const response = await rotateMachineKey(machine.id, token);
      setCreatedMachine(response.machine);
      setMachineApiKey(response.machine_api_key);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to reissue machine key');
    }
  };

  const handleRevoke = async (machine: MachineRecord) => {
    try {
      const token = await getToken();
      await revokeMachine(machine.id, token);
      window.location.reload();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to revoke machine');
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Machine name" value={name} onChange={setName} />
        <Field label="Hostname" value={hostname} onChange={setHostname} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCreate}
          disabled={loading}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Plus className="h-4 w-4" />
          {loading ? 'Creating...' : createdMachine ? 'Create another machine' : 'Create project / API key'}
        </button>
        <button
          type="button"
          onClick={copyCommand}
          disabled={!machineApiKey}
          className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy install command'}
        </button>
        <a
          href={`${API_BASE_URL}/downloads/agent/sentinel-agent.exe`}
          className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <Download className="h-4 w-4" />
          Download agent SDK
        </a>
        <a
          href={`${API_BASE_URL}/install-agent.sh`}
          className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <Terminal className="h-4 w-4" />
          Installer script
        </a>
      </div>

      {error ? <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}

      {createdMachine ? (
        <SuccessBanner
          title="Machine registered"
          text={`API key generated for ${createdMachine.name}. Paste it into the agent installer on the target host.`}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.3rem] border border-white/10 bg-[#091024] p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-white/45">Configuration</div>
          <div className="mt-3 space-y-2 text-sm text-white/75">
            <ConfigRow label="server_url" value={API_BASE_URL} />
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-3">
              <span className="text-cyan-100/70">machine_code</span>
              <div className="flex max-w-[18rem] items-start gap-2 text-right">
                <span className="break-all font-mono text-xs text-cyan-50">{activeApiKey}</span>
                <button type="button" onClick={() => void copyMachineCode()} disabled={!machineApiKey} className="shrink-0 text-cyan-200 disabled:opacity-40" aria-label="Copy machine code" title="Copy machine code">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <ConfigRow label="hostname" value={hostname} />
          </div>
        </div>

        <div className="rounded-[1.3rem] border border-white/10 bg-[#0b1224] p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-white/45">Command</div>
          <code className="mt-3 block rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-cyan-100">{installCommand}</code>
        </div>
      </div>

      <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
        <div className="text-xs uppercase tracking-[0.25em] text-white/45">Registered machines</div>
        <div className="mt-3 space-y-3">
          {machines.length > 0 ? (
            machines.map((machine) => (
              <div key={machine.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#091024] px-4 py-4">
                <div>
                  <div className="font-semibold text-white">{machine.name}</div>
                  <div className="text-sm text-white/55">{machine.hostname}</div>
                </div>
                <div className="text-right text-sm text-white/60">
                  <div>{machine.status}</div>
                  <div className="font-mono text-xs text-white/45">{machine.key_prefix}</div>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => void handleReissue(machine)} className="text-xs text-cyan-200 hover:text-cyan-100">Reissue</button>
                    {machine.status !== 'revoked' ? <button type="button" onClick={() => void handleRevoke(machine)} className="text-xs text-red-200 hover:text-red-100">Revoke</button> : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-5 text-sm text-white/55">
              No machines registered yet. Create one to generate the first scoped API key.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

