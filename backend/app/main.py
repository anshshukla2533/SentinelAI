from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, HTTPException
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from .database import engine, SessionLocal
from .models import Base, Incident, LogEntry, Metric, Service
from .schemas import IncidentStatusUpdate, LogEntryCreate, MetricCreate, ServiceHealthCreate

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

app = FastAPI(title="SentinelAI")

INCIDENT_STATUSES = {"open", "investigating", "resolved"}
LOG_LEVELS = {"debug", "info", "warning", "error", "critical"}


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


@app.get("/")
def root():
    return {"message": "SentinelAI Backend Running"}


@app.get("/metrics")
def get_metrics():

    db = SessionLocal()

    metrics = db.query(Metric).all()

    db.close()

    return metrics


@app.post("/metrics")
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


@app.post("/services/health")
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


@app.post("/logs")
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
