"""Local encrypted object storage. Callers must authorize access before reading."""
import os
from pathlib import Path
from uuid import UUID, uuid4
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class EncryptedVault:
    def __init__(self, directory: Path, key: bytes):
        if len(key) != 32:
            raise ValueError("A 256-bit storage key is required")
        self.directory = directory
        self.directory.mkdir(parents=True, exist_ok=True)
        self.cipher = AESGCM(key)

    def put(self, content: bytes) -> UUID:
        key = uuid4()
        nonce = os.urandom(12)
        encoded = nonce + self.cipher.encrypt(nonce, content, key.bytes)
        (self.directory / key.hex).write_bytes(encoded)
        return key

    def read(self, key: UUID) -> bytes:
        encoded = (self.directory / key.hex).read_bytes()
        return self.cipher.decrypt(encoded[:12], encoded[12:], key.bytes)
