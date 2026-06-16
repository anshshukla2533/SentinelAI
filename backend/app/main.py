import os
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from pathlib import Path

from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from .database import engine, SessionLocal
from .models import AnalysisReport, Base, Incident, LogEntry, Metric, Service
from .schemas import AnalysisRequest, IncidentStatusUpdate, LogEntryCreate, MetricCreate, ServiceHealthCreate

Base.metadata.create_all(bind=engine)


def ensure_metric_columns():
    """Add newly introduced metric columns for the current pre-Alembic stage."""
    expected_columns = {
        "disk": "FLOAT",
        "network_sent": "FLOAT",
        "network_recv": "FLOAT",
        "load_average": "FLOAT",
        "uptime": "FLOAT",
        "hostname": "VARCHAR",
        "operating_system": "VARCHAR",
    }
    existing_columns = {column["name"] for column in inspect(engine).get_columns("metrics")}

    with engine.begin() as connection:
        for column_name, column_type in expected_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE metrics ADD COLUMN {column_name} {column_type}"))


ensure_metric_columns()


def ensure_analysis_report_columns():
    """Add predictive report columns for the current pre-Alembic stage."""
    expected_columns = {
        "predicted_failure": "VARCHAR",
        "likely_failure_at": "DATETIME",
        "time_to_failure": "VARCHAR",
        "prevention_steps": "VARCHAR",
        "notification_error": "VARCHAR",
    }
    existing_columns = {column["name"] for column in inspect(engine).get_columns("analysis_reports")}

    with engine.begin() as connection:
        for column_name, column_type in expected_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE analysis_reports ADD COLUMN {column_name} {column_type}"))


ensure_analysis_report_columns()

