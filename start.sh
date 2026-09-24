#!/usr/bin/env bash
set -e

echo "================================"
echo " Samadhan Setu - Starting Project"
echo "================================"

# ---- Backend setup (Python) ----
cd backend
if [ ! -d ".venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv .venv
fi
source .venv/bin/activate
echo "Installing backend dependencies..."
pip install --upgrade pip >/dev/null
pip install -r requirements.txt
echo "Starting backend on http://127.0.0.1:8000 ..."
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

cleanup() {
  echo "Stopping backend (pid $BACKEND_PID)..."
  kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT

# ---- Frontend setup (Node) ----
if [ ! -f "node_modules/react/package.json" ] || [ ! -f "node_modules/vite/package.json" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi
echo "Starting frontend on http://localhost:5173 ..."
npm run dev
