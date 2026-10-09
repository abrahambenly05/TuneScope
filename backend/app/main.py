from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine
from app.routers import auth, charts, detail, favorites, genres, playlists, reviews, search

app = FastAPI(title="TuneScope API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],       
)

app.include_router(auth.router)
app.include_router(charts.router)
app.include_router(search.router)
app.include_router(detail.router)
app.include_router(genres.router)
app.include_router(favorites.router)
app.include_router(playlists.router)
app.include_router(reviews.router)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/health/db")
def health_db():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}