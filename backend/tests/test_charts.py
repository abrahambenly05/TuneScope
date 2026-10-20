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

FAKE_ALBUM_RESPONSE = {"data": [{"id": 1, "title": "Fake Album"}]}
FAKE_ARTIST_RESPONSE = {"data": [{"id": 1, "name": "Fake Artist"}]}

def test_popular_albums(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/chart/0/albums?limit=20",
        json=FAKE_ALBUM_RESPONSE,
    )
    response = client.get("/api/charts/albums")
    assert response.status_code == 200
    assert response.json() == FAKE_ALBUM_RESPONSE

def test_popular_artists(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/chart/0/artists?limit=20",
        json=FAKE_ARTIST_RESPONSE,
    )
    response = client.get("/api/charts/artists")
    assert response.status_code == 200
    assert response.json() == FAKE_ARTIST_RESPONSE

def test_new_releases(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/chart/0/artists?limit=25",
        json={"data": [{"id": 1, "name": "Artist A"}, {"id": 2, "name": "Artist B"}]},
    )
    httpx_mock.add_response(
        url="https://api.deezer.com/artist/1/albums?limit=3",
        json={"data": [{"id": 10, "title": "Old Album", "release_date": "2020-01-01"}]},
    )
    httpx_mock.add_response(
        url="https://api.deezer.com/artist/2/albums?limit=3",
        json={
            "data": [
                {"id": 20, "title": "Upcoming Album", "release_date": "2999-01-01"},
                {"id": 21, "title": "New Album", "release_date": "2024-01-01"},
            ]
        },
    )

    response = client.get("/api/charts/new-releases")

    assert response.status_code == 200
    albums = response.json()["data"]
    assert [album["title"] for album in albums] == ["New Album", "Old Album"]
    assert albums[0]["artist"]["name"] == "Artist B"