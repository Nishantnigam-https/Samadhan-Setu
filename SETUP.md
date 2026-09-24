# Samadhan Setu — Clean Setup

## 1. Backend

```bash
cd backend
python -m venv .venv
# Linux/macOS
source .venv/bin/activate
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --host 127.0.0.1 --port 8000
```

On Windows use `copy .env.example .env` instead of `cp`.

## 2. Frontend

From the project root:

```bash
npm install
npm run build
npm run dev
```

Open `http://localhost:5173`.

## 3. Ollama (optional)

The app works without Ollama using the deterministic fallback classifier. For local LLM mode, install Ollama separately, pull the model configured in `.env`, and keep Ollama running.

## 4. Production configuration

- Set `PUBLIC_BASE_URL` to the real HTTPS public address before generating QR codes.
- Set `ALLOWED_ORIGINS` to only the real frontend origin(s).
- Set `ENFORCE_JHARKHAND_GPS=true` when the deployment must reject out-of-state GPS.
- Keep `GOVT_RESET_CODE` empty unless you intentionally need the local/demo recovery mechanism. Production should use organizational SSO or verified recovery.
- Never commit `.env`, SQLite databases, or `backend/keys/*`.

## 5. Publishing it live (Render + Vercel)

This is a two-part app — a Python backend and a static frontend — so it needs
two deployments, not one.

### Backend (Render)

1. Push this project to a GitHub repo.
2. In the Render dashboard: **New → Blueprint**, and pick that repo. Render
   reads `render.yaml` at the project root and creates the service for you,
   including a persistent disk for the database and signing keys (so
   registered accounts survive redeploys).
3. Once it's deployed, open the service's **Environment** tab and fill in:
   - `ALLOWED_ORIGINS` — your frontend's exact URL, e.g.
     `https://samadhan-setu.vercel.app` (no trailing slash).
   - `PUBLIC_BASE_URL` — this backend service's own public HTTPS URL.
4. Copy the backend's public URL (e.g.
   `https://samadhan-setu-backend.onrender.com`) — you need it in the next step.

### Frontend (Vercel)

1. In the Vercel dashboard: **Add New → Project**, pick the same repo.
   `vercel.json` at the project root tells it to run `npm run build` and
   serve `dist/`.
2. Under **Settings → Environment Variables**, add `VITE_API_URL` set to the
   backend URL from step 4 above, then redeploy so the build picks it up.
3. Add your custom domain under **Settings → Domains** if you have one —
   Vercel issues the HTTPS certificate automatically.

### After both are live

- Visit the frontend URL. Every portal (citizen, government, city worker,
  field verifier, university, industry) uses the same registration form —
  anyone can create an account and sign in; passwords are PBKDF2-hashed
  server-side before they ever touch the database (see `hash_password` in
  `backend/main.py`).
- If you expect real concurrent traffic rather than a demo/pilot, plan to
  move from SQLite to a hosted Postgres database — SQLite handles one writer
  at a time and will start rejecting writes under real concurrent load.
- The default `AI_ENGINE=keyword` in `render.yaml` uses the deterministic
  fallback classifier so there's no dependency on a locally-running Ollama
  server. To use real LLM-based classification in production, follow
  **[OLLAMA_HOSTING.md](./OLLAMA_HOSTING.md)** to run Ollama on its own small
  VPS, then set `AI_ENGINE=ollama`, `OLLAMA_BASE_URL` and `OLLAMA_API_KEY` in
  Render's environment variables to point at it.

## What was fixed

- Removed packaged secrets/private keys from the release.
- Removed the published government recovery-code default; recovery is disabled unless explicitly configured.
- Added security response headers.
- Restricted full audit-ledger access to government sessions.
- Updated the frontend ledger client to send its government session token.
- Enforced role-specific workflow fields server-side.
- Protected reporter identity, ownership, QR target, and canonical problem location from workflow tampering.
- Prevented public/cross-role challenge lists from leaking phone, organization, reporter, or owner identifiers.
- Restricted community confirmations to citizen accounts.
- Preserved canonical problem location and server-side AI routing.
- Improved startup scripts so incomplete `node_modules` directories trigger dependency installation.
- Updated documentation to describe the audit system accurately as a single-node tamper-evident ledger.
