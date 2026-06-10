#!/usr/bin/env bash
# Lokaler Start des App-Stacks (optional inkl. Observability). Kein AWS.
#
# Umgebungsvariablen:
#   BUILD=true           -> vorher 'docker compose build'
#   OBSERVABILITY=true   -> zusätzlich den Observability-Stack starten
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

BUILD="${BUILD:-false}"
OBSERVABILITY="${OBSERVABILITY:-false}"

info() { printf '\033[0;34m[setup]\033[0m %s\n' "$*"; }
err() { printf '\033[0;31m[setup][FEHLER]\033[0m %s\n' "$*" >&2; }

# ─── Voraussetzungen prüfen ──────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
    err "Docker ist nicht installiert oder nicht im PATH."
    exit 1
fi
if ! docker info >/dev/null 2>&1; then
    err "Docker-Daemon nicht erreichbar. Bitte Docker Desktop starten."
    exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
    err "'docker compose' ist nicht verfügbar (Compose v2 erforderlich)."
    exit 1
fi

cd "$ROOT_DIR"

if [ "$BUILD" = "true" ]; then
    info "Baue lokale Images (docker compose build) ..."
    docker compose build
fi

info "Starte App-Stack (docker compose up -d) ..."
docker compose up -d

if [ "$OBSERVABILITY" = "true" ]; then
    info "Starte Observability-Stack ..."
    docker compose -f observability/docker-compose.observability.yml up -d
fi

info "Fertig. Status prüfen mit: scripts/health-check.sh"
