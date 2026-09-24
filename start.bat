@echo off
setlocal
cd /d "%~dp0"
title Samadhan Setu - Full Stack

echo ==========================================
echo   Samadhan Setu - Full Stack Launcher
echo ==========================================

REM Backend
cd /d "%~dp0backend"
set "PYTHON_ENV=.venv-local"
if not exist "%PYTHON_ENV%\Scripts\python.exe" (
  echo [1/3] Creating Python environment...
  py -3 -m venv "%PYTHON_ENV%" || goto :backend_error
)
if not exist "%PYTHON_ENV%\Scripts\python.exe" goto :backend_error

"%PYTHON_ENV%\Scripts\python.exe" -c "import fastapi,uvicorn,cryptography" >nul 2>&1
if errorlevel 1 (
  echo [1/3] Installing backend dependencies...
  "%PYTHON_ENV%\Scripts\python.exe" -m pip install -r requirements.txt || goto :backend_error
)

REM Avoid starting a second copy when port 8000 is already occupied.
powershell -NoProfile -Command "$p=Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue; if($p){exit 0}else{exit 1}" >nul 2>&1
if errorlevel 1 (
  echo [2/3] Starting backend on http://127.0.0.1:8000 ...
  start "Samadhan Setu Backend" cmd /k "cd /d %~dp0backend && %PYTHON_ENV%\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000"
) else (
  echo [2/3] Backend already running on port 8000. Reusing it.
)

REM Frontend
cd /d "%~dp0"
if not exist "node_modules\react\package.json" (
  echo [3/3] Installing frontend dependencies...
  call npm.cmd install || goto :frontend_error
)

echo [3/3] Starting frontend on http://localhost:5173 ...
call npm.cmd run dev
exit /b %errorlevel%

:backend_error
echo.
echo BACKEND START FAILED.
echo Make sure Python 3.10+ is installed and requirements.txt can be installed.
pause
exit /b 1

:frontend_error
echo.
echo FRONTEND INSTALL FAILED.
echo Make sure Node.js and npm are installed and internet access is available for the first install.
pause
exit /b 1
