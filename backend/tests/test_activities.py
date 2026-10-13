import uuid

import pytest
from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models.activity import Activity
from app.models.playlist import Playlist
from app.models.review import Review
from app.models.user import User

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_tables():
    db = SessionLocal()
    db.query(Activity).delete()
    db.query(Review).delete()
    db.query(Playlist).delete()
    db.query(User).delete()
    db.commit()
    db.close()
    
def register_and_login() -> TestClient:
    client = TestClient(app)
    email = f"feed_{uuid.uuid4().hex[:8]}@example.com"
    client.post(
        "/api/auth/register",
        json={"email": email, "password": "secret123", "display_name": "Feed Tester"},
    )
    client.post("/api/auth/login", json={"email": email, "password": "secret123"})
    return client

def review_payload(external_id: int = 313556, rating: int = 5) -> dict:
    return {
        "item_type": "track",
        "external_id": external_id,
        "rating": rating,
        "comment": "Great track",
        "title": "Harder, Better, Faster, Stronger",
        "subtitle": "Daft Punk",
        "image_url": "https://example.com/cover.jpg",
    }
    
def test_feed_is_empty_initially():
    client = TestClient(app)
    response = client.get("/api/activities")
    assert response.status_code == 200
    assert response.json() == []

def test_creating_review_records_activity():
    client = register_and_login()
    review = client.post("/api/reviews", json=review_payload()).json()
    
    feed = TestClient(app).get("/api/activities").json()
    assert feed[0]["activity_type"] == "review"
    assert feed[0]["reference_id"] == review["id"]
    assert feed[0]["owner_name"] == "Feed Tester"
    assert feed[0]["rating"] == 5
    assert feed[0]["item_type"] == "track"
    
def test_updating_review_does_not_duplicate_activity():
    client = register_and_login()
    client.post("/api/reviews", json=review_payload(rating=5))
    client.post("/api/reviews", json=review_payload(rating=2))
    
    feed = TestClient(app).get("/api/activities").json()
    assert len(feed) == 1
    assert feed[0]["rating"] == 2
    
def test_deleting_review_removes_activity():
    client = register_and_login()
    review = client.post("/api/reviews", json=review_payload()).json()
    
    assert client.delete(f"/api/reviews/{review['id']}").status_code == 204
    assert TestClient(app).get("/api/activities").json() == []
    
def test_public_playlist_records_activity():
    client = register_and_login()
    playlist = client.post(
        "/api/playlists", json={"name": "Late Night Drive", "is_public": True}
    ).json()
    
    feed = TestClient(app).get("/api/activities").json()
    assert len(feed) == 1
    assert feed[0]["activity_type"] == "playlist"
    assert feed[0]["reference_id"] == playlist["id"]
    assert feed[0]["title"] == "Late Night Drive"
    assert feed[0]["subtitle"] == "0 tracks"
    assert feed[0]["rating"] is None
    
def test_private_playlist_is_not_in_feed():
    client = register_and_login()
    client.post("/api/playlists", json={"name": "Secret Mix", "is_public": False})
    
    assert TestClient(app).get("/api/activities").json() == []
    
def test_making_playlist_private_removes_activity():
    client = register_and_login()
    playlist = client.post(
        "/api/playlists", json={"name": "Chill", "is_public": True}
    ).json()
    assert len(TestClient(app).get("/api/activities").json()) == 1
    
    client.patch(f"/api/playlists/{playlist['id']}/visibility", json={"is_public": False})
    assert TestClient(app).get("/api/activities").json() == []
    
def test_deleting_playlist_removes_activity():
    client = register_and_login()
    playlist = client.post(
        "/api/playlists", json={"name": "Road Trip", "is_public": True}
    ).json()
    
    assert client.delete(f"/api/playlists/{playlist['id']}").status_code == 204
    assert TestClient(app).get("/api/activities").json() == []

def test_feed_orders_newest_first():
    client = register_and_login()
    client.post("/api/reviews", json=review_payload())
    client.post("/api/playlists", json={"name": "Newest", "is_public": True})
    
    feed = TestClient(app).get("/api/activities").json()
    assert len(feed) == 2
    assert feed[0]["activity_type"] == "playlist"
    assert feed[1]["activity_type"] == "review"
    
def test_my_activities_requires_authentication():
    response = TestClient(app).get("/api/activities/me")
    assert response.status_code == 401
    
def test_my_activities_returns_own_activities():
    client = register_and_login()
    client.post("/api/reviews", json=review_payload())
    
    response = client.get("/api/activities/me")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["owner_name"] == "Feed Tester"
    
def test_feed_rejects_invalid_limit():
    client = TestClient(app)
    assert client.get("/api/activities", params={"limit": 0}).status_code == 422
    assert client.get("/api/activities", params={"limit": 999}).status_code == 422