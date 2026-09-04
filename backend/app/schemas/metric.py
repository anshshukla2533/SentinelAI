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

