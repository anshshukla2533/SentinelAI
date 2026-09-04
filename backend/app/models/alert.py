from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Uuid
from sqlalchemy.sql import func

from app.database.base import Base


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


class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column("org_id", String(255), ForeignKey("organizations.id"), nullable=False, index=True)
    machine_id = Column(Uuid, ForeignKey("machines.id"), nullable=False, index=True)
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

