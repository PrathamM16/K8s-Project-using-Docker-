#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
echo ">> Building backend image"
docker build -t demo/backend:1.0 ./backend
echo ">> Building frontend image"
docker build -t demo/frontend:1.0 ./frontend
docker images | grep demo/