app = FastAPI(title="SentinelAI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INCIDENT_STATUSES = {"open", "investigating", "resolved"}
LOG_LEVELS = {"debug", "info", "warning", "error", "critical"}
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DOWNLOADABLE_AGENT_FILES = {
    "agent.py": PROJECT_ROOT / "agent" / "agent.py",
    "requirements.txt": PROJECT_ROOT / "agent" / "requirements.txt",
}


def require_agent_auth(authorization: str | None = Header(default=None)):
    expected_token = os.getenv("SENTINEL_AGENT_TOKEN")

    if not expected_token:
        return

    scheme, _, provided_token = (authorization or "").partition(" ")

    if scheme.lower() != "bearer" or not secrets.compare_digest(provided_token, expected_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing agent token",
        )


def calculate_service_status(health: ServiceHealthCreate):
    if not health.running:
        return "critical"

    if (
        (health.process_cpu is not None and health.process_cpu >= 90)
        or (health.process_memory is not None and health.process_memory >= 90)
    ):
        return "warning"

    return "healthy"


def create_incident_if_needed(db: Session, service: Service, status: str):
    if status == "healthy":
        return None

    existing_incident = (
        db.query(Incident)
        .filter(
            Incident.service_name == service.name,
            Incident.status.in_(["open", "investigating"]),
        )
        .first()
    )

    if existing_incident:
        return existing_incident

    incident = Incident(
        service_id=service.id,
        service_name=service.name,
        title=f"{service.name} is {status}",
        severity=status,
        status="open",
    )
    db.add(incident)
    return incident


def get_incident_or_404(db: Session, incident_id: int):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()

    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    return incident


def average(values):
    if not values:
        return None

    return round(sum(values) / len(values), 2)


def calculate_risk_level(score: int):
    if score >= 80:
        return "critical"

    if score >= 50:
        return "warning"

    return "healthy"


def metric_rate_per_hour(metrics, field_name):
    valid_metrics = [
        metric for metric in metrics
        if getattr(metric, field_name) is not None and metric.created_at is not None
    ]

    if len(valid_metrics) < 2:
        return None

    first_metric = valid_metrics[0]
    latest_metric = valid_metrics[-1]
    elapsed_seconds = (latest_metric.created_at - first_metric.created_at).total_seconds()

    if elapsed_seconds <= 0:
        return None

    return (getattr(latest_metric, field_name) - getattr(first_metric, field_name)) / (elapsed_seconds / 3600)


def forecast_threshold_crossing(latest_metric, metrics, field_name, threshold, label):
    if latest_metric is None or getattr(latest_metric, field_name) is None:
        return None

    rate = metric_rate_per_hour(metrics, field_name)

    if rate is None or rate <= 0:
        return None

    current_value = getattr(latest_metric, field_name)
    hours_until_threshold = (threshold - current_value) / rate

    if hours_until_threshold <= 0:
        return {
            "signal": label,
            "score": 25,
            "reason": f"{label} is already above the danger threshold at {current_value}%",
            "likely_failure_at": datetime.now(timezone.utc),
            "time_to_failure": "now",
        }

    if hours_until_threshold > 168:
        return None

    likely_failure_at = datetime.now(timezone.utc) + timedelta(hours=hours_until_threshold)
    score = 35 if hours_until_threshold <= 24 else 25 if hours_until_threshold <= 72 else 15

    return {
        "signal": label,
        "score": score,
        "reason": (
            f"{label} is rising {round(rate, 2)} percentage points/hour and may cross "
            f"{threshold}% in {format_duration(hours_until_threshold)}"
        ),
        "likely_failure_at": likely_failure_at,
        "time_to_failure": format_duration(hours_until_threshold),
    }


def format_duration(hours):
    if hours < 1:
        return f"{max(1, round(hours * 60))} minutes"

    if hours < 48:
        return f"{round(hours, 1)} hours"

    return f"{round(hours / 24, 1)} days"


def build_prevention_steps(risk_level, predicted_failure):
    if risk_level == "healthy":
        return "Continue collecting telemetry; review trend reports after meaningful load changes."

    if predicted_failure == "disk saturation":
        return "Free disk space; rotate or compress logs; move high-growth data; increase volume size."

    if predicted_failure == "memory exhaustion":
        return "Inspect top memory processes; restart leaking services; raise memory limits or add capacity."

    if predicted_failure == "cpu saturation":
        return "Inspect high-CPU processes; reduce workload; scale the service; check recent deployments."

    return "Review recent error logs; inspect active incidents; prepare rollback or capacity mitigation."


def build_analysis_report(service_name, hostname, metrics, logs, open_incidents):
    latest_metric = metrics[-1] if metrics else None
    avg_cpu = average([metric.cpu for metric in metrics])
    avg_memory = average([metric.memory for metric in metrics])
    avg_disk = average([metric.disk for metric in metrics if metric.disk is not None])
    error_logs = [log for log in logs if log.level in {"error", "critical"}]

    score = 0
    reasons = []
    forecasts = [
        forecast_threshold_crossing(latest_metric, metrics, "disk", 95, "disk"),
        forecast_threshold_crossing(latest_metric, metrics, "memory", 95, "memory"),
        forecast_threshold_crossing(latest_metric, metrics, "cpu", 95, "cpu"),
    ]
    forecasts = [forecast for forecast in forecasts if forecast is not None]

    if latest_metric and latest_metric.cpu >= 90:
        score += 35
        reasons.append(f"CPU is high at {latest_metric.cpu}%")
    elif avg_cpu is not None and avg_cpu >= 75:
        score += 20
        reasons.append(f"Average CPU is elevated at {avg_cpu}%")

    if latest_metric and latest_metric.memory >= 90:
        score += 30
        reasons.append(f"Memory is high at {latest_metric.memory}%")
    elif avg_memory is not None and avg_memory >= 80:
        score += 20
        reasons.append(f"Average memory is elevated at {avg_memory}%")

    if latest_metric and latest_metric.disk is not None and latest_metric.disk >= 90:
        score += 25
        reasons.append(f"Disk usage is high at {latest_metric.disk}%")
    elif avg_disk is not None and avg_disk >= 85:
        score += 15
        reasons.append(f"Average disk usage is elevated at {avg_disk}%")

    if error_logs:
        score += min(30, len(error_logs) * 10)
        reasons.append(f"{len(error_logs)} error or critical logs were seen recently")

    if open_incidents:
        score += min(25, len(open_incidents) * 15)
        reasons.append(f"{len(open_incidents)} active incidents are already open")

    for forecast in forecasts:
        score += forecast["score"]
        reasons.append(forecast["reason"])

    risk_score = min(score, 100)
    risk_level = calculate_risk_level(risk_score)
    strongest_forecast = (
        sorted(forecasts, key=lambda forecast: forecast["likely_failure_at"])[0]
        if forecasts
        else None
    )
    predicted_failure = None
    likely_failure_at = None
    time_to_failure = None

    if strongest_forecast:
        predicted_failure = f"{strongest_forecast['signal']} saturation"
        likely_failure_at = strongest_forecast["likely_failure_at"]
        time_to_failure = strongest_forecast["time_to_failure"]
    elif error_logs:
        predicted_failure = "service instability"
    elif open_incidents:
        predicted_failure = "incident escalation"

    if not reasons:
        reasons.append("No strong risk signals found in the current window")

    if risk_level == "critical":
        recommendation = "Escalate now, inspect the service host, and review recent error logs."
    elif risk_level == "warning":
        recommendation = "Watch closely, review recent logs, and prepare mitigation if resource usage keeps rising."
    else:
        recommendation = "No immediate action required; continue monitoring."

    summary = f"{service_name} risk is {risk_level} ({risk_score}/100): " + "; ".join(reasons)
    prevention_steps = build_prevention_steps(risk_level, predicted_failure)

    return {
        "service_name": service_name,
        "hostname": hostname,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "summary": summary,
        "recommendation": recommendation,
        "predicted_failure": predicted_failure,
        "likely_failure_at": likely_failure_at,
        "time_to_failure": time_to_failure,
        "prevention_steps": prevention_steps,
    }


def send_report_email(report: AnalysisReport):
    if not report.notification_target or report.risk_level == "healthy":
        return None

    smtp_host = os.getenv("SENTINEL_SMTP_HOST")
    smtp_port = int(os.getenv("SENTINEL_SMTP_PORT", "587"))
    smtp_user = os.getenv("SENTINEL_SMTP_USER")
    smtp_password = os.getenv("SENTINEL_SMTP_PASSWORD")
    smtp_from = os.getenv("SENTINEL_SMTP_FROM", smtp_user or "alerts@sentinel-ai.local")
    use_tls = os.getenv("SENTINEL_SMTP_TLS", "true").lower() != "false"

    if not smtp_host:
        return "SMTP is not configured"

    subject = f"SentinelAI {report.risk_level.upper()} risk: {report.service_name}"
    body = "\n".join([
        report.summary,
        "",
        f"Predicted failure: {report.predicted_failure or 'No specific failure predicted'}",
        f"Likely failure time: {report.likely_failure_at or 'Unknown'}",
        f"Time to failure: {report.time_to_failure or 'Unknown'}",
        f"Recommended action: {report.recommendation}",
        f"Prevention steps: {report.prevention_steps}",
    ])

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = smtp_from
    message["To"] = report.notification_target
    message.set_content(body)

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as smtp:
            if use_tls:
                smtp.starttls()

            if smtp_user and smtp_password:
                smtp.login(smtp_user, smtp_password)

            smtp.send_message(message)
    except Exception as error:
        return str(error)

    return None


@app.get("/")
def root():
    return {"message": "SentinelAI Backend Running"}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "sentinel-ai-backend",
        "timestamp": datetime.now(timezone.utc),
    }


