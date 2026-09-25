import httpx
import pytest

from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

FAKE_DEEZER_RESPONSE = {
    "data": [
        {
            "id": 123,
            "title": "Fake Song",
            "preview": "https://example.com/preview.mp3",
            "artist": {"id": 1, "name": "Fake Artist"},
            "album": {"id": 1, "title": "Fake Album", "cover_medium": "https://example.com/cover.jpg"},
        }
    ]
}

def test_trending_tracks(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/chart/0/tracks?limit=20",
        json=FAKE_DEEZER_RESPONSE
    )
    
    response = client.get("/api/charts/trending")
    
    assert response.status_code == 200
    assert response.json() == FAKE_DEEZER_RESPONSE