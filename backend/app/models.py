from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

from .database import Base

class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String, nullable=False)
    cpu = Column(Float, nullable=False)
    memory = Column(Float, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )