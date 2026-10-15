import uuid

import pytest
from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models.activity import Activity
from app.models.favorite import Favorite
from app.models.history import ListeningHistory
from app.models.playlist import Playlist
from app.models.review import Review
from app.models.user import User

@pytest.fixture(autouse=True)
def clean_tables():
    db = SessionLocal()
    db.query(ListeningHistory).delete()
    db.query(Activity).delete()
    db.query(Review).delete()
    db.query(Favorite).delete()
    db.query(Playlist).delete()
    db.query(User).delete()
    db.commit()
    db.close()
    
def register_and_login() -> TestClient:
    client = TestClient(app)
    email = f"history_{uuid.uuid4().hex[:8]}@example.com"
    client.post(
        "/api/auth/register",
        json={"email": email, "password": "secret123", "display_name": "History Tester"},
    )
    client.post("/api/auth/login", json={"email": email, "password": "secret123"})
    return client

def play_payload(external_id: int = 3135556, title: str = "Fake Song") -> dict:
    return {
        "external_id": external_id,
        "title": title,
        "subtitle": "Fake Artist",
        "image_url": "https://example.com/cover.jpg",
    }
    
def test_recording_a_play_returns_the_entry():
    client = register_and_login()
    response = client.post("/api/history", json=play_payload())
    
    assert response.status_code == 201
    body = response.json()
    assert body["external_id"] == 3135556
    assert body["title"] == "Fake Song"
    assert body["played_at"]

def test_history_is_empty_for_a_new_user():
    client = register_and_login()
    assert client.get("/api/history/me").json() == []
    
def test_same_track_can_be_recorded_more_than_once():
    client = register_and_login()
    client.post("/api/history", json=play_payload())
    client.post("/api/history", json=play_payload())
    
    assert len(client.get("/api/history/me").json()) == 2
    
def test_history_is_ordered_newest_first():
    client = register_and_login()
    client.post("/api/history", json=play_payload(1, "First Song"))
    client.post("/api/history", json=play_payload(2, "Second Song"))
    
    history = client.get("/api/history/me").json()
    assert history[0]["title"] == "Second Song"
    assert history[1]["title"] == "First Song"
    
def test_top_tracks_counts_plays():
    client = register_and_login()
    client.post("/api/history", json=play_payload(1, "Played Twice"))
    client.post("/api/history", json=play_payload(1, "Played Twice"))
    client.post("/api/history", json=play_payload(2, "Played Once"))
    
    top = client.get("/api/history/top-tracks").json()
    assert len(top) == 2
    assert top[0]["title"] == "Played Twice"
    assert top[0]["play_count"] == 2
    assert top[1]["play_count"] == 1
    
def test_clearing_history_removes_every_entry():
    client = register_and_login()
    client.post("/api/history", json=play_payload())
    
    assert client.delete("/api/history/me").status_code == 204
    assert client.get("/api/history/me").json() == []
    
def test_history_only_shows_the_current_user():
    first = register_and_login()
    first.post("/api/history", json=play_payload(1, "Private Song"))
    
    second = register_and_login()
    assert second.get("/api/history/me").json() == []
    
def test_history_requires_authentication():
    client = TestClient(app)
    assert client.get("/api/history/me").status_code == 401
    assert client.post("/api/history", json=play_payload()).status_code == 401
    
def test_history_rejects_invalid_limit():
    client = register_and_login()
    assert client.get("/api/history/me", params={"limit": 0}).status_code == 422
    assert client.get("/api/history/me", params={"limit": 999}).status_code == 422
    
def test_stats_are_empty_for_a_new_user():
    client = register_and_login()
    stats = client.get("/api/history/stats").json()
    
    assert stats["total_plays"] == 0
    assert stats["unique_tracks"] == 0
    assert stats["unique_artists"] == 0
    assert stats["top_artists"] == []
    assert len(stats["plays_per_day"]) == 14
    
def test_stats_count_plays_and_unique_tracks():
    client = register_and_login()
    stats = client.post("/api/history", json=play_payload(1, "First Song"))
    stats = client.post("/api/history", json=play_payload(1, "First Song"))
    stats = client.post("/api/history", json=play_payload(2, "Second Song"))
    
    stats = client.get("/api/history/stats").json()
    assert stats["total_plays"] == 3
    assert stats["unique_tracks"] == 2
    assert stats["unique_artists"] == 1
    
def test_stats_rank_top_artists():
    client = register_and_login()
    stats = client.post("/api/history", json={"external_id": 1, "title": "A", "subtitle": "Artist One"})
    stats = client.post("/api/history", json={"external_id": 2, "title": "B", "subtitle": "Artist One"})
    stats = client.post("/api/history", json={"external_id": 3, "title": "C", "subtitle": "Artist Two"})
    
    top = client.get("/api/history/stats").json()["top_artists"]
    assert top[0] == {"name": "Artist One", "play_count": 2}
    assert top[1] == {"name": "Artist Two", "play_count": 1}
    
def test_stats_put_todays_plays_in_the_last_bucket():
    client = register_and_login()
    client.post("/api/history", json=play_payload())
    
    days = client.get("/api/history/stats").json()["plays_per_day"]
    assert len(days) == 14
    assert days[-1]["plays"] == 1
    assert days[0]["plays"] == 0
    
def test_stats_require_authentication():
    assert TestClient(app).get("/api/history/stats").status_code == 401 