@app.get("/install-agent.sh")
def download_installer():
    installer_path = PROJECT_ROOT / "scripts" / "install-agent.sh"

    if not installer_path.exists():
        raise HTTPException(status_code=404, detail="Installer not found")

    return FileResponse(
        installer_path,
        media_type="text/x-shellscript",
        filename="install-agent.sh",
    )


@app.get("/downloads/agent/{filename}")
def download_agent_file(filename: str):
    file_path = DOWNLOADABLE_AGENT_FILES.get(filename)

    if file_path is None or not file_path.exists():
        raise HTTPException(status_code=404, detail="Agent file not found")

    media_type = "text/x-python" if filename.endswith(".py") else "text/plain"
    return FileResponse(file_path, media_type=media_type, filename=filename)


@app.get("/metrics")
def get_metrics(service_name: str | None = None, hostname: str | None = None, limit: int = 100):

    db = SessionLocal()

    try:
        query = db.query(Metric)

        if service_name:
            query = query.filter(Metric.service_name == service_name)

        if hostname:
            query = query.filter(Metric.hostname == hostname)

        bounded_limit = min(max(limit, 1), 500)

        return (
            query
            .order_by(Metric.created_at.desc())
            .limit(bounded_limit)
            .all()
        )
    finally:
        db.close()


@app.post("/metrics", dependencies=[Depends(require_agent_auth)])
def create_metric(metric: MetricCreate):

    db: Session = SessionLocal()

    new_metric = Metric(
        service_name=metric.service_name,
        cpu=metric.cpu,
        memory=metric.memory,
        disk=metric.disk,
        network_sent=metric.network_sent,
        network_recv=metric.network_recv,
        load_average=metric.load_average,
        uptime=metric.uptime,
        hostname=metric.hostname,
        operating_system=metric.operating_system,
    )

    db.add(new_metric)
    db.commit()
    db.refresh(new_metric)

    db.close()

    return {
        "message": "Metric stored successfully",
        "id": new_metric.id
    }


