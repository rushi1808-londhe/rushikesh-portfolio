#!/usr/bin/env bash
# Runs on the EC2 host (Jenkins copies it to ~/portfolio and calls it over SSH).
# Pulls secrets from AWS Secrets Manager into .env, pulls the tagged images from ECR and restarts the stack.
# The EC2 instance role (portfolio-ec2-role / policy portfolio-ec2-runtime) needs
# secretsmanager:GetSecretValue on the secret and ECR pull on the two repositories.
# The SSH user must be in the docker group: sudo usermod -aG docker ubuntu
#
# Usage: ./deploy.sh <ecr-registry> <image-tag> [secret-id]
set -euo pipefail

export ECR_REGISTRY="$1"
export IMAGE_TAG="$2"
SECRET_ID="${3:-prod/portfolio}"
export AWS_REGION="${AWS_REGION:-ap-south-1}"

cd "$(dirname "$0")"
COMPOSE=(docker compose -f docker-compose.prod.yml)

echo "==> Fetching secrets ($SECRET_ID)"
./fetch-env.sh "$SECRET_ID" .env

echo "==> Logging in to $ECR_REGISTRY"
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

echo "==> Pulling $IMAGE_TAG"
"${COMPOSE[@]}" pull

echo "==> Starting stack"
"${COMPOSE[@]}" up -d --remove-orphans

echo "==> Waiting for backend to become healthy"
for _ in $(seq 1 30); do
  status="$(docker inspect -f '{{.State.Health.Status}}' rushikesh-portfolio-backend 2>/dev/null || echo missing)"
  if [ "$status" = "healthy" ]; then
    break
  fi
  sleep 5
done
if [ "$status" != "healthy" ]; then
  echo "Backend is '$status' after 150s; recent logs:" >&2
  docker logs --tail 80 rushikesh-portfolio-backend >&2
  exit 1
fi

# Keep this deploy's tag on record for rollback: ./deploy.sh <registry> <previous-tag>
echo "$IMAGE_TAG" >> deployed-tags.log

echo "==> Removing unused images"
docker image prune -af --filter "until=168h" >/dev/null

echo "==> Deployed $IMAGE_TAG"
