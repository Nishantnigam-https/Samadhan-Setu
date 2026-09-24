import os
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any, Dict, List
import math, re, base64, html
import sqlite3, json, uuid, hashlib, hmac, secrets, logging
from pathlib import Path
from datetime import datetime

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # python-dotenv is optional; the app still runs fine with default settings.
    pass

import crypto_chain as chain
import ai_engine as ai
import qrcode
from qrcode.image.svg import SvgImage

BASE = Path(__file__).resolve().parent
# On hosts with a persistent disk (e.g. Render), set DB_PATH to a path on that
# disk so registered users and submitted problems survive redeploys.
DB = Path(os.getenv("DB_PATH", str(BASE / "samadhan_setu.db")))
DB.parent.mkdir(parents=True, exist_ok=True)

# Comma-separated list of allowed frontend origins, e.g. "http://localhost:5173,http://127.0.0.1:5173"
_default_origins = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:4174,http://127.0.0.1:4174"
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",") if o.strip()]
ALLOWED_ORIGIN_REGEX = os.getenv(
    "ALLOWED_ORIGIN_REGEX",
    r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$",
)
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
ENFORCE_JHARKHAND_GPS = os.getenv("ENFORCE_JHARKHAND_GPS", "false").strip().lower() in {"1", "true", "yes", "on"}
# Local/demo recovery code. RESET_CODE is preferred; GOVT_RESET_CODE remains a
# backwards-compatible fallback for existing deployments.
RESET_CODE = os.getenv("RESET_CODE", os.getenv("GOVT_RESET_CODE", "")).strip()

app = FastAPI(title="Samadhan Setu API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "geolocation=(self), microphone=(self), camera=(self)")
    return response

# Problem domain taxonomy and keyword rules now live in ai_engine.py (shared
# by the keyword fallback engine and used to validate LLM output).

class AuthRequest(BaseModel):
    role: str
    name: str = Field(min_length=2, max_length=120)
    org: str = Field(default="", max_length=200)
    password: str = Field(min_length=8, max_length=256)
    city_desk: str = Field(default="municipal_officer", max_length=40)
    city_department: str = Field(default="other_municipal", max_length=40)

class PasswordResetRequest(BaseModel):
    role: str
    name: str = Field(min_length=2, max_length=120)
    org: str = Field(default="", max_length=200)
    reset_code: str = Field(min_length=4, max_length=128)
    new_password: str = Field(min_length=8, max_length=256)

class ProfileRequest(BaseModel):
    university_name: str = Field(default="", max_length=200)
    university_location: str = Field(default="", max_length=200)
    university_capabilities: str = Field(default="", max_length=1000)
    labs_centres: str = Field(default="", max_length=1000)
    company_name: str = Field(default="", max_length=200)
    company_location: str = Field(default="", max_length=200)
    company_capabilities: str = Field(default="", max_length=1000)
    csr_support_areas: str = Field(default="", max_length=1000)
    phone: str = Field(default="", max_length=30)
    address: str = Field(default="", max_length=300)
    district: str = Field(default="", max_length=100)
    block: str = Field(default="", max_length=100)
    designation: str = Field(default="", max_length=120)
    department: str = Field(default="", max_length=160)

class EscalationRequest(BaseModel):
    reason: str = Field(min_length=5, max_length=1000)

class ChallengeIn(BaseModel):
    data: Dict[str, Any]

class AnalyzeRequest(BaseModel):
    title: str = ""
    description: str = ""

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    lang: str = "en"
    context: Dict[str, Any] = Field(default_factory=dict)

class ConfirmationRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=120)
    user_name: str = Field(min_length=1, max_length=120)
    decision: str = Field(pattern="^(confirm|dispute)$")
    note: str = Field(default="", max_length=500)

class ReviewRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=120)
    user_name: str = Field(min_length=1, max_length=120)
    rating: int = Field(ge=1, le=5)
    text: str = Field(default="", max_length=500)

class VoiceRequest(BaseModel):
    transcript: str = Field(min_length=1, max_length=5000)
    lang: str = "en"


CITY_DESK_IDS = {"city_admin", "department_officer", "field_verification_officer", "work_monitoring_officer"}
LEGACY_CITY_DESK_IDS = {"municipal_officer", "ward_supervisor", "sanitation_officer", "water_officer", "roads_engineer", "field_team"}
LEGACY_MONITORING_DESK_ID = "work_resolution_officer"
CITY_DEPARTMENT_IDS = {"water_drainage", "roads", "electricity", "sanitation", "health", "environment", "education", "other_municipal"}
STATE_ADMIN_ROLES = {"govt", "state_admin", "state_nodal_officer", "auditor"}
CITY_ADMIN_ROLES = {"local_worker", "field_verifier", "department_head", "district_officer", "resolution_officer", "field_officer"}
SUPPORTED_ROLES = {"citizen", "university", "industry"} | STATE_ADMIN_ROLES | CITY_ADMIN_ROLES


SESSION_TTL_SECONDS = 8 * 60 * 60

def create_session(user_id: str, role: str) -> str:
    token = secrets.token_urlsafe(48)
    now = int(__import__("time").time())
    with conn() as c:
        c.execute("DELETE FROM sessions WHERE expires_at <= ?", (now,))
        # Allow concurrent government logins. Sessions remain independently
        # authenticated and can be revoked by password reset for the same account.
        c.execute("INSERT INTO sessions (token,user_id,role,expires_at) VALUES (?,?,?,?)", (token,user_id,role,now+SESSION_TTL_SECONDS))
    return token

def current_session(token: str | None, required_role: str | None = None):
    if not token:
        raise HTTPException(401, "Authentication required")
    now = int(__import__("time").time())
    with conn() as c:
        row = c.execute("SELECT * FROM sessions WHERE token=? AND expires_at>?", (token,now)).fetchone()
    if not row:
        raise HTTPException(401, "Session expired. Please sign in again.")
    if required_role and row["role"] != required_role:
        raise HTTPException(403, "This portal section is restricted to government users.")
    return row

def qr_data_url(problem_url: str) -> str:
    qr = qrcode.QRCode(version=None, box_size=6, border=2)
    qr.add_data(problem_url)
    qr.make(fit=True)
    svg = qr.make_image(image_factory=SvgImage).to_string()
    return "data:image/svg+xml;base64," + base64.b64encode(svg).decode("ascii")


def conn():
    # timeout: wait for the DB lock instead of failing immediately under
    # concurrent requests (registration/session writes + challenge reads).
    c = sqlite3.connect(DB, timeout=10)
    c.row_factory = sqlite3.Row
    # WAL lets readers and a writer work concurrently instead of blocking
    # each other on every request; NORMAL sync is the standard safe pairing.
    c.execute("PRAGMA journal_mode=WAL")
    c.execute("PRAGMA synchronous=NORMAL")
    c.execute("PRAGMA foreign_keys=ON")
    c.execute("PRAGMA busy_timeout=10000")
    return c

def hash_password(password: str, salt: str | None = None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000).hex()
    return salt, digest

def verify_password(password: str, salt: str, digest: str):
    _, check = hash_password(password, salt)
    return hmac.compare_digest(check, digest)


