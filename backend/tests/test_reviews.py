import pytest
from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models.review import Review
from app.models.user import User

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_tables():
    db = SessionLocal()
    db.query(Review).delete()
    db.query(User).delete()
    db.commit()
    db.close()
    yield
    db = SessionLocal()
    db.query(Review).delete()
    db.query(User).delete()
    db.commit()
    db.close()
    
def register_and_login(email="review@example.com"):
    client.post(
        "/api/auth/register",
        json={"email": email, "password": "supersecret123", "display_name": "Review User"},
    )
    client.post("/api/auth/login", json={"email": email, "password": "supersecret123"})
    
def review_payload(**overrides):
    payload ={
        "item_type": "track",
        "external_id": 123,
        "rating": 5,
        "comment": "Great song!",
        "title": "Fake Song",
        "subtitle": "Fake Artist",
        "image_url": "https://example.com/cover.jpg",
    }
    payload.update(overrides)
    return payload

def test_create_review():
    register_and_login()
    response = client.post("/api/reviews", json=review_payload())
    assert response.status_code == 201
    assert response.json()["rating"] == 5
    assert response.json()["comment"] == "Great song!"
    
def test_create_review_upserts_instead_of_duplicating():
    register_and_login()
    first = client.post("/api/reviews", json=review_payload(rating=5)).json()
    second = client.post("/api/reviews", json=review_payload(rating=3)).json()
    
    assert first["id"] == second["id"]
    assert second["rating"] == 3
    
    listed = client.get(
        "/api/reviews", params={"item_type": "track", "external_id": 123}
    ).json()
    assert len(listed) == 1
    
def test_list_reviews_for_item():
    register_and_login()
    client.post("/api/reviews", json=review_payload())
    response = client.get(
        "/api/reviews", params={"item_type": "track", "external_id": 123}
    )
    assert response.status_code == 200
    assert len (response.json()) == 1
    
def test_review_summary():
    register_and_login("user1@example.com")
    client.post("/api/reviews", json=review_payload(rating=5))
    client.post("/api/auth/logout")
    
    register_and_login("user2@example.com")
    client.post("/api/reviews", json=review_payload(rating=3))
    
    response = client.get(
        "/api/reviews/summary", params={"item_type": "track", "external_id": 123}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["review_count"] == 2
    assert body["average_rating"] == 4.0
    
def test_review_summary_with_no_reviews():
    response = client.get(
        "/api/reviews/summary", params={"item_type": "track", "external_id": 999}
    )
    assert response.status_code == 200
    assert response.json() == {
        "item_type": "track",
        "external_id": 999, 
        "average_rating": 0.0,
        "review_count": 0,
    }
    
def test_list_my_review():
    register_and_login()
    client.post("/api/reviews", json=review_payload())
    response = client.get("/api/reviews/me")
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_update_review():
    register_and_login()
    review_id = client.post("/api/reviews", json=review_payload()).json()["id"]
    response = client.patch(
        f"/api/reviews/{review_id}", json={"rating": 2, "comment": "Changed my mind"}
    )
    assert response.status_code == 200
    assert response.json()["rating"] == 2
    assert response.json()["comment"] == "Changed my mind"
    
def test_delete_review():
    register_and_login()
    review_id = client.post("/api/reviews", json=review_payload()).json()["id"]
    response = client.delete(f"/api/reviews/{review_id}")
    assert response.status_code == 204
    
    summary = client.get(
        "/api/reviews/summary", params={"item_type": "track", "external_id": 123}
    ).json()
    assert summary["review_count"] == 0
    
def test_review_not_owned_returns_404():
    register_and_login("owner@example.com")
    review_id = client.post("/api/reviews", json=review_payload()).json()["id"]
    client.post("/api/auth/logout")
    
    register_and_login("other@example.com")
    response = client.patch(f"/api/reviews/{review_id}", json={"rating": 1})
    assert response.status_code == 404