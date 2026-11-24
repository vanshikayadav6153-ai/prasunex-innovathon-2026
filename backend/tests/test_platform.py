import os
from fastapi.testclient import TestClient
from app.main import app
from app.vault import EncryptedVault

def test_readiness():
    response = TestClient(app).get("/api/v1/ready")
    assert response.status_code == 200
    assert response.json()["ready"] is True

def test_encrypted_storage(tmp_path):
    vault = EncryptedVault(tmp_path, os.urandom(32))
    ref = vault.put(b"demo document")
    assert b"demo document" not in (tmp_path / ref.hex).read_bytes()
    assert vault.read(ref) == b"demo document"
