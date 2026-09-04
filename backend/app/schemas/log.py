from typing import Optional

from pydantic import BaseModel, Field


class LogEntryCreate(BaseModel):
    service_name: str = Field(min_length=1, max_length=120)
    level: str = Field(min_length=1, max_length=20)
    message: str = Field(min_length=1, max_length=4000)
    hostname: Optional[str] = Field(default=None, max_length=255)
    source: Optional[str] = Field(default=None, max_length=120)

