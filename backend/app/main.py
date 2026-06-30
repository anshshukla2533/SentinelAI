import os
import smtplib
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .auth import (
    clear_auth_cookie,
    create_access_token,
    create_registration_token,
    get_agent_user,
    get_current_user,
    hash_password,
    serialize_user,
    set_auth_cookie,
    verify_password,
)
from .database import Base, SessionLocal, engine
from .migrations import upgrade_database
from .models import AnalysisReport, Incident, LogEntry, Metric, Service, User
from .schemas import (
    AnalysisRequest,
    AuthResponse,
    IncidentStatusUpdate,
    LogEntryCreate,
    MetricCreate,
    ServiceHealthCreate,
    UserCreate,
    UserLogin,
    UserRead,
)

try:
    upgrade_database()
except ModuleNotFoundError:
    Base.metadata.create_all(bind=engine)

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


def calculate_service_status(health: ServiceHealthCreate):
    if not health.running:
        return "critical"

    if (
        (health.process_cpu is not None and health.process_cpu >= 90)
        or (health.process_memory is not None and health.process_memory >= 90)
    ):
        return "warning"

    return "healthy"


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
        metric
        for metric in metrics
        if getattr(metric, field_name) is not None and metric.created_at is not None
    ]

    if len(valid_metrics) < 2:
        return None

    first_metric = valid_metrics[0]
    latest_metric = valid_metrics[-1]
    elapsed_seconds = (latest_metric.created_at - first_metric.created_at).total_seconds()

    if elapsed_seconds <= 0:
        return None

    return (getattr(latest_metric, field_name) - getattr(first_metric, field_name)) / (
        elapsed_seconds / 3600
    )


def format_duration(hours):
    if hours < 1:
        return f"{max(1, round(hours * 60))} minutes"

    if hours < 48:
        return f"{round(hours, 1)} hours"

    return f"{round(hours / 24, 1)} days"


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
        recommendation = (
            "Watch closely, review recent logs, and prepare mitigation if resource usage keeps rising."
        )
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
    body = "\n".join(
        [
            report.summary,
            "",
            f"Predicted failure: {report.predicted_failure or 'No specific failure predicted'}",
            f"Likely failure time: {report.likely_failure_at or 'Unknown'}",
            f"Time to failure: {report.time_to_failure or 'Unknown'}",
            f"Recommended action: {report.recommendation}",
            f"Prevention steps: {report.prevention_steps}",
        ]
    )

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


def get_service_by_identity(
    db: Session,
    user_id: int,
    service_name: str,
    hostname: str | None,
):
    query = db.query(Service).filter(Service.user_id == user_id, Service.name == service_name)
    if hostname is None:
        query = query.filter(Service.hostname.is_(None))
    else:
        query = query.filter(Service.hostname == hostname)
    return query.first()


def touch_service(service: Service, hostname: str | None, process_name: str | None = None):
    if hostname is not None:
        service.hostname = hostname
    if process_name is not None:
        service.process_name = process_name
    service.last_seen_at = datetime.now(timezone.utc)


def upsert_service_for_write(
    db: Session,
    user: User,
    service_name: str,
    hostname: str | None,
    status: str | None = None,
    process_name: str | None = None,
):
    service = get_service_by_identity(db, user.id, service_name, hostname)
    if service is None:
        service = Service(
            user_id=user.id,
            name=service_name,
            hostname=hostname,
            process_name=process_name,
            status=status or "unknown",
        )
        db.add(service)
    else:
        if status is not None:
            service.status = status
        if process_name is not None:
            service.process_name = process_name
        if hostname is not None:
            service.hostname = hostname
    touch_service(service, hostname, process_name)
    return service


