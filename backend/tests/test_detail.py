from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

FAKE_TRACK = {"id": 1, "title": "Fake Track", "duration": 200}
FAKE_ARTIST = {"id": 1, "name": "Fake Artist", "nb_fan": 100}
FAKE_TOP_TRACKS = {"data": [{"id": 1, "title": "Fake Top Track"}]}
FAKE_ALBUMS = {"data": [{"id": 1, "title": "Fake Album"}]}
FAKE_ALBUM = {"id": 1, "title": "Fake Album", "tracks": {"data": [{"id": 1, "title": "Fake Track"}]}}
FAKE_ERROR = {"error": {"type": "DataException", "message": "no data", "code": 800}}

def test_track_detail(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/track/1", json=FAKE_TRACK
    )
    response = client.get("/api/tracks/1")
    assert response.status_code == 200
    assert response.json() == FAKE_TRACK
    
def test_track_detail_not_found(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/track/999", status_code=404, json=FAKE_ERROR
    )
    response = client.get("/api/tracks/999")
    assert response.status_code == 404
    
def test_artist_detail(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/artist/1", json=FAKE_ARTIST
    )
    httpx_mock.add_response(
        url="https://api.deezer.com/artist/1/top?limit=10", json=FAKE_TOP_TRACKS
    )
    httpx_mock.add_response(
        url="https://api.deezer.com/artist/1/albums?limit=20", json=FAKE_ALBUMS
    )
    response = client.get("/api/artists/1")
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Fake Artist"
    assert body["top_tracks"] == FAKE_TOP_TRACKS["data"]
    assert body["albums"] == FAKE_ALBUMS["data"]
    
def test_artist_detail_not_found(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/artist/999", status_code=404, json=FAKE_ERROR
    )
    response = client.get("/api/artists/999")
    assert response.status_code == 404
    
def test_album_detail(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/album/1", json=FAKE_ALBUM
    )
    response = client.get("/api/albums/1")
    assert response.status_code == 200
    assert response.json() == FAKE_ALBUM
    
def test_album_detail_not_found(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/album/999", status_code=404, json=FAKE_ERROR
    )
    response = client.get("/api/albums/999")
    assert response.status_code == 404