@app.get("/services")
def get_services():
    db = SessionLocal()

    services = db.query(Service).all()

    db.close()

    return services


@app.post("/services/health", dependencies=[Depends(require_agent_auth)])
def report_service_health(health: ServiceHealthCreate):
    db: Session = SessionLocal()

    status = calculate_service_status(health)
    service = db.query(Service).filter(Service.name == health.service_name).first()

    if service is None:
        service = Service(name=health.service_name)
        db.add(service)

    service.hostname = health.hostname
    service.process_name = health.process_name
    service.status = status

    db.flush()
    incident = create_incident_if_needed(db, service, status)

    db.commit()
    db.refresh(service)

    response = {
        "message": "Service health stored successfully",
        "service_id": service.id,
        "status": service.status,
    }

    if incident:
        db.refresh(incident)
        response["incident_id"] = incident.id

    db.close()

    return response


@app.get("/incidents")
def get_incidents():
    db = SessionLocal()

    incidents = db.query(Incident).all()

    db.close()

    return incidents


@app.get("/incidents/{incident_id}")
def get_incident(incident_id: int):
    db = SessionLocal()

    try:
        return get_incident_or_404(db, incident_id)
    finally:
        db.close()


@app.patch("/incidents/{incident_id}/status")
def update_incident_status(incident_id: int, status_update: IncidentStatusUpdate):
    if status_update.status not in INCIDENT_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of: {', '.join(sorted(INCIDENT_STATUSES))}",
        )

    db: Session = SessionLocal()

    try:
        incident = get_incident_or_404(db, incident_id)
        incident.status = status_update.status

        if status_update.status == "resolved":
            incident.resolved_at = datetime.now(timezone.utc)
        else:
            incident.resolved_at = None

        db.commit()
        db.refresh(incident)

        return {
            "message": "Incident status updated successfully",
            "id": incident.id,
            "status": incident.status,
            "resolved_at": incident.resolved_at,
        }
    finally:
        db.close()


@app.get("/incidents/{incident_id}/context")
def get_incident_context(incident_id: int, window_minutes: int = 30):
    bounded_window = min(max(window_minutes, 1), 1440)
    db = SessionLocal()

    try:
        incident = get_incident_or_404(db, incident_id)
        window_start = incident.created_at - timedelta(minutes=bounded_window)
        window_end = incident.resolved_at or datetime.now(timezone.utc)

        metrics = (
            db.query(Metric)
            .filter(
                Metric.service_name == incident.service_name,
                Metric.created_at >= window_start,
                Metric.created_at <= window_end,
            )
            .order_by(Metric.created_at.asc())
            .all()
        )
        logs = (
            db.query(LogEntry)
            .filter(
                LogEntry.service_name == incident.service_name,
                LogEntry.created_at >= window_start,
                LogEntry.created_at <= window_end,
            )
            .order_by(LogEntry.created_at.desc())
            .all()
        )

        return {
            "incident": incident,
            "window_start": window_start,
            "window_end": window_end,
            "metrics_count": len(metrics),
            "logs_count": len(logs),
            "metrics": metrics,
            "logs": logs,
        }
    finally:
        db.close()


@app.get("/logs")
def get_logs(service_name: str | None = None, hostname: str | None = None, limit: int = 100):
    db = SessionLocal()

    try:
        query = db.query(LogEntry)

        if service_name:
            query = query.filter(LogEntry.service_name == service_name)

        if hostname:
            query = query.filter(LogEntry.hostname == hostname)

        bounded_limit = min(max(limit, 1), 500)

        return (
            query
            .order_by(LogEntry.created_at.desc())
            .limit(bounded_limit)
            .all()
        )
    finally:
        db.close()


@app.post("/logs", dependencies=[Depends(require_agent_auth)])
def create_log(log_entry: LogEntryCreate):
    level = log_entry.level.lower()

    if level not in LOG_LEVELS:
        raise HTTPException(
            status_code=400,
            detail=f"Level must be one of: {', '.join(sorted(LOG_LEVELS))}",
        )

    db: Session = SessionLocal()

    try:
        new_log = LogEntry(
            service_name=log_entry.service_name,
            hostname=log_entry.hostname,
            level=level,
            message=log_entry.message,
            source=log_entry.source,
        )

        db.add(new_log)
        db.commit()
        db.refresh(new_log)

        return {
            "message": "Log stored successfully",
            "id": new_log.id,
        }
    finally:
        db.close()


