import httpx
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import discovery as discovery_service

client = TestClient(app)

def lastfm_track(title: str, artist: str) -> dict:
    return {"name": title, "artist": {"name": artist}}
    
def stub_services(monkeypatch, tagged: list[dict], deezer: dict[str, list[dict]]):
    async def fake_get_tag_top_tracks(tag: str, limit: int = 20) -> list[dict]:
        return tagged
    
    async def fake_search_tracks(query: str, limit: int = 20) -> list[dict]:
        return deezer.get(query, [])
    
    monkeypatch.setattr(discovery_service, "get_tag_top_tracks", fake_get_tag_top_tracks)
    monkeypatch.setattr(discovery_service, "search_tracks", fake_search_tracks)

def test_moods_are_listed():
    response = client.get("/api/discovery/moods")
    
    assert response.status_code == 200
    assert "chill" in response.json()
    assert "workout" in response.json()
    
def test_unknown_mood_is_rejected():
    assert client.get("/api/discovery/tracks", params={"mood": "angry"}).status_code == 404
    
def test_returns_deezer_tracks_for_a_mood(monkeypatch):
    stub_services(
        monkeypatch,
        tagged=[lastfm_track("Sweater Weather", "The Neighbourhood")],
        deezer={
            "The Neighbourhood Sweater Weather": [
                {"id": 1, "title": "Sweater Weather"}
            ]
        },
    )
    
    body = client.get("/api/discovery/tracks", params={"mood": "chill"}).json()
    assert len(body) == 1
    assert body[0]["title"] == "Sweater Weather"
    
def test_skips_tracks_that_deezer_does_not_have(monkeypatch):
    stub_services(
        monkeypatch,
        tagged=[
            lastfm_track("Missing Song", "Unknown Artist"),
            lastfm_track("Found Song", "Known Artist"),
        ],
        deezer={"Known Artist Found Song": [{"id": 2, "title": "Found Song"}]},
    )
    
    body = client.get("/api/discovery/tracks", params={"mood": "chill"}).json()
    assert len(body) == 1
    assert body[0]["title"] == "Found Song"
    
def test_does_not_repeat_the_same_track(monkeypatch):
    stub_services(
        monkeypatch,        
        tagged=[
            lastfm_track("Same Song", "Artist A"),
            lastfm_track("Same Song (Live)", "Artist A"),
        ],
        deezer={
            "Artist A Same Song": [{"id": 3, "title": "Same Song"}],
            "Artist A Same Song (Live)": [{"id": 3, "title": "Same Song"}], 
        },
    )
    
    assert len(client.get("/api/discovery/tracks", params={"mood": "chill"}).json()) == 1
    
def test_respects_the_limit(monkeypatch):
    stub_services(
        monkeypatch,
        tagged=[lastfm_track(f"Song {n}", "Artist") for n in range(5)],
        deezer={f"Artist Song {n}": [{"id": n, "title": f"Song {n}"}] for n in range(5)},
    )
    
    body = client.get(
        "/api/discovery/tracks", params={"mood": "chill", "limit": 2}
    ).json()
    assert len(body) == 2
    
def test_returns_an_empty_list_when_lastfm_fails(monkeypatch):
    async def failing_get_tag_top_tracks(tag: str, limit: int = 20) -> list[dict]:
        raise httpx.ConnectError("last.fm is unreachable")
    
    monkeypatch.setattr(
        discovery_service, "get_tag_top_tracks", failing_get_tag_top_tracks
    )
    
    response = client.get("/api/discovery/tracks", params={"mood": "chill"})
    assert response.status_code == 200
    assert response.json() == []

def test_rejects_an_invalid_limit():
    assert client.get(
        "/api/discovery/tracks", params={"mood": "chill", "limit": 0}
    ).status_code == 422
    assert client.get(
        "/api/discovery/tracks", params={"mood": "chill", "limit": 99}
    ).status_code == 422