def create_incident_if_needed(db: Session, service: Service, status: str):
    if status == "healthy":
        return None

    existing_incident = (
        db.query(Incident)
        .filter(
            Incident.user_id == service.user_id,
            Incident.service_id == service.id,
            Incident.status.in_(["open", "investigating"]),
        )
        .first()
    )

    if existing_incident:
        return existing_incident

    incident = Incident(
        user_id=service.user_id,
        service_id=service.id,
        service_name=service.name,
        title=f"{service.name} is {status}",
        severity=status,
        status="open",
    )
    db.add(incident)
    return incident


def get_incident_or_404(db: Session, incident_id: int, user_id: int):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id, Incident.user_id == user_id)
        .first()
    )

    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    return incident


def get_report_or_404(db: Session, report_id: int, user_id: int):
    report = (
        db.query(AnalysisReport)
        .filter(AnalysisReport.id == report_id, AnalysisReport.user_id == user_id)
        .first()
    )

    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")

    return report


def serialize_metric(metric: Metric | None):
    if metric is None:
        return None

    return {
        "id": metric.id,
        "service_name": metric.service_name,
        "cpu": metric.cpu,
        "memory": metric.memory,
        "disk": metric.disk,
        "network_sent": metric.network_sent,
        "network_recv": metric.network_recv,
        "load_average": metric.load_average,
        "uptime": metric.uptime,
        "hostname": metric.hostname,
        "operating_system": metric.operating_system,
        "created_at": metric.created_at,
    }


def serialize_service_summary(service: Service, latest_metric: Metric | None, open_incidents_count: int):
    return {
        "id": service.id,
        "name": service.name,
        "hostname": service.hostname,
        "process_name": service.process_name,
        "status": service.status,
        "created_at": service.created_at,
        "last_seen_at": service.last_seen_at,
        "latest_metric": serialize_metric(latest_metric),
        "open_incidents_count": open_incidents_count,
    }


def serialize_incident(incident: Incident):
    return {
        "id": incident.id,
        "user_id": incident.user_id,
        "service_id": incident.service_id,
        "service_name": incident.service_name,
        "title": incident.title,
        "severity": incident.severity,
        "status": incident.status,
        "created_at": incident.created_at,
        "resolved_at": incident.resolved_at,
    }


def serialize_report(report: AnalysisReport):
    return {
        "id": report.id,
        "user_id": report.user_id,
        "service_name": report.service_name,
        "hostname": report.hostname,
        "risk_level": report.risk_level,
        "risk_score": report.risk_score,
        "summary": report.summary,
        "recommendation": report.recommendation,
        "predicted_failure": report.predicted_failure,
        "likely_failure_at": report.likely_failure_at,
        "time_to_failure": report.time_to_failure,
        "prevention_steps": report.prevention_steps,
        "notification_target": report.notification_target,
        "notification_sent": report.notification_sent,
        "notification_error": report.notification_error,
        "created_at": report.created_at,
    }


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


@app.post("/auth/signup", response_model=AuthResponse)
def signup(payload: UserCreate, response: Response):
    db = SessionLocal()
    try:
        email = payload.email.strip().lower()
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user is not None:
            raise HTTPException(status_code=409, detail="Email is already registered")

        user = User(
            email=email,
            hashed_password=hash_password(payload.password),
            registration_token=create_registration_token(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        access_token = create_access_token(user)
        set_auth_cookie(response, access_token)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": serialize_user(user),
        }
    finally:
        db.close()


@app.post("/auth/login", response_model=AuthResponse)
def login(payload: UserLogin, response: Response):
    db = SessionLocal()
    try:
        email = payload.email.strip().lower()
        user = db.query(User).filter(User.email == email).first()
        if user is None or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        access_token = create_access_token(user)
        set_auth_cookie(response, access_token)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": serialize_user(user),
        }
    finally:
        db.close()


@app.post("/auth/logout")
def logout(response: Response):
    clear_auth_cookie(response)
    return {"message": "Logged out"}


@app.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return serialize_user(current_user)


