from pydantic import BaseModel

class MetricCreate(BaseModel):
    service_name: str
    cpu: float
    memory: float