import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

type AgentInstallProps = {
  apiBaseUrl: string;
};

export default function AgentInstall({ apiBaseUrl }: AgentInstallProps) {
  const [copied, setCopied] = useState(false);
  const installCmd = `curl -fsSL https://sentinel-ai.com/install-agent.sh | SENTINEL_API_BASE_URL=${apiBaseUrl} bash`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-[#07111f] p-6 shadow-2xl shadow-cyan-950/20">
      <div className="install-scan absolute inset-x-0 top-0 h-px bg-cyan-300" />
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-cyan-400 rounded-lg text-[#07111f]">
          <Terminal className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold text-white">Install SentinelAI Agent</h2>
      </div>

      <p className="text-slate-300 mb-6 text-sm">
        Run this command on your server to start collecting telemetry and receiving predictive failure alerts.
      </p>

      <div className="relative group">
        <code className="block bg-black/45 p-4 pr-12 rounded-lg border border-cyan-300/20 text-cyan-100 font-mono text-sm break-all shadow-inner">
          {installCmd}
        </code>
        <button
          onClick={copyToClipboard}
          className="absolute right-3 top-3 p-2 hover:bg-white/10 rounded-md transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4 text-slate-300" />
          )}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-xs text-slate-300">
        <span className="rounded-lg bg-white/5 px-3 py-2 text-center">Python</span>
        <span className="rounded-lg bg-white/5 px-3 py-2 text-center">FastAPI</span>
        <span className="rounded-lg bg-white/5 px-3 py-2 text-center">Alerts</span>
      </div>
    </div>
  );
}
