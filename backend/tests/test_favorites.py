import pytest
from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models.favorite import Favorite
from app.models.user import User

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_tables():
    db = SessionLocal()
    db.query(Favorite).delete()
    db.query(User).delete()
    db.commit()
    db.close()
    yield
    db = SessionLocal()
    db.query(Favorite).delete()
    db.query(User).delete()
    db.commit()
    db.close()
    
def register_and_login(email="fav@example.com"):
    client.post(
        "/api/auth/register",
        json={"email": email, "password": "supersecret123", "display_name": "Fav User"},
    )
    client.post("/api/auth/login", json={"email": email, "password": "supersecret123"})
    
def favorite_payload(**overrides):
    payload= {
        "item_type": "track",
        "external_id": 123,
        "title": "Fake Song",
        "subtitle": "Fake Artist",
        "image_url": "https://example.com/cover.jpg",
    }
    payload.update(overrides)
    return payload

def test_add_favorites_requires_authentication():
    response = client.post("/api/favorites", json=favorite_payload())
    assert response.status_code == 401
    
def test_add_and_list_favorite():
    register_and_login()
    add_response = client.post("/api/favorites", json=favorite_payload())
    assert add_response.status_code == 201
    
    list_response = client.get("/api/favorites")
    assert list_response.status_code == 200
    body = list_response.json()
    assert len(body) == 1
    assert body[0]["title"] == "Fake Song"
    
def test_add_favorite_is_idempotent():
    register_and_login()
    client.post("/api/favorites", json=favorite_payload())
    second_response = client.post("/api/favorites", json=favorite_payload())
    assert second_response.status_code == 201
        
    list_response = client.get("/api/favorites")
    assert len(list_response.json()) == 1
    
def test_list_favorites_filters_by_item_type():
    register_and_login()
    client.post("/api/favorites", json=favorite_payload())
    client.post("/api/favorites", json=favorite_payload(item_type="artist", external_id=456, title="Fake Artist"))
    
    response = client.get("/api/favorites?item_type=artist")
    body = response.json()
    assert len(body) == 1
    assert body[0]["item_type"] == "artist"

def test_remove_favorite():
    register_and_login()
    add_response = client.post("/api/favorites", json=favorite_payload())
    favorite_id = add_response.json()["id"]
    
    delete_response = client.delete(f"/api/favorites/{favorite_id}")
    assert delete_response.status_code == 204
    
    list_response = client.get("/api/favorites")
    assert list_response.json() == []
    
def test_remove_favorite_not_owned_returns_404():
    register_and_login("owner@example.com")
    add_response = client.post("/api/favorites", json=favorite_payload())
    favorite_id = add_response.json()["id"]
    client.post("/api/auth/logout")
    
    register_and_login("other@example.com")
    delete_response = client.delete(f"/api/favorites/{favorite_id}")
    assert delete_response.status_code == 404