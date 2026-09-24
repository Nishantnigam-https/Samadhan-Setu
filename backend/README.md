# Samadhan Setu — Python Backend

FastAPI + SQLite backend providing real accounts, persisted problem reports,
an open-source-LLM-backed problem classifier (with an instant keyword
fallback), and a text-based voice-assistant brain.

## Install

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8000
# or simply:
python main.py
```

- Backend URL: http://127.0.0.1:8000
- API docs: http://127.0.0.1:8000/docs
- SQLite database `samadhan_setu.db` is created automatically on first run.

## Configuration

Copy `.env.example` to `.env` to customise which frontend origins are allowed
to call this API (`ALLOWED_ORIGINS`). The defaults already cover the standard
Vite dev (`5173`) and preview (`4173`) ports on both `localhost` and
`127.0.0.1`, so most setups need no configuration at all.

## Open-source AI (problem classification + voice assistant)

By default (`AI_ENGINE=ollama`), problem classification (`POST /api/ai/analyze`)
and the voice assistant (`POST /api/voice/assistant`) try to use a real
**open-source LLM running locally via [Ollama](https://ollama.com)** — no API
key, no cost, no data leaving your machine. If Ollama isn't installed or
isn't running, the app **automatically falls back** to the original fast,
deterministic keyword classifier, so nothing breaks either way.

To turn on the real model:

```bash
# 1. Install Ollama: https://ollama.com/download
# 2. Pull an open-source model (pick one that fits your machine)
ollama pull llama3.1        # or: mistral, gemma2, qwen2.5, phi3 ...
# 3. Make sure the Ollama server is running (it usually auto-starts)
ollama serve
```

Then in `backend/.env`:

```bash
AI_ENGINE=ollama                       # "keyword" disables the LLM entirely
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1                  # must match a model you've pulled
AI_TIMEOUT_SECONDS=12
```

Check what's actually active at `GET /api/ai/status` or `GET /api/health`
(the `"ai"` field there shows `"active_engine": "ollama:llama3.1"` when the
model answered, or `"keyword_fallback"` when it didn't). Every AI response
also includes an `"engine"` field for the same reason.

Model output is never trusted blindly: the domain, confidence, and priority
the model returns are validated against the app's own rules before use, and
any invalid/hallucinated/unreachable response falls back to the keyword
engine transparently.

## Notes

- Passwords are hashed with PBKDF2-HMAC-SHA256 (100,000 iterations) with a
  per-user random salt — never stored in plain text.
- Speech-to-text and text-to-speech happen entirely in the browser via the
  Web Speech API. This backend only receives and interprets plain text, so
  no native audio libraries (PyAudio, espeak, etc.) are required here.


## Blockchain / tamper-evident ledger

This backend includes a single-node, SQLite-backed hash-chained ledger in `crypto_chain.py`. Problem creation, updates, and community verification append signed blocks using SHA-256 hashes and Ed25519 signatures. It is **not** a distributed public blockchain; it is a local tamper-evident audit ledger suitable for a project/demo. Verify it with `GET /api/chain/verify` or inspect it with `GET /api/chain`.

## GPS demo mode

By default `ENFORCE_JHARKHAND_GPS=false`, so the project can be tested from outside Jharkhand. Coordinates are still saved exactly as reported and are labelled `gps_scope=outside_jharkhand_demo`. For production, set `ENFORCE_JHARKHAND_GPS=true`.


## Government password recovery

The Government sign-in screen includes **Forgot password?**. For this local/demo
build, password recovery uses a recovery code because no email/SMS provider is
configured. Recovery is disabled unless `GOVT_RESET_CODE` is explicitly configured. For a real deployment,
set a private `GOVT_RESET_CODE` value in `backend/.env` and do not publish it.
Resetting the password invalidates existing government sessions.


## Government accounts

This build supports multiple government portal accounts and concurrent government sessions. Password reset targets the account matching the government name and organisation and invalidates only that account's active sessions.
