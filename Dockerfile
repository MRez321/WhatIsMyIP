# ============================================================
# WhatIsMyIP — Multi-Stage Dockerfile
# ============================================================
# Stage 1: Build the React frontend (Vite + React + Tailwind)
# Stage 2: Compile the Go backend (pure stdlib, static)
# Stage 3: Lean Alpine runtime with non-root user
# ─────────────────────────────────────────
# Stage 1: Frontend Build (Vite + React + Tailwind)
# ─────────────────────────────────────────
FROM node:22-alpine AS frontend

WORKDIR /build
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Go Backend Build (pure stdlib, static binary)
# ─────────────────────────────────────────
FROM golang:1.24-alpine AS backend

WORKDIR /src
COPY go.mod ./
COPY main.go ./
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o /out/whatismyip .

# ─────────────────────────────────────────
# Stage 3: Production Runtime (Alpine, non-root)
# ─────────────────────────────────────────
FROM alpine:3.21 AS runtime

# Install minimal runtime deps:
#   ca-certificates — TLS verification
#   wget            — healthcheck probe
RUN apk add --no-cache ca-certificates wget && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup

WORKDIR /app

# Copy the Go binary and the static frontend assets
COPY --from=backend /out/whatismyip /app/whatismyip
COPY --from=frontend /build/dist /app/dist
RUN chown -R appuser:appgroup /app

# Environment defaults (overridable via `docker run -e` / compose `environment`)
ENV PORT=8080 \
    STATIC_DIR=/app/dist

# Drop privileges
USER appuser

EXPOSE 8080

# Healthcheck — mirrors docker-compose.yml
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:8080/api/ping

ENTRYPOINT ["/app/whatismyip"]
