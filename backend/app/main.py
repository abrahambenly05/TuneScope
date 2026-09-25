from fastapi import FastAPI
from sqlalchemy import text

from app.database import engine
from app.routers import charts

app = FastAPI(title="TuneScope API")

app.include_router(charts.router)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/health/db")
def health_db():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}