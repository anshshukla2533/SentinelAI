from pathlib import Path

from .config import PROJECT_ROOT

INCIDENT_STATUSES = {"open", "investigating", "resolved"}
LOG_LEVELS = {"debug", "info", "warning", "error", "critical"}

DOWNLOADABLE_AGENT_FILES = {
    "agent.py": PROJECT_ROOT / "agent" / "agent.py",
    "requirements.txt": PROJECT_ROOT / "agent" / "requirements.txt",
    "sentinel-agent.exe": PROJECT_ROOT / "agent" / "dist" / "sentinel-agent.exe",
}

INSTALLER_SCRIPT_PATH = PROJECT_ROOT / "scripts" / "install-agent.sh"
CONFIG_TEMPLATE_PATH = Path(__file__).resolve().parents[1] / "installer" / "templates" / "config.template.yaml"

