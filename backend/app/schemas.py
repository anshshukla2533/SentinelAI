from typing import Optional

from pydantic import BaseModel


class MetricCreate(BaseModel):
    service_name: str
    cpu: float
    memory: float
    disk: Optional[float] = None
    network_sent: Optional[float] = None
    network_recv: Optional[float] = None
    load_average: Optional[float] = None
    uptime: Optional[float] = None
    hostname: Optional[str] = None
    operating_system: Optional[str] = None


class ServiceHealthCreate(BaseModel):
    service_name: str
    hostname: Optional[str] = None
    process_name: Optional[str] = None
    running: bool
    process_cpu: Optional[float] = None
    process_memory: Optional[float] = None


class IncidentStatusUpdate(BaseModel):
    status: str


class LogEntryCreate(BaseModel):
    service_name: str
    level: str
    message: str
    hostname: Optional[str] = None
    source: Optional[str] = None
