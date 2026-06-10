#!/usr/bin/env bash
# Sicheres Aufräumen.
# Standard: stoppt NUR lokale Docker-Compose-Stacks.
# 'terraform destroy' (löscht ECHTE AWS-Ressourcen) NUR bei CONFIRM_TERRAFORM_DESTROY=yes
# und zusätzlicher Tastatur-Bestätigung.
#
# Umgebungsvariablen:
#   REMOVE_VOLUMES=yes               -> Docker-Daten-Volumes mit entfernen
#   CONFIRM_TERRAFORM_DESTROY=yes    -> erlaubt 'terraform destroy' (mit Rückfrage)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TF_DIR="$ROOT_DIR/infra/terraform"

REMOVE_VOLUMES="${REMOVE_VOLUMES:-no}"
CONFIRM_TERRAFORM_DESTROY="${CONFIRM_TERRAFORM_DESTROY:-no}"

info() { printf '\033[0;34m[destroy]\033[0m %s\n' "$*"; }
warn() { printf '\033[0;33m[destroy][WARN]\033[0m %s\n' "$*"; }

cd "$ROOT_DIR"

DOWN_ARGS=""
if [ "$REMOVE_VOLUMES" = "yes" ]; then
    warn "REMOVE_VOLUMES=yes -> lokale Daten-Volumes werden entfernt!"
    DOWN_ARGS="-v"
fi

# ─── Lokale Docker-Stacks stoppen (ungefährlich) ─────────────────────
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    info "Stoppe App-Stack (docker compose down ${DOWN_ARGS}) ..."
    docker compose down ${DOWN_ARGS} || true
    if [ -f observability/docker-compose.observability.yml ]; then
        info "Stoppe Observability-Stack ..."
        docker compose -f observability/docker-compose.observability.yml down ${DOWN_ARGS} || true
    fi
else
    warn "Docker nicht erreichbar – überspringe lokalen Compose-Cleanup."
fi

# ─── Terraform / AWS – sehr vorsichtig ───────────────────────────────
if [ "$CONFIRM_TERRAFORM_DESTROY" != "yes" ]; then
    warn "Terraform destroy NICHT ausgeführt (Standard)."
    warn "Es würde ECHTE AWS-Ressourcen löschen. Bewusst aktivieren mit:"
    warn "  CONFIRM_TERRAFORM_DESTROY=yes $0"
    info "Fertig (nur lokaler Cleanup)."
    exit 0
fi

if ! command -v terraform >/dev/null 2>&1; then
    warn "terraform ist nicht installiert – Abbruch."
    exit 1
fi

warn "CONFIRM_TERRAFORM_DESTROY=yes -> 'terraform destroy' in: $TF_DIR"
warn "Das entfernt ECHTE AWS-Ressourcen und ist NICHT umkehrbar."
printf 'Zum endgültigen Bestätigen exakt DESTROY eingeben: '
read -r answer
if [ "$answer" != "DESTROY" ]; then
    info "Abgebrochen – nichts gelöscht."
    exit 0
fi

( cd "$TF_DIR" && terraform destroy )
info "terraform destroy abgeschlossen."
