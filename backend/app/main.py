from fastapi import FastAPI
from sqlalchemy.orm import Session

from .database import engine, SessionLocal
from .models import Base, Metric
from .schemas import MetricCreate

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SentinelAI")


@app.get("/")
def root():
    return {"message": "SentinelAI Backend Running"}



@app.get("/metrics")
def get_metrics():

    db = SessionLocal()

    metrics = db.query(Metric).all()

    db.close()

    return metrics


@app.post("/metrics")
def create_metric(metric: MetricCreate):

    db: Session = SessionLocal()

    new_metric = Metric(
        service_name=metric.service_name,
        cpu=metric.cpu,
        memory=metric.memory
    )

    db.add(new_metric)
    db.commit()
    db.refresh(new_metric)

    db.close()

    return {
        "message": "Metric stored successfully",
        "id": new_metric.id
    }