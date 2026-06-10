#requires -Version 5.1
<#
.SYNOPSIS
  Lokaler Start des App-Stacks (optional inkl. Observability). Kein AWS.
.EXAMPLE
  ./scripts/setup-local.ps1 -Build -Observability
#>
[CmdletBinding()]
param(
    [switch]$Build,
    [switch]$Observability
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

function Info($m) { Write-Host "[setup] $m" -ForegroundColor Cyan }
function Fail($m) { Write-Host "[setup][FEHLER] $m" -ForegroundColor Red; exit 1 }

# ─── Voraussetzungen prüfen ──────────────────────────────────────────
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Fail "Docker ist nicht installiert oder nicht im PATH."
}
docker info *> $null
if ($LASTEXITCODE -ne 0) { Fail "Docker-Daemon nicht erreichbar. Bitte Docker Desktop starten." }

docker compose version *> $null
if ($LASTEXITCODE -ne 0) { Fail "'docker compose' ist nicht verfuegbar (Compose v2 erforderlich)." }

Set-Location $root

if ($Build) {
    Info "Baue lokale Images (docker compose build) ..."
    docker compose build
}

Info "Starte App-Stack (docker compose up -d) ..."
docker compose up -d

if ($Observability) {
    Info "Starte Observability-Stack ..."
    docker compose -f observability/docker-compose.observability.yml up -d
}

Info "Fertig. Status pruefen mit: scripts/health-check.sh"
