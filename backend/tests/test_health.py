"""
test_health.py
---------------
Basic sanity test to confirm the FastAPI app boots and the health
endpoint responds. Expand with real test coverage in later phases.
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app_name"] == "Interview with Abhi"
    assert "config" in data


def test_api_health_check_alias():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data

