# Kubernetes Deployment Demo (WSL)

Browser -> Frontend (nginx) -> Backend (Node API) -> RabbitMQ -> Worker -> PostgreSQL

## Run (inside WSL, from this folder)
    ./scripts/00-setup-tools.sh   # once
    ./scripts/01-build.sh         # docker build
    ./scripts/02-deploy.sh        # kind cluster + kubectl apply
Open http://localhost:8080 and http://localhost:15672 (guest/guest)

## Demo commands
    kubectl -n demo get pods,svc
    kubectl -n demo logs deploy/worker -f
    kubectl -n demo scale deploy/backend --replicas=4
    kubectl -n demo delete pod -l app=backend          # self-healing
    kubectl -n demo scale deploy/worker --replicas=0   # orders stay PENDING in queue; scale back to 1 to drain

## Cleanup
    ./scripts/03-cleanup.sh
