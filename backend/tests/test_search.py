from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

FAKE_TRACK_RESPONSE = {
    "data": [
        {
            "id": 1,
            "title": "Fake Track",
            "preview": "https://example.com/preview.mp3",
            "artist": {"id": 1, "name": "Fake Artist"},
            "album": {"id": 1, "title": "Fake Album"},
        }
    ]
}

FAKE_ARTIST_RESPONSE = {
    "data": [{"id": 1, "name": "Fake Artist", "nb_fan": 100}]
}

FAKE_ALBUM_RESPONSE = {
    "data": [{"id": 1, "title": "Fake Album", "nb_tracks": 10}]
}

def test_search_tracks(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/search/track?q=blinding+lights&limit=20",
        json=FAKE_TRACK_RESPONSE,
    )
    response = client.get("/api/search/tracks?q=blinding lights")
    assert response.status_code == 200
    assert response.json() == FAKE_TRACK_RESPONSE

def test_search_artists(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/search/artist?q=weeknd&limit=20",
        json=FAKE_ARTIST_RESPONSE,
    )
    response = client.get("/api/search/artists?q=weeknd")
    assert response.status_code == 200
    assert response.json() == FAKE_ARTIST_RESPONSE

def test_search_albums(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/search/album?q=after+hours&limit=20",
        json=FAKE_ALBUM_RESPONSE,
    )
    response = client.get("/api/search/albums?q=after hours")
    assert response.status_code == 200
    assert response.json() == FAKE_ALBUM_RESPONSE
    
def test_search_tracks_requires_query():
    response = client.get("/api/search/tracks")
    assert response.status_code == 422