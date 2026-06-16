from typing import Optional

from pydantic import BaseModel, Field


class MetricCreate(BaseModel):
    service_name: str = Field(min_length=1, max_length=120)
    cpu: float = Field(ge=0, le=100)
    memory: float = Field(ge=0, le=100)
    disk: Optional[float] = Field(default=None, ge=0, le=100)
    network_sent: Optional[float] = Field(default=None, ge=0)
    network_recv: Optional[float] = Field(default=None, ge=0)
    load_average: Optional[float] = Field(default=None, ge=0)
    uptime: Optional[float] = Field(default=None, ge=0)
    hostname: Optional[str] = Field(default=None, max_length=255)
    operating_system: Optional[str] = Field(default=None, max_length=255)


class ServiceHealthCreate(BaseModel):
    service_name: str = Field(min_length=1, max_length=120)
    hostname: Optional[str] = Field(default=None, max_length=255)
    process_name: Optional[str] = Field(default=None, max_length=255)
    running: bool
    process_cpu: Optional[float] = Field(default=None, ge=0, le=100)
    process_memory: Optional[float] = Field(default=None, ge=0, le=100)


class IncidentStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=32)


class LogEntryCreate(BaseModel):
    service_name: str = Field(min_length=1, max_length=120)
    level: str = Field(min_length=1, max_length=20)
    message: str = Field(min_length=1, max_length=4000)
    hostname: Optional[str] = Field(default=None, max_length=255)
    source: Optional[str] = Field(default=None, max_length=120)


class AnalysisRequest(BaseModel):
    service_name: str = Field(min_length=1, max_length=120)
    hostname: Optional[str] = Field(default=None, max_length=255)
    window_minutes: int = Field(default=30, ge=1, le=1440)
    notification_target: Optional[str] = Field(default=None, max_length=320)
