import pytest
from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models.playlist import Playlist
from app.models.user import User

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_tables():
    db = SessionLocal()
    db.query(Playlist).delete()
    db.query(User).delete()
    db.commit()
    db.close()
    yield
    db = SessionLocal()
    db.query(Playlist).delete()
    db.query(User).delete()
    db.commit()
    db.close()
    
def register_and_login(email="playlist@example.com"):
    client.post(
        "/api/auth/register",
        json={"email": email, "password": "supersecret123", "display_name": "Playlist User"},
    )
    client.post("/api/auth/login", json={"email": email, "password": "supersecret123"})
    
def track_payload(**overrides):
    payload ={
        "external_id": 123,
        "title": "Fake Song",
        "subtitle": "Fake Artist",
        "image_url": "https://example.com/cover.jpg",
    }
    payload.update(overrides)
    return payload

def test_create_and_list_playlist():
    register_and_login()
    create_response = client.post("/api/playlists", json={"name": "Road Trip"})
    assert create_response.status_code == 201
    assert create_response.json()["is_public"] is False
    
    lits_response = client.get("/api/playlists")
    assert len(lits_response.json()) == 1
    
def test_rename_playlist():
    register_and_login()
    playlist_id = client.post("/api/playlists", json={"name": "Old Name"}).json()["id"]
    response = client.patch(f"/api/playlists/{playlist_id}", json={"name": "New Name"})
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"
    
def test_set_playlist_visibility():
    register_and_login()
    playlist_id = client.post("/api/playlists", json={"name": "Mix"}).json()["id"]
    response = client.patch(
        f"/api/playlists/{playlist_id}/visibility", json={"is_public": True}
    )
    assert response.status_code == 200
    assert response.json()["is_public"] is True
    
def test_add_and_remove_track_reindexes_positions():
    register_and_login()
    playlist_id = client.post("/api/playlists", json={"name": "Mix"}).json()["id"]
    
    client.post(f"/api/playlists/{playlist_id}/tracks", json=track_payload(external_id=1))
    client.post(f"/api/playlists/{playlist_id}/tracks", json=track_payload(external_id=2))
    detail = client.post(
        f"/api/playlists/{playlist_id}/tracks", json=track_payload(external_id=3)
    ).json()
    assert [t["position"] for t in detail["tracks"]] == [0, 1, 2]
    
    first_track_id = detail["tracks"][0]["id"]
    after_remove = client.delete(
        f"/api/playlists/{playlist_id}/tracks/{first_track_id}"
    ).json()
    assert [t["position"] for t in after_remove["tracks"]] == [0, 1]
    
def test_reorder_tracks():
    register_and_login()
    playlist_id = client.post("/api/playlists", json={"name": "Mix"}).json()["id"]
    client.post(f"/api/playlists/{playlist_id}/tracks", json=track_payload(external_id=1))
    detail = client.post(
        f"/api/playlists/{playlist_id}/tracks", json=track_payload(external_id=2)
    ).json()
    
    track_a, track_b = detail["tracks"]
    response = client.patch(
        f"/api/playlists/{playlist_id}/tracks/reorder",
        json=[
            {"track_id": track_a["id"], "position": 1},
            {"track_id": track_b["id"], "position": 0},
        ],
    )
    reordered = response.json()["tracks"]
    assert reordered[0]["id"] == track_b["id"]

def test_delete_playlist():
    register_and_login()
    playlist_id = client.post("/api/playlists", json={"name": "Temp"}).json()["id"]
    response = client.delete(f"/api/playlists/{playlist_id}")
    assert response.status_code == 204
    assert client.get("/api/playlists").json() == []

def test_playlist_not_owned_returns_404():
    register_and_login("owner@example.com")
    playlist_id = client.post("/api/playlists", json={"name": "Mix"}).json()["id"]
    client.post("/api/auth/logout")
    
    register_and_login("other@example.com")
    response = client.get(f"/api/playlists/{playlist_id}")
    assert response.status_code == 404
    
def test_list_public_playlists_only_returns_public_ones():
    register_and_login()
    public_id = client.post("/api/playlists", json={"name": "Public Mix"}).json()["id"]
    client.patch(f"/api/playlists/{public_id}/visibility", json={"is_public": True})
    client.post("/api/playlists", json={"name": "Private Mix"})
    
    response = client.get("/api/playlists/public")
    assert response.status_code == 200
    
    body = response.json()
    assert len(body) == 1
    assert body[0]["name"] == "Public Mix"
    assert body[0]["owner_name"] == "Playlist User"
    assert body[0]["track_count"] == 0
    
def test_get_public_playlist_detail():
    register_and_login()
    playlist_id = client.post("/api/playlists", json={"name": "Public Mix"}).json()["id"]
    client.patch(f"/api/playlists/{playlist_id}/visibility", json={"is_public": True})
    client.post(f"/api/playlists/{playlist_id}/tracks", json=track_payload(external_id=1))
    
    response = client.get(f"/api/playlists/public/{playlist_id}")
    assert response.status_code == 200
    
    body = response.json()
    assert body["owner_name"] == "Playlist User"
    assert body["track_count"] == 1
    assert len(body["tracks"]) == 1
    
def test_get_private_playlist_via_public_endpoint_returns_404():
    register_and_login()
    playlist_id = client.post("/api/playlists", json={"name": "Private Mix"}).json()["id"]
    
    response = client.get(f"/api/playlists/public/{playlist_id}")
    assert response.status_code == 404