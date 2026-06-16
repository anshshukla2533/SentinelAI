import argparse
import os
import platform
import socket
import time

import psutil
import requests


def load_env_file(path):
    """Load KEY=VALUE lines from a simple env file before reading settings."""
    if not path or not os.path.exists(path):
        return

    with open(path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()

            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


load_env_file(os.getenv("SENTINEL_ENV_FILE", os.path.expanduser("~/.sentinel-ai-agent/.env")))


def normalize_api_base_url(value):
    """Normalize a backend URL so endpoint joins are predictable."""
    return value.strip().rstrip("/")


def read_int_setting(name, default, minimum=None):
    raw_value = os.getenv(name, str(default))

    try:
        value = int(raw_value)
    except ValueError:
        raise SystemExit(f"{name} must be an integer, got: {raw_value}")

    if minimum is not None and value < minimum:
        raise SystemExit(f"{name} must be at least {minimum}")

    return value


API_BASE_URL = normalize_api_base_url(os.getenv("SENTINEL_API_BASE_URL", "http://127.0.0.1:8000"))
METRICS_URL = f"{API_BASE_URL}/metrics"
SERVICE_HEALTH_URL = f"{API_BASE_URL}/services/health"
LOGS_URL = f"{API_BASE_URL}/logs"
ANALYSIS_URL = f"{API_BASE_URL}/analysis/run"
HEALTH_URL = f"{API_BASE_URL}/health"
SERVICE_NAME = os.getenv("SENTINEL_SERVICE_NAME", "local-machine")
INTERVAL_SECONDS = read_int_setting("SENTINEL_CHECK_INTERVAL", 10, minimum=1)
REQUEST_TIMEOUT_SECONDS = read_int_setting("SENTINEL_REQUEST_TIMEOUT", 5, minimum=1)
NOTIFICATION_TARGET = os.getenv("SENTINEL_NOTIFICATION_TARGET")
ANALYSIS_INTERVAL_SECONDS = read_int_setting("SENTINEL_ANALYSIS_INTERVAL", 60, minimum=10)
AGENT_TOKEN = os.getenv("SENTINEL_AGENT_TOKEN")
WATCH_PROCESSES = [
    process.strip()
    for process in os.getenv("SENTINEL_WATCH_PROCESSES", "").split(",")
    if process.strip()
]
REQUEST_HEADERS = {"Authorization": f"Bearer {AGENT_TOKEN}"} if AGENT_TOKEN else None

# Use a session for connection pooling to improve performance
session = requests.Session()
STARTED_AT = time.time()
# Prime psutil CPU tracking
psutil.cpu_percent(interval=None)


def log(message):
    """Print agent logs immediately, even when output is buffered."""
    print(f"[SENTINEL] {message}", flush=True)


def validate_config():
    if not API_BASE_URL.startswith(("http://", "https://")):
        raise SystemExit("SENTINEL_API_BASE_URL must start with http:// or https://")

    if not SERVICE_NAME.strip():
        raise SystemExit("SENTINEL_SERVICE_NAME cannot be empty")


def get_load_average():
    """Return the 1-minute load average when the OS supports it."""
    try:
        return round(psutil.getloadavg()[0], 2)
    except (AttributeError, OSError):
        return None


def collect_metrics():
    """Collect current machine usage and identity details."""
    # psutil reads live system stats from the machine where this agent runs.
    network = psutil.net_io_counters()

    return {
        "service_name": SERVICE_NAME,
        "cpu": round(psutil.cpu_percent(interval=None), 1),
        "memory": round(psutil.virtual_memory().percent, 1),
        "disk": round(psutil.disk_usage("/").percent, 1),
        "network_sent": float(network.bytes_sent),
        "network_recv": float(network.bytes_recv),
        "load_average": get_load_average(),
        "uptime": round(time.time() - psutil.boot_time(), 1),
        "hostname": socket.gethostname(),
        "operating_system": platform.platform(),
    }


def collect_service_health():
    """Build service health reports for the agent and any watched processes."""
    hostname = socket.gethostname()
    reports = [
        {
            "service_name": SERVICE_NAME,
            "hostname": hostname,
            "process_name": None,
            "running": True,
            "process_cpu": None,
            "process_memory": None,
        }
    ]

    if not WATCH_PROCESSES:
        return reports

    # Initialize status map for watched processes
    process_map = {
        name: {
            "process_name": name,
            "running": False,
            "process_cpu": None,
            "process_memory": None,
        }
        for name in WATCH_PROCESSES
    }

    # Scan all processes once to find matches
    for process in psutil.process_iter(["name", "cpu_percent", "memory_percent"]):
        try:
            p_name = process.info["name"]
            if p_name in process_map and not process_map[p_name]["running"]:
                process_map[p_name].update({
                    "running": True,
                    "process_cpu": float(process.info["cpu_percent"] or 0),
                    "process_memory": round(float(process.info["memory_percent"] or 0), 2),
                })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    for process_name in WATCH_PROCESSES:
        report = {"hostname": hostname, "service_name": process_name}
        report.update(process_map[process_name])
        reports.append(report)

    return reports


def post_json(url, payload):
    """Send one JSON payload to the SentinelAI backend."""
    # timeout prevents the agent from hanging forever if the API is unavailable.
    response = session.post(
        url,
        json=payload,
        headers=REQUEST_HEADERS,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return response


def send_metrics(payload):
    """Send one metrics payload to the SentinelAI backend."""
    post_json(METRICS_URL, payload)


def send_service_health(payload):
    """Send one service health payload to the SentinelAI backend."""
    post_json(SERVICE_HEALTH_URL, payload)


def send_log(level, message):
    """Send an agent operational log to the SentinelAI backend."""
    payload = {
        "service_name": SERVICE_NAME,
        "hostname": socket.gethostname(),
        "level": level,
        "message": message,
        "source": "agent",
    }

    try:
        post_json(LOGS_URL, payload)
    except requests.exceptions.RequestException:
        pass


def request_analysis():
    """Ask the backend to analyze recent signals and generate a report if useful."""
    payload = {
        "service_name": SERVICE_NAME,
        "hostname": socket.gethostname(),
        "window_minutes": 30,
        "notification_target": NOTIFICATION_TARGET,
    }

    try:
        post_json(ANALYSIS_URL, payload)
        log("Analysis requested successfully")
    except requests.exceptions.RequestException as error:
        log(f"Failed to request analysis: {error}")


def check_backend():
    """Verify that the configured backend is reachable."""
    response = session.get(
        HEALTH_URL,
        headers=REQUEST_HEADERS,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return response.json()


def run_collection_cycle(request_report=False):
    """Collect and send one full telemetry cycle."""
    payload = collect_metrics()

    log(f"CPU: {payload['cpu']}%")
    log(f"Memory: {payload['memory']}%")
    log(f"Disk: {payload['disk']}%")

    send_metrics(payload)
    log("Metrics sent successfully")

    for health_report in collect_service_health():
        send_service_health(health_report)
        log(
            f"Health sent for {health_report['service_name']} "
            f"(running={health_report['running']})"
        )

    send_log("info", "Metrics and service health sent successfully")

    if request_report:
        request_analysis()


def run_agent():
    """Continuously collect and send machine metrics every 10 seconds."""
    validate_config()
    log("Monitoring agent started")
    send_log("info", "Monitoring agent started")

    last_analysis_at = 0.0
    while True:
        cycle_started_at = time.monotonic()

        try:
            should_request_analysis = (
                cycle_started_at - last_analysis_at >= ANALYSIS_INTERVAL_SECONDS
            )
            run_collection_cycle(request_report=should_request_analysis)

            if should_request_analysis:
                last_analysis_at = cycle_started_at
        # The backend did not respond before REQUEST_TIMEOUT_SECONDS.
        except requests.exceptions.Timeout as error:
            message = f"Failed to send metrics: request timed out ({error})"
            log(message)
            send_log("error", message)
        # Covers cases like backend down, refused connection, or network failure.
        except requests.exceptions.ConnectionError as error:
            message = f"Failed to send metrics: API unavailable or network failure ({error})"
            log(message)
            send_log("error", message)
        # Covers HTTP errors and other request-level failures.
        except requests.exceptions.RequestException as error:
            message = f"Failed to send metrics: {error}"
            log(message)
            send_log("error", message)

        elapsed_seconds = time.monotonic() - cycle_started_at
        sleep_seconds = max(0, INTERVAL_SECONDS - elapsed_seconds)
        log(f"Waiting {round(sleep_seconds, 1)} seconds before next check")
        time.sleep(sleep_seconds)


def main():
    parser = argparse.ArgumentParser(description="SentinelAI telemetry agent")
    parser.add_argument("--once", action="store_true", help="send one telemetry cycle and exit")
    parser.add_argument("--check", action="store_true", help="check backend connectivity and exit")
    parser.add_argument("--no-analysis", action="store_true", help="skip report generation in --once mode")
    args = parser.parse_args()

    validate_config()

    if args.check:
        result = check_backend()
        log(f"Backend reachable: {result.get('status', 'ok')}")
        return

    if args.once:
        run_collection_cycle(request_report=not args.no_analysis)
        log("One telemetry cycle completed")
        return

    run_agent()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        log("Monitoring agent stopped")