def _tokens(text: str) -> set[str]:
    return {x for x in re.findall(r"[a-zA-Z]{3,}", text.lower())}

def _similarity(a: str, b: str) -> float:
    aa, bb = _tokens(a), _tokens(b)
    return len(aa & bb) / max(1, len(aa | bb))

def _distance_km(lat1, lon1, lat2, lon2):
    r=6371.0
    p1,p2=math.radians(lat1),math.radians(lat2)
    dp=math.radians(lat2-lat1); dl=math.radians(lon2-lon1)
    x=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*r*math.asin(math.sqrt(x))

def verification_for(data: Dict[str, Any], exclude_id: str | None = None):
    title=str(data.get("title", "")); desc=str(data.get("desc", data.get("description", "")))
    lat=data.get("lat"); lng=data.get("lng")
    evidence=data.get("evidence") or []
    text_score=20 if len(_tokens(title+" "+desc)) >= 8 else 8
    gps_score=15 if isinstance(lat,(int,float)) and isinstance(lng,(int,float)) else 0
    evidence_score=min(20, len(evidence)*10)
    duplicates=[]
    if gps_score:
        with conn() as c:
            rows=c.execute("SELECT id,data FROM challenges").fetchall()
        for row in rows:
            if row["id"] == exclude_id: continue
            try: other=json.loads(row["data"])
            except Exception: continue
            olat,olng=other.get("lat"),other.get("lng")
            if not isinstance(olat,(int,float)) or not isinstance(olng,(int,float)): continue
            km=_distance_km(float(lat),float(lng),float(olat),float(olng))
            sim=_similarity(title+" "+desc, str(other.get("title", ""))+" "+str(other.get("desc", "")))
            if km <= 3 and sim >= .12:
                duplicates.append({"id": row["id"], "title": other.get("title"), "distance_km": round(km,2), "similarity": round(sim*100), "lat": olat, "lng": olng})
    duplicate_score=min(20, len(duplicates)*8)
    confirmations=0; disputes=0
    cid=exclude_id or data.get("id")
    if cid:
        with conn() as c:
            cr=c.execute("SELECT decision,COUNT(*) n FROM problem_confirmations WHERE challenge_id=? GROUP BY decision", (cid,)).fetchall()
        counts={r["decision"]:r["n"] for r in cr}; confirmations=counts.get("confirm",0); disputes=counts.get("dispute",0)
    community_score=min(15, confirmations*5)
    consistency_score=10 if len(title.strip())>=8 and len(desc.strip())>=30 else 3
    score=min(100, text_score+gps_score+evidence_score+duplicate_score+community_score+consistency_score-max(0,disputes-confirmations)*4)
    status="highly_credible" if score>=75 else "credible" if score>=50 else "needs_review"
    return {"score": score, "status": status, "signals": {"description":text_score,"gps":gps_score,"evidence":evidence_score,"nearby_duplicates":duplicate_score,"community":community_score,"consistency":consistency_score}, "confirmations":confirmations,"disputes":disputes,"duplicates":duplicates[:10]}

def init_db():
    with conn() as c:
        c.execute("""CREATE TABLE IF NOT EXISTS challenges (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS problem_confirmations (
            id TEXT PRIMARY KEY,
            challenge_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            user_name TEXT NOT NULL,
            decision TEXT NOT NULL,
            note TEXT DEFAULT '',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(challenge_id, user_id)
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            role TEXT NOT NULL,
            name TEXT NOT NULL,
            org TEXT NOT NULL,
            password_salt TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(role, name)
        )""")
        for column in ("phone", "address", "district", "block", "designation", "department", "university_location", "university_capabilities", "labs_centres", "company_location", "company_capabilities", "csr_support_areas"):
            try:
                c.execute(f"ALTER TABLE users ADD COLUMN {column} TEXT NOT NULL DEFAULT ''")
            except sqlite3.OperationalError:
                pass
        try:
            c.execute("ALTER TABLE users ADD COLUMN city_desk TEXT NOT NULL DEFAULT 'municipal_officer'")
        except sqlite3.OperationalError:
            pass
        try:
            c.execute("ALTER TABLE users ADD COLUMN city_department TEXT NOT NULL DEFAULT 'other_municipal'")
        except sqlite3.OperationalError:
            pass
        c.execute(
            "UPDATE users SET city_desk=? WHERE city_desk=?",
            ("work_monitoring_officer", LEGACY_MONITORING_DESK_ID),
        )
        c.execute("UPDATE users SET city_desk='city_admin' WHERE city_desk IN ({})".format(",".join("?" for _ in LEGACY_CITY_DESK_IDS)), tuple(LEGACY_CITY_DESK_IDS))
        c.execute("""CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )""")
        c.execute("CREATE INDEX IF NOT EXISTS idx_sessions_role ON sessions(role)")
        c.execute("""CREATE TABLE IF NOT EXISTS problem_reviews (
            id TEXT PRIMARY KEY,
            challenge_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            user_name TEXT NOT NULL,
            rating INTEGER NOT NULL,
            text TEXT DEFAULT '',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(challenge_id, user_id)
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS problem_escalations (
            id TEXT PRIMARY KEY,
            challenge_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            reason TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'submitted',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(challenge_id, user_id)
        )""")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("samadhan_setu")

@app.on_event("startup")
def startup():
    init_db()
    chain.init_chain()
    if not RESET_CODE:
        logger.warning("RESET_CODE is not configured; password recovery is disabled.")
    if PUBLIC_BASE_URL.startswith("http://127.0.0.1") or PUBLIC_BASE_URL.startswith("http://localhost"):
        logger.info(
            "PUBLIC_BASE_URL is set to a loopback address, so problem QR codes "
            "will only resolve on this machine. Set it to your LAN IP or a "
            "public HTTPS URL for real-world QR scanning."
        )
    chain_status = chain.verify_chain()
    if not chain_status.get("valid"):
        logger.error("Ledger integrity check FAILED at startup: %s", chain_status)
    else:
        logger.info("Ledger verified OK — %d blocks.", chain_status.get("length", 0))

@app.get("/")
def root():
    return {"message": "Samadhan Setu Python Backend is running", "docs": "/docs"}

@app.get("/api/health")
def health():
    try:
        chain_status = chain.verify_chain()
    except Exception as exc:
        chain_status = {"valid": False, "length": 0, "reason": str(exc)}
    return {
        "status": "ok",
        "service": "samadhan-setu-backend",
        "voice_assistant": "enabled",
        "ai": ai.status(),
        "blockchain": {
            "present": True,
            "type": "single-node hash-chained ledger",
            "algorithm": "Ed25519 + SHA-256",
            "verified": bool(chain_status.get("valid")),
            "length": chain_status.get("length", 0),
        },
    }

