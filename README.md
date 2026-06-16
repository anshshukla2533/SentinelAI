# SentinelAI

SentinelAI monitors servers, computers, and services through a lightweight Python agent. The backend stores metrics, logs, incidents, and generated risk reports.

## Install Agent

Install the monitoring agent with:

```bash
curl -fsSL https://sentinel-ai.com/install-agent.sh | SENTINEL_API_BASE_URL=https://api.sentinel-ai.com bash
```

Optional settings:

```bash
curl -fsSL https://sentinel-ai.com/install-agent.sh | \
  SENTINEL_API_BASE_URL=https://api.sentinel-ai.com \
  SENTINEL_SERVICE_NAME=web-01 \
  SENTINEL_WATCH_PROCESSES=nginx,postgres \
  SENTINEL_NOTIFICATION_TARGET=ops@example.com \
  bash
```

The installer creates `~/.sentinel-ai-agent`, installs dependencies in a virtual environment, writes the agent config, and starts a user-level `systemd` service when available.
