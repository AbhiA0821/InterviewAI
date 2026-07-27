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
    assert response.json() == {"status": "ok"}