@app.get("/metrics")
def get_metrics(
    current_user: User = Depends(get_current_user),
    service_name: str | None = None,
    hostname: str | None = None,
    limit: int = 100,
):
    db = SessionLocal()
    try:
        query = db.query(Metric).filter(Metric.user_id == current_user.id)

        if service_name:
            query = query.filter(Metric.service_name == service_name)

        if hostname:
            query = query.filter(Metric.hostname == hostname)

        bounded_limit = min(max(limit, 1), 500)

        return (
            query.order_by(Metric.created_at.desc()).limit(bounded_limit).all()
        )
    finally:
        db.close()


@app.post("/metrics")
def create_metric(metric: MetricCreate, agent_user: User = Depends(get_agent_user)):
    db: Session = SessionLocal()
    try:
        new_metric = Metric(
            user_id=agent_user.id,
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
        upsert_service_for_write(
            db,
            agent_user,
            metric.service_name,
            metric.hostname,
        )
        db.commit()
        db.refresh(new_metric)

        return {"message": "Metric stored successfully", "id": new_metric.id}
    finally:
        db.close()


@app.get("/services")
def get_services(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        services = (
            db.query(Service)
            .filter(Service.user_id == current_user.id)
            .order_by(Service.last_seen_at.desc(), Service.created_at.desc())
            .all()
        )

        summaries = []
        for service in services:
            latest_metric_query = db.query(Metric).filter(
                Metric.user_id == current_user.id,
                Metric.service_name == service.name,
            )
            if service.hostname is None:
                latest_metric_query = latest_metric_query.filter(Metric.hostname.is_(None))
            else:
                latest_metric_query = latest_metric_query.filter(Metric.hostname == service.hostname)

            latest_metric = latest_metric_query.order_by(Metric.created_at.desc()).first()
            open_incidents_count = (
                db.query(Incident)
                .filter(
                    Incident.user_id == current_user.id,
                    Incident.service_id == service.id,
                    Incident.status.in_(["open", "investigating"]),
                )
                .count()
            )
            summaries.append(
                serialize_service_summary(service, latest_metric, open_incidents_count)
            )

        return summaries
    finally:
        db.close()


@app.post("/services/health")
def report_service_health(
    health: ServiceHealthCreate,
    agent_user: User = Depends(get_agent_user),
):
    db: Session = SessionLocal()
    try:
        status_value = calculate_service_status(health)
        service = upsert_service_for_write(
            db,
            agent_user,
            health.service_name,
            health.hostname,
            status=status_value,
            process_name=health.process_name,
        )

        db.flush()
        incident = create_incident_if_needed(db, service, status_value)
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

        return response
    finally:
        db.close()


@app.get("/incidents")
def get_incidents(
    current_user: User = Depends(get_current_user),
    status: str | None = None,
    severity: str | None = None,
):
    db = SessionLocal()
    try:
        query = db.query(Incident).filter(Incident.user_id == current_user.id)

        if status:
            query = query.filter(Incident.status == status)

        if severity:
            query = query.filter(Incident.severity == severity)

        return query.order_by(Incident.created_at.desc()).all()
    finally:
        db.close()


@app.get("/incidents/{incident_id}")
def get_incident(incident_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        return get_incident_or_404(db, incident_id, current_user.id)
    finally:
        db.close()


@app.patch("/incidents/{incident_id}/status")
def update_incident_status(
    incident_id: int,
    status_update: IncidentStatusUpdate,
    current_user: User = Depends(get_current_user),
):
    if status_update.status not in INCIDENT_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of: {', '.join(sorted(INCIDENT_STATUSES))}",
        )

    db: Session = SessionLocal()
    try:
        incident = get_incident_or_404(db, incident_id, current_user.id)
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
def get_incident_context(
    incident_id: int,
    window_minutes: int = 30,
    current_user: User = Depends(get_current_user),
):
    bounded_window = min(max(window_minutes, 1), 1440)
    db = SessionLocal()
    try:
        incident = get_incident_or_404(db, incident_id, current_user.id)
        window_start = incident.created_at - timedelta(minutes=bounded_window)
        window_end = incident.resolved_at or datetime.now(timezone.utc)

        metrics = (
            db.query(Metric)
            .filter(
                Metric.user_id == current_user.id,
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
                LogEntry.user_id == current_user.id,
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
def get_logs(
    current_user: User = Depends(get_current_user),
    service_name: str | None = None,
    hostname: str | None = None,
    limit: int = 100,
):
    db = SessionLocal()
    try:
        query = db.query(LogEntry).filter(LogEntry.user_id == current_user.id)

        if service_name:
            query = query.filter(LogEntry.service_name == service_name)

        if hostname:
            query = query.filter(LogEntry.hostname == hostname)

        bounded_limit = min(max(limit, 1), 500)

        return (
            query.order_by(LogEntry.created_at.desc()).limit(bounded_limit).all()
        )
    finally:
        db.close()


@app.post("/logs")
def create_log(log_entry: LogEntryCreate, agent_user: User = Depends(get_agent_user)):
    level = log_entry.level.lower()

    if level not in LOG_LEVELS:
        raise HTTPException(
            status_code=400,
            detail=f"Level must be one of: {', '.join(sorted(LOG_LEVELS))}",
        )

    db: Session = SessionLocal()
    try:
        new_log = LogEntry(
            user_id=agent_user.id,
            service_name=log_entry.service_name,
            hostname=log_entry.hostname,
            level=level,
            message=log_entry.message,
            source=log_entry.source,
        )

        db.add(new_log)
        db.commit()
        db.refresh(new_log)

        return {"message": "Log stored successfully", "id": new_log.id}
    finally:
        db.close()


@app.get("/reports")
def get_reports(
    current_user: User = Depends(get_current_user),
    service_name: str | None = None,
    limit: int = 100,
):
    db = SessionLocal()
    try:
        query = db.query(AnalysisReport).filter(AnalysisReport.user_id == current_user.id)

        if service_name:
            query = query.filter(AnalysisReport.service_name == service_name)

        bounded_limit = min(max(limit, 1), 500)

        return query.order_by(AnalysisReport.created_at.desc()).limit(bounded_limit).all()
    finally:
        db.close()


@app.get("/reports/{report_id}")
def get_report(report_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        return get_report_or_404(db, report_id, current_user.id)
    finally:
        db.close()


@app.post("/analysis/run")
def run_analysis(request: AnalysisRequest, agent_user: User = Depends(get_agent_user)):
    bounded_window = min(max(request.window_minutes, 1), 1440)
    window_start = datetime.now(timezone.utc) - timedelta(minutes=bounded_window)
    db: Session = SessionLocal()

    try:
        metrics_query = db.query(Metric).filter(
            Metric.user_id == agent_user.id,
            Metric.service_name == request.service_name,
            Metric.created_at >= window_start,
        )
        logs_query = db.query(LogEntry).filter(
            LogEntry.user_id == agent_user.id,
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
                Incident.user_id == agent_user.id,
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
            user_id=agent_user.id,
            **analysis,
            notification_target=request.notification_target,
            notification_sent=0,
        )
        db.add(report)

        incident = None
        if analysis["risk_level"] in {"warning", "critical"}:
            service = get_service_by_identity(
                db,
                agent_user.id,
                request.service_name,
                request.hostname,
            )

            if service is None:
                service = Service(
                    user_id=agent_user.id,
                    name=request.service_name,
                    hostname=request.hostname,
                    status=analysis["risk_level"],
                )
                db.add(service)
                db.flush()
            else:
                service.status = analysis["risk_level"]
                touch_service(service, request.hostname)

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
def mark_report_notification_sent(
    report_id: int,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()
    try:
        report = get_report_or_404(db, report_id, current_user.id)

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
