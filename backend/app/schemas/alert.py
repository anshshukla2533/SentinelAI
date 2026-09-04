from typing import Optional

from pydantic import BaseModel, Field


class IncidentStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=32)


class AnalysisRequest(BaseModel):
    service_name: str = Field(min_length=1, max_length=120)
    hostname: Optional[str] = Field(default=None, max_length=255)
    window_minutes: int = Field(default=30, ge=1, le=1440)
    notification_target: Optional[str] = Field(default=None, max_length=320)

