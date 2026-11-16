@echo off
title Smart AI Assistant - Launcher
echo ========================================================
echo         Smart AI Assistant - Starting Servers
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting FastAPI Backend on http://localhost:8001...
start "Smart AI Assistant - Backend" cmd /k "cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001"

echo [2/2] Starting React + Vite Frontend on http://localhost:5174...
start "Smart AI Assistant - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo  Both servers launched successfully!
echo  Backend:   http://localhost:8001 (Swagger docs: http://localhost:8001/docs)
echo  Frontend:  http://localhost:5174
echo ========================================================
echo.
pause
