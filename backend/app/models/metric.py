from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Uuid
from sqlalchemy.sql import func

from app.database.base import Base


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
    created_at = Column(DateTime(timezone=True), server_default=func.now())

