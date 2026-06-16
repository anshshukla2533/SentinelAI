#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${SENTINEL_INSTALL_DIR:-$HOME/.sentinel-ai-agent}"
AGENT_BASE_URL="${SENTINEL_AGENT_BASE_URL:-https://sentinel-ai.com/downloads/agent}"
API_BASE_URL="${SENTINEL_API_BASE_URL:-}"
SERVICE_NAME="${SENTINEL_SERVICE_NAME:-$(hostname)}"
WATCH_PROCESSES="${SENTINEL_WATCH_PROCESSES:-}"
NOTIFICATION_TARGET="${SENTINEL_NOTIFICATION_TARGET:-}"
CHECK_INTERVAL="${SENTINEL_CHECK_INTERVAL:-10}"
ANALYSIS_INTERVAL="${SENTINEL_ANALYSIS_INTERVAL:-60}"
REQUEST_TIMEOUT="${SENTINEL_REQUEST_TIMEOUT:-5}"
AGENT_TOKEN="${SENTINEL_AGENT_TOKEN:-}"
INSTALL_SERVICE="${SENTINEL_INSTALL_SERVICE:-1}"

print_usage() {
    printf '%s\n' "Usage: SENTINEL_API_BASE_URL=https://api.sentinel-ai.com bash install-agent.sh"
    printf '%s\n' ""
    printf '%s\n' "Optional environment variables:"
    printf '%s\n' "  SENTINEL_SERVICE_NAME=web-01"
    printf '%s\n' "  SENTINEL_WATCH_PROCESSES=nginx,postgres"
    printf '%s\n' "  SENTINEL_NOTIFICATION_TARGET=ops@example.com"
    printf '%s\n' "  SENTINEL_CHECK_INTERVAL=10"
    printf '%s\n' "  SENTINEL_ANALYSIS_INTERVAL=60"
    printf '%s\n' "  SENTINEL_REQUEST_TIMEOUT=5"
    printf '%s\n' "  SENTINEL_AGENT_TOKEN=token-if-required"
    printf '%s\n' "  SENTINEL_INSTALL_SERVICE=0"
    printf '%s\n' "  SENTINEL_AGENT_BASE_URL=https://sentinel-ai.com/downloads/agent"
}

require_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        printf 'Missing required command: %s\n' "$1" >&2
        exit 1
    fi
}

download_file() {
    source_url="$1"
    target_path="$2"

    if command -v curl >/dev/null 2>&1; then
        curl -fsSL "$source_url" -o "$target_path"
    elif command -v wget >/dev/null 2>&1; then
        wget -q "$source_url" -O "$target_path"
    else
        printf '%s\n' "Missing required command: curl or wget" >&2
        exit 1
    fi
}

if [ "${1:-}" = "--help" ]; then
    print_usage
    exit 0
fi

if [ -z "$API_BASE_URL" ]; then
    printf '%s\n' "SENTINEL_API_BASE_URL is required." >&2
    print_usage
    exit 1
fi

require_command python3

mkdir -p "$INSTALL_DIR"
download_file "$AGENT_BASE_URL/agent.py" "$INSTALL_DIR/agent.py"
download_file "$AGENT_BASE_URL/requirements.txt" "$INSTALL_DIR/requirements.txt"

python3 -m venv "$INSTALL_DIR/venv"
"$INSTALL_DIR/venv/bin/python" -m pip install --upgrade pip
"$INSTALL_DIR/venv/bin/pip" install -r "$INSTALL_DIR/requirements.txt"

cat > "$INSTALL_DIR/.env" <<EOF
SENTINEL_API_BASE_URL=$API_BASE_URL
SENTINEL_SERVICE_NAME=$SERVICE_NAME
SENTINEL_WATCH_PROCESSES=$WATCH_PROCESSES
SENTINEL_NOTIFICATION_TARGET=$NOTIFICATION_TARGET
SENTINEL_CHECK_INTERVAL=$CHECK_INTERVAL
SENTINEL_ANALYSIS_INTERVAL=$ANALYSIS_INTERVAL
SENTINEL_REQUEST_TIMEOUT=$REQUEST_TIMEOUT
SENTINEL_AGENT_TOKEN=$AGENT_TOKEN
EOF

chmod 600 "$INSTALL_DIR/.env"

if SENTINEL_ENV_FILE="$INSTALL_DIR/.env" "$INSTALL_DIR/venv/bin/python" "$INSTALL_DIR/agent.py" --check; then
    printf '%s\n' "Backend connectivity check passed."
else
    printf '%s\n' "Warning: backend connectivity check failed. The agent is installed, but verify SENTINEL_API_BASE_URL." >&2
fi

if [ "$INSTALL_SERVICE" = "1" ] && command -v systemctl >/dev/null 2>&1; then
    SERVICE_DIR="$HOME/.config/systemd/user"
    mkdir -p "$SERVICE_DIR"

    cat > "$SERVICE_DIR/sentinel-ai-agent.service" <<EOF
[Unit]
Description=SentinelAI monitoring agent
After=network-online.target

[Service]
Type=simple
WorkingDirectory=$INSTALL_DIR
Environment=SENTINEL_ENV_FILE=$INSTALL_DIR/.env
ExecStart=$INSTALL_DIR/venv/bin/python $INSTALL_DIR/agent.py
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
EOF

    systemctl --user daemon-reload
    systemctl --user enable --now sentinel-ai-agent.service

    printf '%s\n' "SentinelAI agent installed and started."
    printf '%s\n' "Check status with: systemctl --user status sentinel-ai-agent"
else
    printf '%s\n' "SentinelAI agent installed."
    printf 'Run it with: SENTINEL_ENV_FILE=%s %s %s\n' "$INSTALL_DIR/.env" "$INSTALL_DIR/venv/bin/python" "$INSTALL_DIR/agent.py"
fi
