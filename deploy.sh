#!/bin/bash
# XCRM Deployment Script
# Usage: ./deploy.sh [staging|production]

ENV=${1:-production}
COMPOSE_FILE="docker-compose.prod.yml"

if [ "$ENV" = "staging" ]; then
  COMPOSE_FILE="docker-compose.staging.yml"
fi

echo "Deploying to $ENV..."

# Pull latest code
git pull origin main

# Build and start
docker compose -f $COMPOSE_FILE pull
docker compose -f $COMPOSE_FILE up -d --build

# Run migrations
docker compose -f $COMPOSE_FILE exec backend alembic upgrade head

# Clean up unused images
docker system prune -f

echo "Deployment complete!"
