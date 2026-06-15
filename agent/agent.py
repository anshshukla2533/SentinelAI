import os
import platform
import socket
import time

import psutil
import requests


API_BASE_URL = os.getenv("SENTINEL_API_BASE_URL", "http://127.0.0.1:8000")
METRICS_URL = f"{API_BASE_URL}/metrics"
SERVICE_HEALTH_URL = f"{API_BASE_URL}/services/health"
LOGS_URL = f"{API_BASE_URL}/logs"
SERVICE_NAME = os.getenv("SENTINEL_SERVICE_NAME", "local-machine")
INTERVAL_SECONDS = 10
REQUEST_TIMEOUT_SECONDS = 5
WATCH_PROCESSES = [
    process.strip()
    for process in os.getenv("SENTINEL_WATCH_PROCESSES", "").split(",")
    if process.strip()
]


STARTED_AT = time.time()


def log(message):
    """Print agent logs immediately, even when output is buffered."""
    print(f"[SENTINEL] {message}", flush=True)


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


def find_process_health(process_name):
    """Return lightweight health details for the first process matching a name."""
    for process in psutil.process_iter(["name", "cpu_percent", "memory_percent"]):
        try:
            if process.info["name"] == process_name:
                return {
                    "process_name": process_name,
                    "running": True,
                    "process_cpu": float(process.info["cpu_percent"] or 0),
                    "process_memory": round(float(process.info["memory_percent"] or 0), 2),
                }
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    return {
        "process_name": process_name,
        "running": False,
        "process_cpu": None,
        "process_memory": None,
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

    for process_name in WATCH_PROCESSES:
        process_health = find_process_health(process_name)
        reports.append(
            {
                "service_name": process_name,
                "hostname": hostname,
                **process_health,
            }
        )

    return reports


def post_json(url, payload):
    """Send one JSON payload to the SentinelAI backend."""
    # timeout prevents the agent from hanging forever if the API is unavailable.
    response = requests.post(
        url,
        json=payload,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()


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


def run_agent():
    """Continuously collect and send machine metrics every 10 seconds."""
    log("Monitoring agent started")
    send_log("info", "Monitoring agent started")

    while True:
        cycle_started_at = time.monotonic()

        # Build the JSON payload expected by POST /metrics.
        payload = collect_metrics()

        log(f"CPU: {payload['cpu']}%")
        log(f"Memory: {payload['memory']}%")
        log(f"Disk: {payload['disk']}%")

        try:
            send_metrics(payload)
            log("Metrics sent successfully")

            for health_report in collect_service_health():
                send_service_health(health_report)
                log(
                    f"Health sent for {health_report['service_name']} "
                    f"(running={health_report['running']})"
                )

            send_log("info", "Metrics and service health sent successfully")
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


if __name__ == "__main__":
    try:
        run_agent()
    except KeyboardInterrupt:
        log("Monitoring agent stopped")
