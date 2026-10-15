#!/usr/bin/env bash
#
# build.sh — Build the WhatIsMyIP Docker image manually.
#
# Usage:
#   ./scripts/build.sh                # uses defaults: whatismyip:latest
#   ./scripts/build.sh myip v1.0      # custom name and tag
#
set -euo pipefail

IMAGE_NAME="${1:-whatismyip}"
IMAGE_TAG="${2:-latest}"

# Navigate to project root (parent of scripts/)
cd "$(dirname "$0")/.."

echo "🔨 Building ${IMAGE_NAME}:${IMAGE_TAG}..."
echo ""

docker build \
  --rm \
  -t "${IMAGE_NAME}:${IMAGE_TAG}" \
  -f Dockerfile \
  .

echo ""
echo "✅ Image '${IMAGE_NAME}:${IMAGE_TAG}' built successfully!"
echo ""
echo "🚀 Run the container:"
echo "  docker run -d -p 8080:8080 --name ${IMAGE_NAME} ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""
echo "🐳 Or use Docker Compose:"
echo "  docker compose up -d"
echo ""
echo "📋 Verify health:"
echo "  curl http://localhost:8080/api/ping"
