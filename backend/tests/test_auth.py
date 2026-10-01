import pytest
from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models.user import User

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_users_table():
    db = SessionLocal()
    db.query(User).delete()
    db.commit()
    db.close()
    yield
    db = SessionLocal()
    db.query(User).delete()
    db.commit()
    db.close()
    
def register_payload(**overrides):
    payload = {
        "email": "test@example.com",
        "password": "supersecret123",
        "display_name": "Test User",
    }
    payload.update(overrides)
    return payload

def test_register_creates_user():
    response = client.post("/api/auth/register", json=register_payload())
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "test@example.com"
    assert "hashed_password" not in body
    
def test_register_rejects_duplicate_email():
    client.post("/api/auth/register", json=register_payload())
    response = client.post("/api/auth/register", json=register_payload())
    assert response.status_code == 409
    
def test_login_sets_cookie_and_me_works():
    client.post("/api/auth/register", json=register_payload())
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "supersecret123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.cookies
    
    me_response = client.get("/api/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "test@example.com"
    
def test_login_rejects_wrong_password():
    client.post("/api/auth/register", json=register_payload())
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    
def test_me_requires_authentication():
    response = client.get("/api/auth/me")
    assert response.status_code == 401