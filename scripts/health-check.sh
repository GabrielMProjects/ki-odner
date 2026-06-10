#!/usr/bin/env bash
# Prüft lokale Service-URLs und gibt OK/FAIL aus.
# Bewusst ohne 'set -e', damit alle Checks durchlaufen.
set -uo pipefail

check() {
    name="$1"
    url="$2"
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$url" 2>/dev/null || echo 000)"
    if [ "$code" != "000" ] && [ "$code" -lt 500 ]; then
        printf '\033[0;32m[OK]\033[0m   %-11s %-25s (HTTP %s)\n' "$name" "$url" "$code"
    else
        printf '\033[0;31m[FAIL]\033[0m %-11s %-25s (HTTP %s)\n' "$name" "$url" "$code"
    fi
}

echo "== Health-Check (lokal) =="
check "Frontend"   "http://localhost:8080"
check "Backend"    "http://localhost:8000"
check "Grafana"    "http://localhost:3000"
check "Prometheus" "http://localhost:9090"
