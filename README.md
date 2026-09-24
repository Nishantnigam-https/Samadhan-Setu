# Samadhan Setu — Full Stack Project

A citizen–university–industry–government innovation portal for Jharkhand, with a
React + TypeScript frontend and a Python (FastAPI + SQLite) backend that provides
real accounts, persisted problem reports, local Ollama AI classification with a deterministic keyword fallback, and a voice
assistant endpoint.

## What's included

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS v4 (`src/App.tsx` is a
  self-contained single-file build: data, icons, UI kit, role desks and app shell).
- **Backend**: FastAPI + SQLite (`backend/main.py`) — real signup/login with
  hashed passwords, persisted challenges (create/read/update/delete), a
  rule-based domain/priority classifier, and a text-based voice-assistant brain.
- **Blockchain ledger & cryptography** (`backend/crypto_chain.py`): every problem
  report and status change is appended as a signed, hash-chained block (SHA-256
  + Ed25519 digital signatures) — a tamper-evident audit trail viewable and
  verifiable from the govt dashboard's "Ledger & Trust" tab. Sensitive account
  fields are encrypted at rest with Fernet (AES-128-CBC + HMAC-SHA256), and
  passwords are hashed with PBKDF2-SHA256 (100,000 rounds), never stored in
  plain text.
- **Voice input**: handled entirely in the browser via the Web Speech API
  (`SpeechRecognition` for speech-to-text, `speechSynthesis` for text-to-speech).
  The backend only interprets the resulting text — no native audio libraries
  are required on the server.
- A live "Portal online / Offline" indicator in the header that pings the
  backend's health endpoint every 15 seconds, so you can see at a glance
  whether you're talking to the real backend or running on local data.

The frontend works even if the backend isn't running (it falls back to local
data and queues writes), but you'll want both running for the full
experience — real accounts, persistence across restarts, and shared data.

## Quick start (one command)

**Windows:**
```bat
start.bat
```

**macOS / Linux:**
```bash
./start.sh
```

Each script creates a Python virtual environment, installs backend
dependencies, starts the backend, installs frontend dependencies if needed,
and starts the Vite dev server. Stop everything with `Ctrl+C`.

## Manual setup

### 1. Backend (Python + FastAPI + SQLite)

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- Backend: http://127.0.0.1:8000
- Interactive API docs (Swagger UI): http://127.0.0.1:8000/docs
- A `samadhan_setu.db` SQLite file is created automatically on first run.
- CORS origins are configurable via `ALLOWED_ORIGINS` (see `backend/.env.example`);
  sensible defaults are already set for the standard Vite ports.

### 2. Frontend (React + TypeScript + Vite)

In a second terminal, from the project root:

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Copy `.env.example` to `.env` if your backend runs somewhere other than
  `http://127.0.0.1:8000`.

### 3. Build for production

```bash
npm run build
npm run preview
```

## How login works

The first time you sign in as **any role** (citizen, university, industry or
government) with a name, organisation and password, the backend creates a
real account for you (password hashed with PBKDF2-HMAC-SHA256, never stored
in plain text). Signing in again with the same name + role verifies your
password — the same account, same stored data, every time, for every role.

The frontend also **remembers your signed-in session in the browser**
(`localStorage`), so if you close the tab or refresh the page, you're taken
straight back into the portal without logging in again. Use "Sign out" to
end that session. If you do sign out, the login screen also remembers the
name/organisation you last used for that role, so next time you only need to
re-enter your password.

If the backend isn't running, login and challenge submission still work
locally in the browser, but nothing is saved to disk.

## API summary

| Method | Path                    | Purpose                                |
|--------|-------------------------|-----------------------------------------|
| GET    | `/api/health`           | Health check (used by the UI badge)     |
| POST   | `/api/auth/login`       | Create/verify a role-based account      |
| GET    | `/api/challenges`       | List all saved problem reports          |
| GET    | `/api/challenges/{id}`  | Fetch one problem report                |
| POST   | `/api/challenges`       | Create a problem report                 |
| PUT    | `/api/challenges/{id}`  | Update a problem report                 |
| DELETE | `/api/challenges/{id}`  | Delete a problem report                 |
| POST   | `/api/ai/analyze`       | Rule-based domain/priority classifier   |
| POST   | `/api/voice/assistant`  | Interpret a voice transcript            |

## Troubleshooting

- **"npm is not recognized" / PowerShell blocks scripts**: use `npm.cmd install`
  and `npm.cmd run dev`, or run `start.bat` which already does this for you.
- **CORS errors in the browser console**: make sure the backend is running and
  that the frontend's origin is listed in `ALLOWED_ORIGINS` (defaults already
  cover `localhost:5173`/`127.0.0.1:5173`).
- **Voice input does nothing**: the Web Speech API is only available in
  Chromium-based browsers (Chrome, Edge) and requires microphone permission.
- **Port already in use**: change `--port 8000` for the backend or Vite's
  default `5173` (`vite --port <n>`), and update `.env` accordingly.

