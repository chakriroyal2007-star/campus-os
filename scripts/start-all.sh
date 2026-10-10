#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " Starting CampusOS Platform (Backend + Frontend) "
echo "=========================================================="

export JAVA_HOME="/Users/rahul/Library/Java/JavaVirtualMachines/ms-21.0.10/Contents/Home"

# 1. Start Backend in background
echo "[1/2] Launching Spring Boot Backend on http://localhost:8080 ..."
cd /Users/rahul/CAMPUS-OS/backend
mvn spring-boot:run &
BACKEND_PID=$!

# 2. Start Frontend in foreground
echo "[2/2] Launching Next.js Frontend on http://localhost:3000 ..."
cd /Users/rahul/CAMPUS-OS/frontend
npm run dev &
FRONTEND_PID=$!

echo "Both services launched!"
echo "Backend:  http://localhost:8080 (Swagger docs at /swagger-ui.html)"
echo "Frontend: http://localhost:3000"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true" EXIT
wait