@app.get("/reports")
def get_reports(service_name: str | None = None, limit: int = 100):
    db = SessionLocal()

    try:
        query = db.query(AnalysisReport)

        if service_name:
            query = query.filter(AnalysisReport.service_name == service_name)

        bounded_limit = min(max(limit, 1), 500)

        return (
            query
            .order_by(AnalysisReport.created_at.desc())
            .limit(bounded_limit)
            .all()
        )
    finally:
        db.close()


@app.get("/reports/{report_id}")
def get_report(report_id: int):
    db = SessionLocal()

    try:
        report = db.query(AnalysisReport).filter(AnalysisReport.id == report_id).first()

        if report is None:
            raise HTTPException(status_code=404, detail="Report not found")

        return report
    finally:
        db.close()


@app.post("/analysis/run", dependencies=[Depends(require_agent_auth)])
def run_analysis(request: AnalysisRequest):
    bounded_window = min(max(request.window_minutes, 1), 1440)
    window_start = datetime.now(timezone.utc) - timedelta(minutes=bounded_window)
    db: Session = SessionLocal()

    try:
        metrics_query = db.query(Metric).filter(
            Metric.service_name == request.service_name,
            Metric.created_at >= window_start,
        )
        logs_query = db.query(LogEntry).filter(
            LogEntry.service_name == request.service_name,
            LogEntry.created_at >= window_start,
        )

        if request.hostname:
            metrics_query = metrics_query.filter(Metric.hostname == request.hostname)
            logs_query = logs_query.filter(LogEntry.hostname == request.hostname)

        metrics = metrics_query.order_by(Metric.created_at.asc()).all()
        logs = logs_query.order_by(LogEntry.created_at.desc()).all()
        open_incidents = (
            db.query(Incident)
            .filter(
                Incident.service_name == request.service_name,
                Incident.status.in_(["open", "investigating"]),
            )
            .all()
        )

        analysis = build_analysis_report(
            request.service_name,
            request.hostname,
            metrics,
            logs,
            open_incidents,
        )
        report = AnalysisReport(
            **analysis,
            notification_target=request.notification_target,
            notification_sent=0,
        )
        db.add(report)

        incident = None
        if analysis["risk_level"] in {"warning", "critical"}:
            service = db.query(Service).filter(Service.name == request.service_name).first()

            if service is None:
                service = Service(
                    name=request.service_name,
                    hostname=request.hostname,
                    status=analysis["risk_level"],
                )
                db.add(service)
                db.flush()
            else:
                service.status = analysis["risk_level"]

            incident = create_incident_if_needed(db, service, analysis["risk_level"])

        db.commit()
        db.refresh(report)

        notification_error = send_report_email(report)
        if report.notification_target and report.risk_level != "healthy":
            report.notification_sent = 0 if notification_error else 1
            report.notification_error = notification_error
            db.commit()
            db.refresh(report)

        response = {
            "message": "Analysis report generated successfully",
            "report_id": report.id,
            "risk_level": report.risk_level,
            "risk_score": report.risk_score,
            "summary": report.summary,
            "recommendation": report.recommendation,
            "predicted_failure": report.predicted_failure,
            "likely_failure_at": report.likely_failure_at,
            "time_to_failure": report.time_to_failure,
            "prevention_steps": report.prevention_steps,
            "notification_sent": bool(report.notification_sent),
            "notification_error": report.notification_error,
            "metrics_count": len(metrics),
            "logs_count": len(logs),
        }

        if incident:
            db.refresh(incident)
            response["incident_id"] = incident.id

        return response
    finally:
        db.close()


@app.post("/reports/{report_id}/notification/sent")
def mark_report_notification_sent(report_id: int):
    db: Session = SessionLocal()

    try:
        report = db.query(AnalysisReport).filter(AnalysisReport.id == report_id).first()

        if report is None:
            raise HTTPException(status_code=404, detail="Report not found")

        report.notification_sent = 1
        db.commit()
        db.refresh(report)

        return {
            "message": "Report notification marked as sent",
            "id": report.id,
            "notification_sent": bool(report.notification_sent),
        }
    finally:
        db.close()
