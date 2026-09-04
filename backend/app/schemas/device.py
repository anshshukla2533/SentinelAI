from datetime import datetime
from uuid import UUID
from typing import Optional

from pydantic import BaseModel, Field


class ServiceHealthCreate(BaseModel):
    service_name: str = Field(min_length=1, max_length=120)
    hostname: Optional[str] = Field(default=None, max_length=255)
    process_name: Optional[str] = Field(default=None, max_length=255)
    running: bool
    process_cpu: Optional[float] = Field(default=None, ge=0, le=100)
    process_memory: Optional[float] = Field(default=None, ge=0, le=100)


class DeviceSummary(BaseModel):
    id: int
    name: str
    hostname: Optional[str] = None
    process_name: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    last_seen_at: Optional[datetime] = None
    latest_metric: Optional[dict] = None
    open_incidents_count: int


class MachineCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    hostname: str = Field(min_length=1, max_length=255)


class MachineRead(BaseModel):
    id: UUID
    organization_id: str
    created_by_user_id: int
    name: str
    hostname: str
    key_prefix: str
    status: str
    last_seen_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class MachineCreateResponse(BaseModel):
    machine: MachineRead
    machine_api_key: str

