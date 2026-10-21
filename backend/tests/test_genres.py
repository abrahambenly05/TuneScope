from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

FAKE_GENRES_RESPONSE = {
    "data": [
        {"id": 0, "name": "All genres", "picture": "https://example.com/all.jpg"},
        {"id": 132, "name": "Pop", "picture": "https://example.com/pop.jpg"},
        {"id": 116, "name": "Rap/Hip Hop", "picture": "https://example.com/rap.jpg"},
    ]
}
FAKE_GENRE_DETAIL = {"id": 132, "name": "Pop", "picture": "https://example.com/pop.jpg"}
FAKE_GENRE_TRACKS_RESPONSE = {
    "data": [
        {"id": 1, "title": "Song A", "artist": {"id": 10, "name": "Artist A"}},
        {"id": 2, "title": "Song B", "artist": {"id": 10, "name": "Artist A"}},
        {"id": 3, "title": "Song C", "artist": {"id": 20, "name": "Artist B"}},
    ]
}

def test_list_genres_exludes_all_genres(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/genre",
        json=FAKE_GENRES_RESPONSE,
    )
    response = client.get("/api/genres")
    assert response.status_code == 200
    ids = [genre["id"] for genre in response.json()["data"]]
    assert 0 not in ids
    assert 132 in ids
    
def test_genre_detail(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/genre/132",
        json=FAKE_GENRE_DETAIL,
    )
    httpx_mock.add_response(
        url="https://api.deezer.com/chart/132/tracks?limit=100",
        json=FAKE_GENRE_TRACKS_RESPONSE,
    )
    response = client.get("/api/genres/132")
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Pop"
    assert [artist["name"] for artist in body["artists"]] == ["Artist A", "Artist B"]
    
def test_genre_detail_not_found(httpx_mock):
    httpx_mock.add_response(
        url="https://api.deezer.com/genre/999",
        status_code=404,
        json={"error": "not found"},
    )
    response = client.get("/api/genres/999")
    assert response.status_code == 404