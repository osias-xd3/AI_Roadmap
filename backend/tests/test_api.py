import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.routers.chat import SYSTEM_GUARDRAIL
from app.routers.certifications import load_roadmap_certifications

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "AI Roadmap v3 API"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "endpoints" in data
    assert "roadmap" in data["endpoints"]
    assert "chat" in data["endpoints"]

def test_roadmap_loading():
    response = client.get("/api/roadmap")
    assert response.status_code == 200
    data = response.json()
    assert len(data.get("phases", [])) == 12
    # Ensure Phase 0 to Phase 11 exist
    phase_numbers = [p["phase_number"] for p in data["phases"]]
    assert phase_numbers == list(range(12))

def test_certifications_loading():
    certs = load_roadmap_certifications()
    assert len(certs) == 17
    # Verify key free certifications are tracked
    names = [c["name"] for c in certs]
    assert any("CS50P" in name for name in names)
    assert any("Oracle" in name or "OCI" in name for name in names)

def test_chat_guardrail_prompt():
    # Verify strict system guardrail includes required scoping and refusal instructions
    assert "STRICT GUARDRAIL" in SYSTEM_GUARDRAIL
    assert "polite" in SYSTEM_GUARDRAIL.lower() or "politely" in SYSTEM_GUARDRAIL.lower()
    assert "AI Roadmap" in SYSTEM_GUARDRAIL

def test_chat_requires_auth():
    # Unauthenticated chat should be rejected with 401
    response = client.post("/api/chat", json={
        "messages": [{"role": "user", "content": "What is backpropagation?"}]
    })
    assert response.status_code == 401
    assert "Authorization header is required" in response.json()["detail"]

def test_chat_with_dev_mock_token():
    # Dev test token bypass allows development testing without live Google sign-in
    response = client.post(
        "/api/chat",
        headers={"Authorization": "Bearer dev-test-token:test-student"},
        json={
            "messages": [{"role": "user", "content": "Explain Phase 0 Python setup"}]
        }
    )
    # If GEMINI_API_KEY is valid, it responds with 200, otherwise internal error with details
    assert response.status_code in [200, 500]
