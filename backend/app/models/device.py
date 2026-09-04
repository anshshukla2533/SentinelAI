import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Uuid
from sqlalchemy.sql import func

from app.database.base import Base


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


class Machine(Base):
    __tablename__ = "machines"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column("org_id", String(255), ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    hostname = Column(String, nullable=False, index=True)
    api_key_hash = Column("machine_code_hash", String(128), nullable=False, unique=True, index=True)
    key_prefix = Column("code_prefix", String(32), nullable=False, index=True)
    status = Column(String, nullable=False, default="pending")
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    last_seen_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

