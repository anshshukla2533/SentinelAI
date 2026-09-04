from sqlalchemy import Column, ForeignKey, Integer, String, Float, DateTime, Uuid
from sqlalchemy.sql import func

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    registration_token = Column(String, nullable=False, unique=True, index=True)
    clerk_user_id = Column(String, nullable=True, unique=True, index=True)
    default_organization_id = Column(String(255), ForeignKey("organizations.id"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(255), primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Machine(Base):
    __tablename__ = "machines"

    id = Column(Uuid, primary_key=True, index=True)
    organization_id = Column("org_id", String(255), ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    hostname = Column(String, nullable=False, index=True)
    api_key_hash = Column("machine_code_hash", String(128), nullable=False, unique=True, index=True)
    key_prefix = Column("code_prefix", String(32), nullable=False, index=True)
    status = Column(String, nullable=False, default="pending")
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    last_seen_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column("org_id", String(255), ForeignKey("organizations.id"), nullable=False, index=True)
    machine_id = Column(Uuid, ForeignKey("machines.id"), nullable=False, index=True)
    service_name = Column(String, nullable=False)
    cpu = Column(Float, nullable=False)
    memory = Column(Float, nullable=False)
    disk = Column(Float, nullable=True)
    network_sent = Column(Float, nullable=True)
    network_recv = Column(Float, nullable=True)
    load_average = Column(Float, nullable=True)
    uptime = Column(Float, nullable=True)
    hostname = Column(String, nullable=True)
    operating_system = Column(String, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column("org_id", String(255), ForeignKey("organizations.id"), nullable=False, index=True)
    machine_id = Column(Uuid, ForeignKey("machines.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    hostname = Column(String, nullable=True, index=True)
    process_name = Column(String, nullable=True)
    status = Column(String, nullable=False, default="unknown")
    last_seen_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column("org_id", String(255), ForeignKey("organizations.id"), nullable=False, index=True)
    machine_id = Column(Uuid, ForeignKey("machines.id"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True, index=True)
    service_name = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    status = Column(String, nullable=False, default="open", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)


class LogEntry(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column("org_id", String(255), ForeignKey("organizations.id"), nullable=False, index=True)
    machine_id = Column(Uuid, ForeignKey("machines.id"), nullable=False, index=True)
    service_name = Column(String, nullable=False, index=True)
    hostname = Column(String, nullable=True, index=True)
    level = Column(String, nullable=False, index=True)
    message = Column(String, nullable=False)
    source = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=True, index=True)
    service_name = Column(String, nullable=False, index=True)
    hostname = Column(String, nullable=True, index=True)
    risk_level = Column(String, nullable=False, index=True)
    risk_score = Column(Integer, nullable=False)
    summary = Column(String, nullable=False)
    recommendation = Column(String, nullable=False)
    predicted_failure = Column(String, nullable=True)
    likely_failure_at = Column(DateTime(timezone=True), nullable=True)
    time_to_failure = Column(String, nullable=True)
    prevention_steps = Column(String, nullable=True)
    notification_target = Column(String, nullable=True)
    notification_sent = Column(Integer, nullable=False, default=0)
    notification_error = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
