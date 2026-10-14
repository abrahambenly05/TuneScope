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
from app.services import recommendations as recommendations_service

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
    email = f"feed_{uuid.uuid4().hex[:8]}@example.com"
    client.post(
        "/api/auth/register",
        json={"email": email, "password": "secret123", "display_name": "Reco Tester"},
    )
    client.post("/api/auth/login", json={"email": email, "password": "secret123"})
    return client

def record_play(client: TestClient, external_id: int) -> None:
    client.post(
        "/api/history",
        json={"external_id": external_id, "title": f"Track {external_id}"},
    )
    
def stub_deezer(monkeypatch, tracks: dict, related: dict, top_tracks: dict) -> None:
    async def fake_get_track(track_id: int) -> dict:
        return tracks[track_id]
    
    async def fake_get_related_artists(artist_id: int, limit: int = 5) -> list[dict]:
        return related.get(artist_id, [])
    
    async def fake_get_artist_top_tracks(artist_id: int, limit: int = 10) -> list[dict]:
        return top_tracks.get(artist_id, [])[:limit]
    
    monkeypatch.setattr(recommendations_service, "get_track", fake_get_track)
    monkeypatch.setattr(
        recommendations_service, "get_related_artists", fake_get_related_artists
    )
    monkeypatch.setattr(
        recommendations_service, "get_artist_top_tracks", fake_get_artist_top_tracks
    )

def test_returns_an_empty_list_without_history():
    client = register_and_login()
    response = client.get("/api/recommendations/tracks")
    
    assert response.status_code == 200
    assert response.json() == []
    
def test_recommends_tracks_from_related_artists(monkeypatch):
    client = register_and_login()
    record_play(client, 1)
    
    stub_deezer(
        monkeypatch,
        tracks={1: {"id": 1, "artist": {"id": 10}}},
        related={10: [{"id": 20}]},
        top_tracks={20: [{"id": 200, "title": "New Song"}]},
    )
    
    body = client.get("/api/recommendations/tracks").json()
    assert len(body) == 1
    assert body[0]["title"] == "New Song"
    
def test_excludes_tracks_the_user_already_played(monkeypatch):
    client = register_and_login()
    record_play(client, 1)
    
    stub_deezer(
        monkeypatch,
        tracks={1: {"id": 1, "artist": {"id": 10}}},
        related={10: [{"id": 20}]},                
        top_tracks={20: [{"id": 1, "title": "Already Played"}, {"id": 200, "title": "New Song"}]},
    )
    
    titles = [track["title"] for track in client.get("/api/recommendations/tracks").json()]
    assert titles == ["New Song"]
    
def test_does_not_recommend_artists_the_user_already_listens_to(monkeypatch):
    client = register_and_login()
    record_play(client, 1)
    
    stub_deezer(
        monkeypatch,
        tracks={1: {"id": 1, "artist": {"id": 10}}},
        related={10: [{"id": 10}, {"id": 20}]},                
        top_tracks={
            10: [{"id": 100, "title": "Same Artist"}], 
            20: [{"id": 200, "title": "New Song"}],
        },
    )
    
    titles = [track["title"] for track in client.get("/api/recommendations/tracks").json()]
    assert titles == ["New Song"]
    
def test_does_not_repeat_the_same_track(monkeypatch):
    client = register_and_login()
    record_play(client, 1)
    
    stub_deezer(
        monkeypatch,
        tracks={1: {"id": 1, "artist": {"id": 10}}},
        related={10: [{"id": 20}, {"id": 30}]},                
        top_tracks={
            20: [{"id": 200, "title": "Shared Song"}], 
            30: [{"id": 200, "title": "Shared Song"}],
        },
    )
    
    assert len(client.get("/api/recommendations/tracks").json()) == 1
    
def test_respects_the_limit(monkeypatch):
    client = register_and_login()
    record_play(client, 1)
    
    stub_deezer(
        monkeypatch,
        tracks={1: {"id": 1, "artist": {"id": 10}}},
        related={10: [{"id": 20}]},                
        top_tracks={
            20: [
                {"id": 200, "title": "One"},
                {"id": 201, "title": "Two"},
                {"id": 202, "title": "Three"},
            ]
        },
    )
    
    body = client.get("/api/recommendations/tracks", params={"limit": 2}).json()
    assert len(body) == 2
    
def test_requires_authentication():
    assert TestClient(app).get("/api/recommendations/tracks").status_code == 401

def test_rejects_an_invalid_limit():
    client = register_and_login()
    assert client.get("/api/recommendations/tracks", params={"limit": 0}).status_code == 422
    assert client.get("/api/recommendations/tracks", params={"limit": 99}).status_code == 422