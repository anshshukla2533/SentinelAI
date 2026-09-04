from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Uuid
from sqlalchemy.sql import func

from app.database.base import Base


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