## New: Live Problem Intelligence & Verification Map
- OpenStreetMap + Leaflet interactive map (no Google Maps API key required)
- Real browser GPS capture with permission
- Verification score based on description completeness, GPS, evidence, nearby similar reports, community confirmations, and consistency
- Nearby duplicate clustering using text similarity + geographic distance (3 km radius)
- Citizens can Confirm or Dispute a report; the score is recalculated and the event is written to the cryptographic ledger
- Map markers show credibility state: green = highly credible, yellow = credible/review, red = needs review

Note: the score is an evidence-confidence indicator, not a claim that a person is lying or that a report is objectively proven true.

## Final AI two-portal routing flow

After a citizen submits a problem, the Python backend re-analyzes the report. AI categorizes the problem and makes a binary routing decision:

- **Local city problem → City Government Portal**
- **Not a local city problem → Main Government Portal**

The browser preview follows the same binary rule, but the server-side decision is authoritative. Research, funding, university, or investment flags can affect the downstream Main Government workflow after a problem reaches that portal; they do not bypass the initial routing decision.

See `CHECK_WORKFLOW.md` for the complete flow and examples.

## Government single-login + citizen problem QR flow

This build adds the requested workflow:

1. Multiple Government accounts are supported.
2. Government sessions are independent; one officer signing in does not log out other officers.
3. Citizen and Government logins use server-side bearer sessions instead of only browser localStorage.
4. A citizen's submitted problem is saved in the shared SQLite database, so the Government portal sees it after login.
5. Government records include the reporter's name, phone, user ID and submission type.
6. Every new problem automatically receives a QR code. Scanning it opens a public problem page without exposing the citizen's private contact details.
7. Set `PUBLIC_BASE_URL` in `backend/.env` to the machine's reachable address when scanning from another phone/device. For example, on a local Wi-Fi demo use the PC's LAN IP and port 8000.

The first login after installing this updated build should use the Government account you want to keep. If you are replacing an old demo database with conflicting accounts, back up and remove the old `backend/samadhan_setu.db` once, then start the backend again.


## Offline/local run
1. Start backend: `cd backend && pip install -r requirements.txt && python main.py`
2. In another terminal: `npm install && npm run dev`
3. Open the local Vite address shown in the terminal. The app uses local SQLite (`backend/samadhan_setu.db`) and does not require an external database.

GitHub note: GitHub Pages alone cannot run the Python/FastAPI backend. For a fully functional offline demo, clone/download the repository and run the two local commands above. A frontend-only GitHub Pages deployment would need an external API/backend.

## Citizen location behavior
- When a citizen captures GPS and the browser location is inside the Jharkhand demo boundary, the report uses the real GPS coordinates.
- If the browser GPS is outside Jharkhand, unavailable, denied, or unsupported, the citizen can still submit by selecting the problem district/block; the app maps the report to that district's approximate centre and labels it as approximate.
- The map popup shows whether a point came from exact browser GPS or the district/block fallback.

## Samadhan Mitra (enhanced local AI)
This version upgrades the former AI Copilot into **Samadhan Mitra**.

### Features
- Automatic category/domain detection
- Urgency and priority scoring
- Duplicate candidate scan against saved problems
- Genuineness/suspicion score for report quality
- Better problem-description suggestion
- Suggested responsible government department
- Ask **Samadhan Mitra** chatbot for practical guidance

### Recommended local model
The default model is now `qwen2.5:3b`, which is lightweight and suitable for Hindi/Hinglish and English.

Install Ollama, then run:

```bash
ollama pull qwen2.5:3b
```

For a stronger machine, you may instead use `qwen2.5:7b` by changing `OLLAMA_MODEL` in `backend/.env`.


## Security / deployment notes

- `backend/.env` is local-only and must never be committed. Use `backend/.env.example`.
- Signing/encryption keys are generated on first server start and are intentionally excluded from the release archive.
- Government password recovery is disabled unless `GOVT_RESET_CODE` is explicitly configured. For production, replace the demo recovery code with verified organizational identity recovery/SSO.
- The audit system is a single-node, tamper-evident hash-chained ledger (Ed25519 + SHA-256), not a distributed blockchain.
- Workflow updates are enforced server-side by role and protected fields cannot be overwritten by client payloads.
- Public problem pages expose only public-safe problem fields and never reporter contact information.
- Set `ENFORCE_JHARKHAND_GPS=true` for a production Jharkhand deployment and set `PUBLIC_BASE_URL` to the real HTTPS domain before generating QR codes.

### Production checklist

1. Generate a private `backend/.env`.
2. Set a real HTTPS `PUBLIC_BASE_URL`.
3. Set production `ALLOWED_ORIGINS`.
4. Enable Jharkhand location enforcement if required.
5. Configure organizational identity/SSO instead of the demo government recovery code.
6. Run `npm install && npm run build` from a clean checkout.
7. Back up the SQLite database and signing/encryption keys securely.
