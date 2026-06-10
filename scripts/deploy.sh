#!/usr/bin/env bash
# Deployment-Vorbereitung für das Helm-Chart.
# Standard: NUR Validierung (helm lint + helm template). KEIN automatisches Deployment.
# Echtes Deployment ausschließlich bei CONFIRM_DEPLOY=yes.
#
# Umgebungsvariablen:
#   CONFIRM_DEPLOY=yes   -> führt 'helm upgrade --install' aus (sonst nur Validierung)
#   RELEASE=angel-lara   -> Helm-Release-Name
#   NAMESPACE=angel-lara -> Kubernetes-Namespace
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CHART_DIR="$ROOT_DIR/helm/angel-lara"

RELEASE="${RELEASE:-angel-lara}"
NAMESPACE="${NAMESPACE:-angel-lara}"
CONFIRM_DEPLOY="${CONFIRM_DEPLOY:-no}"

info() { printf '\033[0;34m[deploy]\033[0m %s\n' "$*"; }
warn() { printf '\033[0;33m[deploy][WARN]\033[0m %s\n' "$*"; }
err() { printf '\033[0;31m[deploy][FEHLER]\033[0m %s\n' "$*" >&2; }

if ! command -v helm >/dev/null 2>&1; then
    err "helm ist nicht installiert."
    exit 1
fi

info "helm lint ..."
helm lint "$CHART_DIR"

info "helm template (Render-Test) ..."
helm template "$RELEASE" "$CHART_DIR" >/dev/null
info "Template OK."

# ─── Sicherheitsschranke ─────────────────────────────────────────────
if [ "$CONFIRM_DEPLOY" != "yes" ]; then
    warn "CONFIRM_DEPLOY != yes  ->  KEIN Deployment (nur Validierung ausgeführt)."
    warn "Echtes Deployment bewusst starten mit:  CONFIRM_DEPLOY=yes $0"
    exit 0
fi

if ! command -v kubectl >/dev/null 2>&1; then
    err "kubectl ist nicht installiert (für ein echtes Deployment erforderlich)."
    exit 1
fi

info "CONFIRM_DEPLOY=yes -> helm upgrade --install ..."
helm upgrade --install "$RELEASE" "$CHART_DIR" \
    --namespace "$NAMESPACE" --create-namespace
info "Deployment abgeschlossen."
