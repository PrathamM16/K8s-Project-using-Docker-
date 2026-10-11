#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

FRONTEND_PORT=8088
RABBIT_PORT=15673

if ! kind get clusters | grep -q '^demo$'; then
  echo ">> Creating kind cluster"
  kind create cluster --name demo --config kind-config.yaml
fi

echo ">> Loading images into cluster"
kind load docker-image demo/backend:1.0 demo/frontend:1.0 --name demo

echo ">> Applying manifests"
kubectl apply -f k8s/

echo ">> Waiting for rollout"
for d in postgres rabbitmq backend worker frontend; do
  kubectl -n demo rollout status deploy/$d --timeout=180s
done

echo
kubectl -n demo get pods
echo
echo "=========================================="
echo " Frontend:     http://localhost:${FRONTEND_PORT}"
echo " RabbitMQ UI:  http://localhost:${RABBIT_PORT}  (guest / guest)"
echo "=========================================="
