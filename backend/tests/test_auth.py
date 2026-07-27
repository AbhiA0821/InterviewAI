import jwt
from fastapi.testclient import TestClient
from app.config import get_settings
from app.main import app

client = TestClient(app)
settings = get_settings()


def test_google_jwt_authentication_flow():
    # 1. Test POST /api/auth/google
    payload = {
        "email": "test.google.candidate@interviewai.com",
        "display_name": "Test Google User",
        "photo_url": "https://example.com/photo.jpg",
        "google_id": "google-sub-123456",
    }
    response = client.post("/api/auth/google", json=payload)
    assert response.status_code == 200, response.text

    data = response.json()
    assert "token" in data
    assert data["email"] == payload["email"]
    assert data["display_name"] == payload["display_name"]

    # 2. Verify JWT token structure and signature
    token = data["token"]
    decoded = jwt.decode(
        token, settings.SECRET_KEY or "interviewai-secret-key-123", algorithms=["HS256"]
    )
    assert decoded["email"] == payload["email"]
    assert "user_id" in decoded

    # 3. Test GET /api/auth/me with Bearer token header
    headers = {"Authorization": f"Bearer {token}"}
    me_response = client.get("/api/auth/me", headers=headers)
    assert me_response.status_code == 200, me_response.text

    me_data = me_response.json()
    assert me_data["authenticated"] is True
    assert me_data["email"] == payload["email"]
    assert me_data["display_name"] == payload["display_name"]