@app.post("/api/auth/register")
def register(body: AuthRequest):
    if body.role not in SUPPORTED_ROLES:
        raise HTTPException(400, "Invalid role")
    if body.role in CITY_ADMIN_ROLES and body.city_desk not in CITY_DESK_IDS:
        raise HTTPException(400, "Invalid City Government desk")
    if body.role in CITY_ADMIN_ROLES and body.city_desk == "department_officer" and body.city_department not in CITY_DEPARTMENT_IDS:
        raise HTTPException(400, "Invalid department")
    name = body.name.strip()
    org = body.org.strip()
    if body.role != "citizen" and len(org) < 2:
        raise HTTPException(400, "Organisation is required for this role")
    with conn() as c:
        exists = c.execute("SELECT 1 FROM users WHERE role=? AND name=?", (body.role, name)).fetchone()
        if exists:
            raise HTTPException(409, "Account already exists. Please log in instead.")
        # Multiple government officers/departments are supported. Each account is
        # independently identified by the existing UNIQUE(role, name) constraint.
        uid = uuid.uuid4().hex
        salt, digest = hash_password(body.password)
        city_desk = body.city_desk if body.role in CITY_ADMIN_ROLES else ""
        city_department = body.city_department if body.role in CITY_ADMIN_ROLES and body.city_desk == "department_officer" else "other_municipal"
        c.execute("INSERT INTO users (id, role, name, org, password_salt, password_hash, city_desk, city_department) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              (uid, body.role, name, chain.encrypt_text(org) if org else "", salt, digest, city_desk, city_department))
    token = create_session(uid, body.role)
    return {"token": token, "user": {"id": uid, "role": body.role, "name": name, "org": org, "university_location": "", "university_capabilities": "", "labs_centres": "", "company_location": "", "company_capabilities": "", "csr_support_areas": "", "city_desk": city_desk, "city_department": city_department}}

@app.post("/api/auth/login")
def login(body: AuthRequest):
    if body.role not in SUPPORTED_ROLES:
        raise HTTPException(400, "Invalid role")
    name = body.name.strip()
    with conn() as c:
        row = c.execute("SELECT * FROM users WHERE role=? AND name=?", (body.role, name)).fetchone()
    if not row or not verify_password(body.password, row["password_salt"], row["password_hash"]):
        raise HTTPException(401, "Invalid name, role or password")
    token = create_session(row["id"], row["role"])
    return {"token": token, "user": {"id": row["id"], "role": row["role"], "name": row["name"], "org": chain.decrypt_text(row["org"]) if row["org"] else "", "university_location": row["university_location"] or "", "university_capabilities": row["university_capabilities"] or "", "labs_centres": row["labs_centres"] or "", "company_location": row["company_location"] or "", "company_capabilities": row["company_capabilities"] or "", "csr_support_areas": row["csr_support_areas"] or "", "designation": row["designation"] or "", "department": row["department"] or "", "city_desk": row["city_desk"] or "municipal_officer", "city_department": row["city_department"] or "other_municipal"}}

@app.get("/api/auth/me")
def get_profile(authorization: str = Header(default="")):
    session = current_session(authorization.removeprefix("Bearer ").strip())
    with conn() as c:
        row = c.execute("SELECT * FROM users WHERE id=?", (session["user_id"],)).fetchone()
    if not row:
        raise HTTPException(404, "Profile not found")
    return {"id": row["id"], "role": row["role"], "name": row["name"], "org": chain.decrypt_text(row["org"]) if row["org"] else "", "university_name": chain.decrypt_text(row["org"]) if row["org"] else "", "university_location": row["university_location"] or "", "university_capabilities": row["university_capabilities"] or "", "labs_centres": row["labs_centres"] or "", "company_name": chain.decrypt_text(row["org"]) if row["org"] else "", "company_location": row["company_location"] or "", "company_capabilities": row["company_capabilities"] or "", "csr_support_areas": row["csr_support_areas"] or "", "designation": row["designation"] or "", "department": row["department"] or "", "city_desk": row["city_desk"] or "municipal_officer", "city_department": row["city_department"] or "other_municipal", "phone": row["phone"] or "", "address": row["address"] or "", "district": row["district"] or "", "block": row["block"] or "", "verified": bool(row["phone"] and row["address"] and row["district"])}

@app.put("/api/auth/me")
def update_profile(body: ProfileRequest, authorization: str = Header(default="")):
    session = current_session(authorization.removeprefix("Bearer ").strip())
    with conn() as c:
        encrypted_org = chain.encrypt_text(body.university_name.strip()) if body.university_name.strip() else None
        if encrypted_org:
            c.execute("UPDATE users SET org=?, university_location=?, university_capabilities=?, labs_centres=?, company_location=?, company_capabilities=?, csr_support_areas=?, phone=?, address=?, district=?, block=?, designation=?, department=? WHERE id=?", (encrypted_org, body.university_location.strip(), body.university_capabilities.strip(), body.labs_centres.strip(), body.company_location.strip(), body.company_capabilities.strip(), body.csr_support_areas.strip(), body.phone.strip(), body.address.strip(), body.district.strip(), body.block.strip(), body.designation.strip(), body.department.strip(), session["user_id"]))
        else:
            c.execute("UPDATE users SET university_location=?, university_capabilities=?, labs_centres=?, company_location=?, company_capabilities=?, csr_support_areas=?, phone=?, address=?, district=?, block=?, designation=?, department=? WHERE id=?", (body.university_location.strip(), body.university_capabilities.strip(), body.labs_centres.strip(), body.company_location.strip(), body.company_capabilities.strip(), body.csr_support_areas.strip(), body.phone.strip(), body.address.strip(), body.district.strip(), body.block.strip(), body.designation.strip(), body.department.strip(), session["user_id"]))
    return get_profile(authorization)

@app.get("/api/users/city-workers")
def list_city_workers(authorization: str = Header(default="")):
    session = current_session(authorization.removeprefix("Bearer ").strip())
    if session["role"] in CITY_ADMIN_ROLES:
        with conn() as c:
            account = c.execute("SELECT city_desk FROM users WHERE id=?", (session["user_id"],)).fetchone()
        if not account or account["city_desk"] not in {"city_admin", "department_officer"}:
            raise HTTPException(403, "Only City Admin or Department Officer can manage city officers.")
    elif session["role"] not in STATE_ADMIN_ROLES:
        raise HTTPException(403, "Only government or City Admin users can manage city officers.")
    with conn() as c:
        rows = c.execute("SELECT id,name,org,city_desk,city_department FROM users WHERE role='local_worker' ORDER BY name").fetchall()
    return {"items": [{"id": row["id"], "name": row["name"], "org": chain.decrypt_text(row["org"]) if row["org"] else "", "city_desk": row["city_desk"] or "municipal_officer", "city_department": row["city_department"] or "other_municipal"} for row in rows]}

@app.get("/api/users/active-universities")
def list_active_universities(authorization: str = Header(default="")):
    current_session(authorization.removeprefix("Bearer ").strip())
    with conn() as c:
        rows = c.execute(
            """
            SELECT u.id, u.name, u.org
            FROM users u
            WHERE u.role='university'
            ORDER BY u.name
            """
        ).fetchall()
    return {
        "items": [
            {
                "id": row["id"],
                "name": chain.decrypt_text(row["org"]) if row["org"] else row["name"],
                "org": chain.decrypt_text(row["org"]) if row["org"] else "",
            }
            for row in rows
        ]
    }

@app.get("/api/users/active-industries")
def list_active_industries(authorization: str = Header(default="")):
    current_session(authorization.removeprefix("Bearer ").strip())
    with conn() as c:
        rows = c.execute(
            """
            SELECT u.id, u.name, u.org
            FROM users u
            WHERE u.role='industry'
            ORDER BY u.name
            """
        ).fetchall()
    return {
        "items": [
            {
                "id": row["id"],
                "name": chain.decrypt_text(row["org"]) if row["org"] else row["name"],
                "org": chain.decrypt_text(row["org"]) if row["org"] else "",
            }
            for row in rows
        ]
    }

@app.post("/api/auth/reset-password")
@app.post("/api/auth/reset_password")
def reset_password(body: PasswordResetRequest):
    """Reset a supported portal account using the configured recovery code.

    This local/demo build uses a recovery code because no email/SMS provider is
    configured. In production, replace this with an account-specific verified
    recovery flow and keep RESET_CODE secret.
    """
    allowed_roles = SUPPORTED_ROLES
    if body.role not in allowed_roles:
        raise HTTPException(400, "Invalid role")
    if not RESET_CODE:
        raise HTTPException(503, "Password recovery is disabled. Configure RESET_CODE on the server.")
    if not hmac.compare_digest(body.reset_code.strip(), RESET_CODE):
        raise HTTPException(401, "Invalid recovery code.")
    name = body.name.strip()
    org = body.org.strip()
    with conn() as c:
        # SQLite's default text comparison can be case-sensitive depending on the
        # database/collation. Government users commonly type their name/org with
        # different capitalization, so normalize both sides for recovery.
        row = c.execute(
            "SELECT * FROM users WHERE role=? AND lower(trim(name))=lower(trim(?)) LIMIT 1",
            (body.role, name),
        ).fetchone()
        if not row:
            raise HTTPException(404, "Account not found. Enter the same name used during registration.")
        stored_org = chain.decrypt_text(row["org"]) if row["org"] else ""
        if org and stored_org.strip().lower() != org.lower():
            raise HTTPException(401, "Organisation does not match the registered account.")
        salt, digest = hash_password(body.new_password)
        c.execute(
            "UPDATE users SET password_salt=?, password_hash=? WHERE id=?",
            (salt, digest, row["id"]),
        )
        # Invalidate only this account's existing sessions after a password reset.
        # Other government officers remain signed in.
        c.execute("DELETE FROM sessions WHERE user_id=?", (row["id"],))
    return {"ok": True, "message": "Password reset successfully. Please sign in with the new password."}

@app.post("/api/auth/logout")
def logout(authorization: str = Header(default="")):
    token = authorization.removeprefix("Bearer ").strip()
    if token:
        with conn() as c: c.execute("DELETE FROM sessions WHERE token=?", (token,))
    return {"ok": True}

@app.get("/api/challenges")
def get_challenges(authorization: str = Header(default="")):
    token = authorization.removeprefix("Bearer ").strip()
    # Public dashboard/landing page can read public problem summaries without login.
    # When a valid session exists, ownership is calculated server-side.
    s = None
    if token:
        s = current_session(token)
    city_desk = "municipal_officer"
    if s and s["role"] in CITY_ADMIN_ROLES:
        with conn() as c:
            user = c.execute("SELECT city_desk,city_department FROM users WHERE id=?", (s["user_id"],)).fetchone()
        city_desk = (user["city_desk"] if user and user["city_desk"] else "municipal_officer")
        city_department = user["city_department"] if user else "other_municipal"
    city_categories = {
        "sanitation_officer": {"waste_management"},
        "water_officer": {"water_drainage"},
        "roads_engineer": {"road_transport", "street_lighting", "public_utilities", "public_safety"},
    }
    city_department_categories = {
        "water_drainage": {"water_drainage"},
        "roads": {"road_transport", "street_lighting"},
        "electricity": {"public_utilities", "street_lighting"},
        "sanitation": {"waste_management"},
        "health": {"public_safety", "other_municipal"},
        "environment": {"public_safety", "other_municipal"},
        "education": {"other_municipal"},
        "other_municipal": {"other_municipal"},
    }
    city_department_terms = {
        "water_drainage": {"water", "drain", "sewage", "pipeline"}, "roads": {"road", "pothole", "footpath", "bridge"},
        "electricity": {"electricity", "power", "transformer", "voltage"}, "sanitation": {"garbage", "waste", "sanitation", "toilet"},
        "health": {"health", "hospital", "doctor", "clinic"}, "environment": {"environment", "pollution", "forest", "tree"},
        "education": {"education", "school", "teacher", "student"}, "other_municipal": set(),
    }
    with conn() as c:
        rows = c.execute("SELECT id,data FROM challenges ORDER BY created_at DESC").fetchall()
    items=[]
    for r in rows:
        data=json.loads(r["data"])
        data["verification"] = verification_for(data, exclude_id=r["id"])
        # Always calculate ownership on the server. The old frontend relied on
        # a static `mine: true` flag, which disappears/was incorrect after the
        # list was reloaded from the backend. A citizen should only see their
        # own submissions in "Track My Problems".
        reporter = data.get("reporter") or {}
        owner_id = str(data.get("owner_user_id") or reporter.get("user_id") or "")
        data["mine"] = bool(s and s["role"] == "citizen" and owner_id and owner_id == s["user_id"])
        # Only the owner and workflow officials (government, city worker, field
        # verifier) receive private fields — they need coordinates, and their
        # own proof/verification data, to actually do their jobs. Every other
        # dashboard receives the same public-safe projection used by QR pages.
        if s and s["role"] in CITY_ADMIN_ROLES:
            assigned = str((data.get("assigned_to") or {}).get("user_id") or "") == str(s["user_id"])
            category = str(data.get("city_category") or "other_municipal")
            problem_text = " ".join(str(data.get(key) or "") for key in ("title", "desc", "department", "domain")).lower()
            if city_desk in {"ward_supervisor", "field_team", "work_monitoring_officer"} and not assigned:
                continue
            if city_desk == "field_verification_officer" and data.get("stage") not in {"field_verification", "re_verification"}:
                continue
            if city_desk == "department_officer" and not assigned and category not in city_department_categories.get(city_department, set()) and not any(term in problem_text for term in city_department_terms.get(city_department, set())):
                continue
            if city_desk not in {"city_admin", "municipal_officer", "ward_supervisor", "department_officer", "field_team"} and not assigned and category not in city_categories.get(city_desk, set()):
                continue
        # City-service problems belong to the City Government portal first.
        # A state officer may see one only after the city explicitly hands it
        # over through the escalation action (government_review + flag).
        if s and s["role"] in STATE_ADMIN_ROLES and data.get("routing_decision") == "city_government":
            city_handoff = data.get("stage") == "government_review" and bool(data.get("requires_government"))
            if not city_handoff:
                continue
        if s and s["role"] in {"university", "industry"}:
            data = collaborator_problem_data(data)
            data["mine"] = False
        elif not (s and (s["role"] in (STATE_ADMIN_ROLES | CITY_ADMIN_ROLES) or data["mine"])):
            data = public_problem_data(data)
            data["mine"] = False
        items.append(data)
    return {"items": items}

def public_problem_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Return only fields safe for unauthenticated/public problem views."""
    allowed = {
        "id", "title", "desc", "description", "stage", "domain", "department",
        "specific_department", "priority", "date", "district", "block",
        "problem_location", "location_source", "location_precision", "gps_scope",
        "city_category", "city_category_label", "verification", "qr_url",
        "updates", "milestones", "requires_government", "requires_university",
        "requires_investment", "routing_decision", "routing_reason",
        "work_order", "sla", "citizen_updates", "resolution_proof",
        "department_resolution", "supervisor_approval",
    }
    out = {k: data[k] for k in allowed if k in data}
    if isinstance(out.get("updates"), list):
        # Updates are public, but strip accidental private fields.
        safe_updates = []
        for item in out["updates"]:
            if isinstance(item, dict):
                safe_updates.append({k: item[k] for k in ("stage", "time", "note") if k in item})
        out["updates"] = safe_updates
    if isinstance(out.get("milestones"), list):
        out["milestones"] = [
            {k: m[k] for k in ("id", "title", "done", "date") if k in m}
            for m in out["milestones"] if isinstance(m, dict)
        ]
    return out


def collaborator_problem_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Expose workflow fields needed by university and industry desks.

    Collaborators need routing, assignment, proposal and milestone data, but
    they must not receive citizen contact details or ownership internals.
    """
    out = public_problem_data(data)
    allowed = {
        "uni", "universities", "partner", "fund", "funding_note", "budget", "team", "team_name", "mentor", "impact",
        "solution", "technical_plan", "technical_team", "funding", "pilot",
        "deployment", "ip", "votes", "reports", "comments", "evidence",
        "requires_government", "requires_university", "requires_investment",
        "routing_scope", "routing_decision", "routing_reason",
    }
    out.update({key: data[key] for key in allowed if key in data})
    out.pop("reporter", None)
    out.pop("owner_user_id", None)
    out.pop("phone", None)
    out.pop("org", None)
    out.pop("by", None)
    out.pop("byType", None)
    return out


ROLE_UPDATE_FIELDS = {
    "govt": {"stage", "priority", "department", "specific_department", "domain", "city_category", "city_category_label", "assigned_to", "updates", "milestones", "requires_government", "requires_university", "requires_investment", "routing_decision", "routing_reason", "routing_scope", "returned_from", "verification", "uni", "universities", "notes", "work_order", "sla", "supervisor_approval", "citizen_updates"},
    "local_worker": {"stage", "assigned_to", "updates", "verification", "notes", "field_status", "field_report", "field_verification", "evidence", "milestones", "resolution_proof", "work_order", "sla", "supervisor_approval", "citizen_updates", "requires_government", "requires_university", "routing_decision", "routing_scope", "returned_from", "uni"},
    "field_verifier": {"stage", "updates", "verification", "notes", "field_status", "field_report", "evidence", "milestones", "field_verification"},
    "university": {"stage", "updates", "milestones", "team", "team_name", "mentor", "technical_team", "technical_plan", "solution", "solution_submissions", "solution_pdf", "app_link", "solution_video", "requires_government", "requires_investment", "routing_decision", "routing_scope", "notes", "evidence"},
    "industry": {"stage", "updates", "milestones", "funding", "funding_note", "requires_government", "requires_investment", "routing_decision", "routing_scope", "pilot", "deployment", "partner", "fund", "notes", "evidence"},
}
for role in STATE_ADMIN_ROLES - {"govt"}:
    ROLE_UPDATE_FIELDS[role] = ROLE_UPDATE_FIELDS["govt"]
for role in CITY_ADMIN_ROLES - {"local_worker"}:
    ROLE_UPDATE_FIELDS[role] = ROLE_UPDATE_FIELDS["local_worker"]

def merge_workflow_update(existing: Dict[str, Any], incoming: Dict[str, Any], role: str, user_id: str, allowed_fields: set[str] | None = None) -> Dict[str, Any]:
    allowed = allowed_fields or ROLE_UPDATE_FIELDS[role]
    unknown = set(incoming) - (allowed | {"id"})
    # Unknown fields are ignored rather than trusted. Critical identity/location
    # fields are always preserved from the server copy.
    merged = dict(existing)
    for key in allowed:
        if key in incoming:
            merged[key] = incoming[key]
    merged["id"] = existing.get("id")
    merged["updated_by"] = {"user_id": user_id, "role": role, "at": datetime.utcnow().isoformat(timespec="seconds") + "Z"}
    if "updates" in allowed and "updates" in incoming:
        updates = incoming.get("updates")
        merged["updates"] = updates if isinstance(updates, list) else existing.get("updates", [])
    return merged


@app.get("/api/challenges/{challenge_id}")
def get_challenge(challenge_id: str, authorization: str = Header(default="")):

    with conn() as c:
        row = c.execute("SELECT data FROM challenges WHERE id=?", (challenge_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Challenge not found")
    data = json.loads(row["data"])
    token = authorization.removeprefix("Bearer ").strip()
    if token:
        s = current_session(token)
        if s["role"] in STATE_ADMIN_ROLES and data.get("routing_decision") == "city_government" and not (data.get("stage") == "government_review" and data.get("requires_government")):
            raise HTTPException(403, "City Government must assign this problem to State Government first.")
        if s["role"] in STATE_ADMIN_ROLES or s["role"] in {"university", "industry"} or (s["role"] in CITY_ADMIN_ROLES and str((data.get("assigned_to") or {}).get("user_id") or "") == str(s["user_id"])) or s["user_id"] == str(data.get("owner_user_id")):
            if s["role"] in {"university", "industry"}:
                return {"item": collaborator_problem_data(data)}
            return {"item": data}
    return {"item": public_problem_data(data)}

def normalize_problem_location(data: Dict[str, Any]) -> Dict[str, Any]:
    """Build one canonical problem-location object without conflating reporter GPS."""
    raw = data.get("problem_location") if isinstance(data.get("problem_location"), dict) else {}
    lat = raw.get("lat", data.get("lat"))
    lng = raw.get("lng", data.get("lng"))
    source = raw.get("source") or data.get("location_source") or "district_block_fallback"
    if source not in {"browser_gps", "address_geocode", "district_block_fallback"}:
        source = "district_block_fallback"
    try:
        lat = float(lat) if lat is not None else None
        lng = float(lng) if lng is not None else None
    except (TypeError, ValueError):
        lat, lng = None, None
    accuracy = raw.get("accuracy_meters", data.get("accuracy")) if source == "browser_gps" else None
    try:
        accuracy = max(1.0, float(accuracy)) if accuracy is not None else None
    except (TypeError, ValueError):
        accuracy = None
    if source == "browser_gps":
        label = f"Exact GPS · ±{round(accuracy)} m" if accuracy is not None else "Exact GPS"
    elif source == "address_geocode":
        label = "Address-based · Approximate"
    else:
        label = "District/Ward fallback · Approximate"
    location = {
        "lat": lat, "lng": lng, "source": source, "accuracy_meters": round(accuracy) if accuracy is not None else None,
        "accuracy_label": label, "address": str(raw.get("address") or data.get("location_address") or ""),
        "district": str(raw.get("district") or data.get("district") or ""),
        "block": str(raw.get("block") or data.get("block") or ""),
    }
    data["problem_location"] = location
    # Keep legacy fields for existing dashboards/backward compatibility.
    if lat is not None and lng is not None:
        data["lat"], data["lng"] = lat, lng
    data["location_source"] = source
    data["location_precision"] = "exact_gps" if source == "browser_gps" else "address_geocode" if source == "address_geocode" else "approximate_district_center"
    if accuracy is not None: data["accuracy"] = round(accuracy)
    return location

@app.post("/api/challenges")
def create_challenge(body: ChallengeIn, authorization: str = Header(default="")):
    s = current_session(authorization.removeprefix("Bearer ").strip())
    data = body.data.copy()
    problem_location = normalize_problem_location(data)
    # Citizen-submitted problems must carry a usable problem location. The
    # location can be exact GPS, address-derived, or district/ward fallback.
    # The reporter's current GPS is never used implicitly as the problem location.
    if s["role"] == "citizen":
        plat, plng = problem_location.get("lat"), problem_location.get("lng")
        if not isinstance(plat, (int, float)) or not isinstance(plng, (int, float)):
            raise HTTPException(400, "Problem location is required. Use GPS, a problem address, or select district and ward/block.")
    # Citizen submissions require a real problem location; it may come from
    # browser GPS, address geocoding, or district/block fallback.
    if s["role"] == "citizen":
        lat, lng = problem_location.get("lat"), problem_location.get("lng")
        if not isinstance(lat, (int, float)) or not isinstance(lng, (int, float)):
            raise HTTPException(400, "Problem location is required before submitting a citizen problem.")
        # The app can be demonstrated from outside Jharkhand (for example,
        # when the developer is testing from another city). Production can
        # enforce the state boundary with ENFORCE_JHARKHAND_GPS=true.
        in_jharkhand = 21.8 <= float(lat) <= 25.6 and 83.0 <= float(lng) <= 88.2
        data["gps_scope"] = "jharkhand" if in_jharkhand else "outside_jharkhand_demo"
        # Outside Jharkhand is allowed when the citizen has supplied a problem
        # address/district/block; the frontend geocodes that problem location.
        if ENFORCE_JHARKHAND_GPS and not in_jharkhand and data.get("location_source") == "browser_gps":
            raise HTTPException(400, "The captured GPS location appears to be outside Jharkhand. Use the problem address/district to map the reported location.")
        if data.get("accuracy") is not None:
            try:
                data["accuracy"] = max(1, round(float(data["accuracy"])))
            except (TypeError, ValueError):
                data.pop("accuracy", None)
    # Server-side AI routing is authoritative for citizen submissions. The browser
    # may preview a route, but the backend re-analyzes the submitted text so a
    # normal city issue goes to City Government, while a complex issue first
    # enters Government Review.
    if s["role"] == "citizen":
        try:
            ai = classify_problem(str(data.get("title") or ""), str(data.get("desc") or ""))
            for key in ("domain", "specific_department", "priority", "requires_government", "requires_university", "requires_investment", "routing_decision", "routing_reason", "city_category", "city_category_label"):
                if key in ai:
                    data[key if key != "specific_department" else "department"] = ai[key]
            # Every citizen problem starts with City Admin. City Admin owns
            # field verification and department assignment; escalation to
            # State Government is an explicit later action.
            data["stage"] = "city_admin_review"
            data["routing_decision"] = "city_government"
            data["updates"] = list(data.get("updates") or []) + [{
                "stage": "ai_review", "time": datetime.now().strftime("%d %b %Y, %H:%M"),
                "note": f"Server AI classified and routed this problem: {ai.get('routing_decision', 'government_review')}."
            }, {
                "stage": data["stage"], "time": datetime.now().strftime("%d %b %Y, %H:%M"),
                "note": "Sent to City Admin for initial review and field verification."
            }]
        except Exception:
            data["stage"] = "city_admin_review"
            data["routing_decision"] = "city_government"
    cid = data.get("id") or f"SS-JH-{uuid.uuid4().hex[:8].upper()}"
    data["id"] = cid
    if s["role"] == "citizen":
        # Persist the authenticated owner separately from display data so the
        # citizen's tracking list can be rebuilt correctly after a page reload.
        data["owner_user_id"] = s["user_id"]
        data["reporter"] = {
            "user_id": s["user_id"],
            "name": str(data.get("by") or "Citizen"),
            "phone": str(data.get("phone") or ""),
            "type": str(data.get("byType") or "Citizen"),
            "organisation": str(data.get("org") or ""),
        }
    data["qr_url"] = f"{PUBLIC_BASE_URL}/problem/{cid}"
    verification = verification_for(data, exclude_id=cid)
    data["verification"] = verification
    data["qr_image"] = qr_data_url(data["qr_url"])
    with conn() as c:
        c.execute("INSERT OR REPLACE INTO challenges (id, data) VALUES (?, ?)", (cid, json.dumps(data)))
    chain.add_block("challenge_created", cid, {
        "id": cid, "title": data.get("title"), "domain": data.get("domain"),
        "district": data.get("district"), "stage": data.get("stage"), "by": data.get("by"),
        "date": data.get("date"), "problem_location": {
            "lat": problem_location.get("lat"), "lng": problem_location.get("lng"),
            "source": problem_location.get("source"), "accuracy_label": problem_location.get("accuracy_label"),
            "district": problem_location.get("district"), "block": problem_location.get("block"),
        },
    })
    return {"item": data, "verification": verification}

@app.get("/problem/{challenge_id}")
def public_problem(challenge_id: str):
    with conn() as c:
        row = c.execute("SELECT data FROM challenges WHERE id=?", (challenge_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Problem not found")
    data=json.loads(row["data"])
    # Public QR page intentionally hides private reporter/contact details.
    title = str(data.get("title", "Samadhan Setu Problem"))
    desc = str(data.get("desc", ""))
    status = str(data.get("stage", "submitted")).replace("_", " ").title()
    safe_title, safe_desc, safe_status = html.escape(title), html.escape(desc), html.escape(status)
    safe_id = html.escape(str(data.get("id", "")))
    safe_district = html.escape(str(data.get("district", "")))
    safe_block = html.escape(str(data.get("block", "")))
    safe_domain = html.escape(str(data.get("domain", "")).replace("_", " ").title())
    # "department" is the specific authority (e.g. "Municipal Corporation")
    # picked by the two-step classifier; older records may only have the
    # broad domain, so fall back to that.
    safe_department = html.escape(str(data.get("department") or data.get("domain", "")).replace("_", " ").title())
    return f"""<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>{title} · Samadhan Setu</title><style>body{{font-family:Arial,sans-serif;background:#f4f0e5;margin:0;padding:24px;color:#173b2d}}.card{{max-width:760px;margin:auto;background:white;border:1px solid #ddd;padding:28px;border-radius:12px;box-shadow:0 8px 30px #0001}}.id{{font-family:monospace;color:#9b6410}}h1{{font-size:28px}}.tag{{display:inline-block;background:#eaf3ed;padding:7px 10px;border-radius:6px;font-weight:bold}}p{{line-height:1.6}}</style></head><body><div class='card'><div class='id'>{safe_id}</div><h1>{safe_title}</h1><span class='tag'>{safe_status}</span><p>{safe_desc}</p><p><b>Location:</b> {safe_district} · {safe_block}</p><p><b>Category:</b> {safe_domain}</p><p><b>Department:</b> {safe_department}</p><p style='margin-top:24px;color:#666'>Scanned from the official Samadhan Setu problem QR code.</p></div></body></html>"""


@app.get("/api/challenges/{challenge_id}/reviews")
def get_problem_reviews(challenge_id: str):
    with conn() as c:
        rows=c.execute("SELECT id,user_name,rating,text,created_at FROM problem_reviews WHERE challenge_id=? ORDER BY created_at DESC", (challenge_id,)).fetchall()
    items=[dict(r) for r in rows]
    for x in items:
        x["user_name"] = "Verified citizen"
    average=round(sum(int(x["rating"]) for x in items)/len(items),2) if items else 0.0
    return {"average":average,"count":len(items),"items":items}

@app.post("/api/challenges/{challenge_id}/reviews")
def add_problem_review(challenge_id: str, body: ReviewRequest, authorization: str = Header(default="")):
    s=current_session(authorization.removeprefix("Bearer ").strip())
    if s["role"] != "citizen":
        raise HTTPException(403, "Only citizen accounts can rate community problem reports.")
    with conn() as c:
        exists=c.execute("SELECT 1 FROM challenges WHERE id=?", (challenge_id,)).fetchone()
        if not exists: raise HTTPException(404,"Challenge not found")
        reviewer_name = f"Citizen {str(s['user_id'])[:6]}"
        c.execute("INSERT INTO problem_reviews (id,challenge_id,user_id,user_name,rating,text) VALUES (?,?,?,?,?,?) ON CONFLICT(challenge_id,user_id) DO UPDATE SET rating=excluded.rating,text=excluded.text,created_at=CURRENT_TIMESTAMP",
                  (uuid.uuid4().hex,challenge_id,s["user_id"],reviewer_name,body.rating,body.text.strip()))
    chain.add_block("community_review",challenge_id,{"rating":body.rating,"reviewer":str(s["user_id"])})
    return get_problem_reviews(challenge_id)

@app.post("/api/challenges/{challenge_id}/escalate")
def escalate_problem(challenge_id: str, body: EscalationRequest, authorization: str = Header(default="")):
    s = current_session(authorization.removeprefix("Bearer ").strip(), required_role="citizen")
    with conn() as c:
        row = c.execute("SELECT data FROM challenges WHERE id=?", (challenge_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Problem not found")
        data = json.loads(row["data"])
        owner_id = str(data.get("owner_user_id") or (data.get("reporter") or {}).get("user_id") or "")
        if owner_id != str(s["user_id"]):
            raise HTTPException(403, "Only the submitting citizen can escalate this problem")
        c.execute("INSERT INTO problem_escalations (id,challenge_id,user_id,reason) VALUES (?,?,?,?) ON CONFLICT(challenge_id,user_id) DO UPDATE SET reason=excluded.reason,status='submitted',created_at=CURRENT_TIMESTAMP", (uuid.uuid4().hex, challenge_id, s["user_id"], body.reason.strip()))
    chain.add_block("challenge_escalated", challenge_id, {"user_id": str(s["user_id"]), "reason": body.reason.strip()})
    return {"ok": True, "status": "submitted", "message": "Your follow-up complaint was submitted for review."}

@app.get("/api/challenges/{challenge_id}/verification")
def challenge_verification(challenge_id: str):
    with conn() as c:
        row=c.execute("SELECT data FROM challenges WHERE id=?", (challenge_id,)).fetchone()
    if not row: raise HTTPException(404, "Challenge not found")
    data=json.loads(row["data"]); v=verification_for(data, exclude_id=challenge_id)
    data["verification"]=v
    with conn() as c: c.execute("UPDATE challenges SET data=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", (json.dumps(data),challenge_id))
    return v

@app.post("/api/challenges/{challenge_id}/confirm")
def confirm_challenge(challenge_id: str, body: ConfirmationRequest, authorization: str = Header(default="")):
    s = current_session(authorization.removeprefix("Bearer ").strip())
    if s["role"] != "citizen":
        raise HTTPException(403, "Only citizen accounts can submit community confirmations.")
    with conn() as c:
        exists=c.execute("SELECT 1 FROM challenges WHERE id=?", (challenge_id,)).fetchone()
        if not exists: raise HTTPException(404, "Challenge not found")
        c.execute("INSERT INTO problem_confirmations (id,challenge_id,user_id,user_name,decision,note) VALUES (?,?,?,?,?,?) ON CONFLICT(challenge_id,user_id) DO UPDATE SET decision=excluded.decision,note=excluded.note,created_at=CURRENT_TIMESTAMP", (uuid.uuid4().hex,challenge_id,s["user_id"],f"Citizen {str(s['user_id'])[:6]}",body.decision,body.note.strip()))
        row=c.execute("SELECT data FROM challenges WHERE id=?", (challenge_id,)).fetchone()
    data=json.loads(row["data"]); v=verification_for(data, exclude_id=challenge_id); data["verification"]=v
    with conn() as c: c.execute("UPDATE challenges SET data=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", (json.dumps(data),challenge_id))
    chain.add_block("community_verification", challenge_id, {"challenge_id":challenge_id,"decision":body.decision,"score":v["score"],"confirmations":v["confirmations"],"disputes":v["disputes"]})
    return {"verification":v}

@app.put("/api/challenges/{challenge_id}")
def update_challenge(challenge_id: str, body: ChallengeIn, authorization: str = Header(default="")):
    s = current_session(authorization.removeprefix("Bearer ").strip())
    role = s["role"]
    if role not in ROLE_UPDATE_FIELDS:
        raise HTTPException(403, "This role cannot update a problem workflow.")
    with conn() as c:
        row = c.execute("SELECT data FROM challenges WHERE id=?", (challenge_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Challenge not found in backend database")
    existing = json.loads(row["data"])
    if role == "citizen":
        raise HTTPException(403, "Citizen workflow updates are not allowed through this endpoint.")
    if role in STATE_ADMIN_ROLES and existing.get("routing_decision") == "city_government" and not (existing.get("stage") == "government_review" and existing.get("requires_government")):
        raise HTTPException(403, "City Government must assign this problem to State Government first.")
    if role in CITY_ADMIN_ROLES:
        assigned = existing.get("assigned_to") or {}
        with conn() as c:
            user = c.execute("SELECT city_desk,city_department FROM users WHERE id=?", (s["user_id"],)).fetchone()
        city_desk = (user["city_desk"] if user and user["city_desk"] else "municipal_officer")
        city_department = user["city_department"] if user else "other_municipal"
        category = str(existing.get("city_category") or "other_municipal")
        category_scope = {
            "sanitation_officer": {"waste_management"},
            "water_officer": {"water_drainage"},
            "roads_engineer": {"road_transport", "street_lighting", "public_utilities", "public_safety"},
        }
        assigned_to_user = str(assigned.get("user_id") or "") == str(s["user_id"])
        if city_desk == "work_monitoring_officer" and not assigned_to_user:
            raise HTTPException(403, "This work is assigned to another resolution officer.")
        if city_desk == "field_verification_officer" and existing.get("stage") not in {"field_verification", "re_verification"}:
            raise HTTPException(403, "This verification case is not assigned to you.")
        department_scope = {
            "water_drainage": {"water_drainage"}, "roads": {"road_transport", "street_lighting"},
            "electricity": {"public_utilities", "street_lighting"}, "sanitation": {"waste_management"},
            "health": {"public_safety", "other_municipal"}, "environment": {"public_safety", "other_municipal"},
            "education": {"other_municipal"}, "other_municipal": {"other_municipal"},
        }
        department_terms = {
            "water_drainage": {"water", "drain", "sewage", "pipeline"}, "roads": {"road", "pothole", "footpath", "bridge"}, "electricity": {"electricity", "power", "transformer", "voltage"},
            "sanitation": {"garbage", "waste", "sanitation", "toilet"}, "health": {"health", "hospital", "doctor", "clinic"}, "environment": {"environment", "pollution", "forest", "tree"}, "education": {"education", "school", "teacher", "student"}, "other_municipal": set(),
        }
        problem_text = " ".join(str(existing.get(key) or "") for key in ("title", "desc", "department", "domain")).lower()
        can_access = city_desk in {"city_admin", "municipal_officer"} or assigned_to_user or (city_desk == "department_officer" and (category in department_scope.get(city_department, set()) or any(term in problem_text for term in department_terms.get(city_department, set())))) or category in category_scope.get(city_desk, set())
        if existing.get("routing_decision") != "city_government" or not can_access:
            raise HTTPException(403, "This problem is assigned to another city worker.")
        requested_stage = body.data.get("stage")
        if requested_stage:
            allowed_transitions = {
                "city_admin": {"city_admin_review", "field_verification", "department_assignment", "work_order", "deployed"},
                "field_verification_officer": {"field_verification", "re_verification", "city_admin_review"},
                "department_officer": {"department_assignment", "city_admin_review"},
                "work_monitoring_officer": {"work_order", "work_started", "work_in_progress", "re_verification", "government_review"},
            }
            if requested_stage not in allowed_transitions.get(city_desk, set()):
                raise HTTPException(403, "This workflow stage is not allowed for the current City Government desk.")
            if city_desk == "department_officer" and existing.get("stage") != "department_assignment":
                raise HTTPException(403, "Department Officer can act only after City Admin assigns the verified problem.")
            if city_desk == "field_verification_officer" and existing.get("stage") not in {"field_verification", "re_verification"}:
                raise HTTPException(403, "Field Verification can act only on an assigned verification case.")
        allowed_fields = set(ROLE_UPDATE_FIELDS[role])
        if city_desk == "field_team":
            allowed_fields -= {"verification", "notes", "milestones", "work_order", "sla", "citizen_updates"}
        elif city_desk not in {"city_admin", "municipal_officer", "ward_supervisor", "department_officer"}:
            allowed_fields -= {"verification", "milestones", "work_order", "sla", "citizen_updates"}
    else:
        allowed_fields = None
    data = merge_workflow_update(existing, body.data or {}, role, str(s["user_id"]), allowed_fields)
    # Never allow workflow roles to alter reporter identity, ownership, QR target,
    # canonical location, or creation metadata.
    for protected in ("owner_user_id", "reporter", "phone", "org", "by", "byType", "problem_location", "lat", "lng", "location_source", "location_precision", "accuracy", "qr_url", "qr_image", "date"):
        if protected in existing:
            data[protected] = existing[protected]
    verification = verification_for(data, exclude_id=challenge_id)
    data["verification"] = verification
    with conn() as c:
        c.execute("UPDATE challenges SET data=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", (json.dumps(data), challenge_id))
    milestones = data.get("milestones") or []
    chain.add_block("challenge_updated", challenge_id, {
        "id": challenge_id, "stage": data.get("stage"), "priority": data.get("priority"),
        "role": role, "updated_by": str(s["user_id"]),
        "milestonesDone": sum(1 for m in milestones if isinstance(m, dict) and m.get("done")),
        "milestonesTotal": len(milestones),
    })
    return {"item": data}

@app.delete("/api/challenges/{challenge_id}")
def delete_challenge(challenge_id: str, authorization: str = Header(default="")):
    session = current_session(authorization.removeprefix("Bearer ").strip())
    if session["role"] not in STATE_ADMIN_ROLES:
        raise HTTPException(403, "This portal section is restricted to state administration roles.")
    with conn() as c: c.execute("DELETE FROM challenges WHERE id=?", (challenge_id,))
    return {"ok": True}

@app.post("/api/ai/analyze")
def analyze(body: AnalyzeRequest):
    """Classifies a problem report using the configured open-source LLM
    (Ollama) when available, transparently falling back to the fast
    keyword engine otherwise. The response always includes an "engine"
    field so callers/UI can show which one actually answered."""
    return ai.classify_problem(body.title, body.description)

@app.post("/api/ai/chat")
def ai_chat(body: ChatRequest):
    return ai.chat_reply(body.message, body.lang, body.context)

@app.get("/api/ai/status")
def ai_status():
    """Lets the frontend show whether the local open-source model is
    actually reachable, or whether the app is running on the keyword
    fallback (e.g. Ollama isn't installed/running yet)."""
    return ai.status()

@app.get("/api/chain")
def get_chain(authorization: str = Header(default="")):
    """Full audit ledger is restricted to authenticated government users."""
    session = current_session(authorization.removeprefix("Bearer ").strip())
    if session["role"] not in STATE_ADMIN_ROLES:
        raise HTTPException(403, "This portal section is restricted to state administration roles.")
    return {"chain": chain.get_chain(), "publicKey": chain.public_key_hex(), "algorithm": "Ed25519 + SHA-256"}

@app.get("/api/chain/verify")
def verify_chain():
    """Recomputes every hash/signature/link and reports whether the ledger is intact."""
    return chain.verify_chain()

@app.get("/api/chain/public-key")
def chain_public_key():
    return {"publicKey": chain.public_key_hex(), "algorithm": "Ed25519"}

@app.post("/api/voice/assistant")
def voice_assistant(body: VoiceRequest):
    """Voice assistant brain: browser/mobile converts speech to text, this
    endpoint understands it and replies. Uses the local open-source LLM
    (Ollama) when available, otherwise falls back to keyword intent
    matching so voice support never goes down."""
    return ai.voice_reply(body.transcript, body.lang)


if __name__ == "__main__":
    # Convenience: `python main.py` works in addition to the uvicorn CLI command.
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
