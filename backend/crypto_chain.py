"""
Cryptography + blockchain utilities for Samadhan Setu.

What this gives the app, in plain terms:

1. Digital signatures (Ed25519) — every ledger block is signed with a
   server keypair generated on first run and stored in backend/keys/.
   Anyone holding the public key (exposed via /api/chain/public-key) can
   confirm a block was really produced by this server and hasn't been
   altered since.

2. A hash-chained ledger ("blockchain") — every important event
   (a problem being reported, its status changing) is appended as a
   block that includes the hash of the block before it. Changing any
   historical block breaks every hash after it, which is what makes the
   ledger tamper-evident. It's a single-node educational/transparency
   ledger, not a distributed blockchain network — that's the right
   scope for this app and this machine.

3. Encryption at rest (Fernet = AES-128-CBC + HMAC-SHA256) for
   sensitive fields such as an organisation's registered name, so the
   raw value never sits in the database in plain text.
"""
import hashlib
import json
import os
import sqlite3
import threading
import time
from pathlib import Path
from typing import Optional

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

BASE = Path(__file__).resolve().parent
# On hosts with a persistent disk (e.g. Render), set KEYS_DIR to a path on that
# disk so the signing keypair survives redeploys instead of regenerating (which
# would invalidate every previously signed ledger entry).
KEY_DIR = Path(os.getenv("KEYS_DIR", str(BASE / "keys")))
KEY_DIR.mkdir(parents=True, exist_ok=True)
PRIVATE_KEY_PATH = KEY_DIR / "ed25519_private.key"
PUBLIC_KEY_PATH = KEY_DIR / "ed25519_public.key"
FERNET_KEY_PATH = KEY_DIR / "fernet.key"
DB = BASE / "samadhan_setu.db"
_append_lock = threading.Lock()


# ---------------- Ed25519 signing key (generated once, persisted) ----------------
def _write_private(path: Path, data: bytes) -> None:
    """Write a secret key file and restrict it to owner read/write only.

    Prevents other local accounts on a shared server from reading the
    signing key or the encryption-at-rest key off disk.
    """
    path.write_bytes(data)
    try:
        os.chmod(path, 0o600)
    except OSError:
        # Best-effort: some filesystems (e.g. certain Windows setups) don't
        # support POSIX chmod bits; the key is still written correctly.
        pass


def _load_or_create_signing_key() -> ed25519.Ed25519PrivateKey:
    if PRIVATE_KEY_PATH.exists():
        return ed25519.Ed25519PrivateKey.from_private_bytes(PRIVATE_KEY_PATH.read_bytes())
    priv = ed25519.Ed25519PrivateKey.generate()
    _write_private(PRIVATE_KEY_PATH, priv.private_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PrivateFormat.Raw,
        encryption_algorithm=serialization.NoEncryption(),
    ))
    # Public key doesn't need restricting — it's served over the API too.
    PUBLIC_KEY_PATH.write_bytes(priv.public_key().public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    ))
    return priv


def _load_or_create_fernet_key() -> Fernet:
    if FERNET_KEY_PATH.exists():
        return Fernet(FERNET_KEY_PATH.read_bytes())
    key = Fernet.generate_key()
    _write_private(FERNET_KEY_PATH, key)
    return Fernet(key)


_PRIVATE_KEY = _load_or_create_signing_key()
_PUBLIC_KEY = _PRIVATE_KEY.public_key()
_FERNET = _load_or_create_fernet_key()


def public_key_hex() -> str:
    return _PUBLIC_KEY.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    ).hex()


def sign(message: bytes) -> str:
    return _PRIVATE_KEY.sign(message).hex()


def verify_signature(message: bytes, signature_hex: str) -> bool:
    try:
        _PUBLIC_KEY.verify(bytes.fromhex(signature_hex), message)
        return True
    except Exception:
        return False


# ---------------- Encryption at rest (sensitive fields) ----------------
def encrypt_text(plain: str) -> str:
    return _FERNET.encrypt(plain.encode()).decode()


def decrypt_text(token: str) -> str:
    try:
        return _FERNET.decrypt(token.encode()).decode()
    except Exception:
        # Value was stored before encryption was enabled, or isn't a
        # Fernet token — fail safe by returning it unchanged.
        return token


