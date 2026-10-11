#!/usr/bin/env bash
# Installs kubectl + kind inside WSL. Docker must already work
# (Docker Desktop with WSL integration, or: sudo apt install -y docker.io)
set -e
command -v docker >/dev/null || { echo "Docker not found. Enable Docker Desktop WSL integration or: sudo apt install -y docker.io"; exit 1; }
if ! command -v kubectl >/dev/null; then
  echo "Installing kubectl..."
  curl -fsSLO "https://dl.k8s.io/release/$(curl -fsSL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
  sudo install -m 0755 kubectl /usr/local/bin/kubectl && rm kubectl
fi
if ! command -v kind >/dev/null; then
  echo "Installing kind..."
  curl -fsSLo kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-amd64
  sudo install -m 0755 kind /usr/local/bin/kind && rm kind
fi
echo "Tools ready:"; docker --version; kubectl version --client | head -1; kind --version