# ---------------- Hash-chained ledger ----------------
def _conn():
    # Same timeout/WAL posture as the main app's connections so ledger writes
    # don't collide with concurrent challenge/session writes on the same file.
    c = sqlite3.connect(DB, timeout=10)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA journal_mode=WAL")
    c.execute("PRAGMA busy_timeout=10000")
    return c


def init_chain():
    with _conn() as c:
        c.execute("""CREATE TABLE IF NOT EXISTS chain_blocks (
            idx INTEGER PRIMARY KEY,
            ts REAL NOT NULL,
            event TEXT NOT NULL,
            ref_id TEXT,
            payload TEXT NOT NULL,
            data_hash TEXT NOT NULL,
            prev_hash TEXT NOT NULL,
            hash TEXT NOT NULL,
            signature TEXT NOT NULL
        )""")
        row = c.execute("SELECT COUNT(*) n FROM chain_blocks").fetchone()
        if row["n"] == 0:
            _append(c, "genesis", None, {"note": "Samadhan Setu ledger genesis block"})


def _block_hash(idx: int, ts: float, event: str, ref_id: Optional[str], data_hash: str, prev_hash: str) -> str:
    header = f"{idx}|{ts}|{event}|{ref_id}|{data_hash}|{prev_hash}"
    return hashlib.sha256(header.encode()).hexdigest()


def _append(c, event: str, ref_id: Optional[str], payload: dict) -> dict:
    last = c.execute("SELECT * FROM chain_blocks ORDER BY idx DESC LIMIT 1").fetchone()
    idx = (last["idx"] + 1) if last else 0
    prev_hash = last["hash"] if last else "0" * 64
    ts = time.time()
    payload_json = json.dumps(payload, sort_keys=True, default=str)
    data_hash = hashlib.sha256(payload_json.encode()).hexdigest()
    h = _block_hash(idx, ts, event, ref_id, data_hash, prev_hash)
    sig = sign(h.encode())
    c.execute(
        "INSERT INTO chain_blocks (idx, ts, event, ref_id, payload, data_hash, prev_hash, hash, signature) "
        "VALUES (?,?,?,?,?,?,?,?,?)",
        (idx, ts, event, ref_id, payload_json, data_hash, prev_hash, h, sig),
    )
    return {
        "index": idx, "timestamp": ts, "event": event, "refId": ref_id, "payload": payload,
        "dataHash": data_hash, "prevHash": prev_hash, "hash": h, "signature": sig,
    }


def add_block(event: str, ref_id: Optional[str], payload: dict) -> dict:
    # Serialise read-last-index plus insert so concurrent API updates cannot
    # calculate the same ledger index.
    with _append_lock:
        with _conn() as c:
            return _append(c, event, ref_id, payload)


def get_chain() -> list[dict]:
    with _conn() as c:
        rows = c.execute("SELECT * FROM chain_blocks ORDER BY idx ASC").fetchall()
    return [{
        "index": r["idx"], "timestamp": r["ts"], "event": r["event"], "refId": r["ref_id"],
        "payload": json.loads(r["payload"]), "dataHash": r["data_hash"], "prevHash": r["prev_hash"],
        "hash": r["hash"], "signature": r["signature"],
    } for r in rows]


def verify_chain() -> dict:
    chain = get_chain()
    prev_hash = "0" * 64
    for b in chain:
        expected_data_hash = hashlib.sha256(json.dumps(b["payload"], sort_keys=True, default=str).encode()).hexdigest()
        if b["dataHash"] != expected_data_hash:
            return {"valid": False, "brokenAt": b["index"], "length": len(chain), "reason": "payload does not match its stored hash"}
        if b["prevHash"] != prev_hash:
            return {"valid": False, "brokenAt": b["index"], "length": len(chain), "reason": "chain link broken (prevHash mismatch)"}
        expected_hash = _block_hash(b["index"], b["timestamp"], b["event"], b["refId"], b["dataHash"], b["prevHash"])
        if b["hash"] != expected_hash:
            return {"valid": False, "brokenAt": b["index"], "length": len(chain), "reason": "block hash mismatch"}
        if not verify_signature(b["hash"].encode(), b["signature"]):
            return {"valid": False, "brokenAt": b["index"], "length": len(chain), "reason": "digital signature invalid"}
        prev_hash = b["hash"]
    return {"valid": True, "brokenAt": None, "length": len(chain), "reason": None}
