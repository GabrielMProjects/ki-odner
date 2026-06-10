# scripts

Hilfsskripte für lokalen Start, Deployment-Vorbereitung, Health-Checks und **sicheres** Aufräumen.

## Übersicht

| Script | Zweck |
|---|---|
| `setup-local.sh` | Linux/macOS/Git Bash: Docker/Compose prüfen, optional bauen, App-Stack (optional + Observability) starten. |
| `setup-local.ps1` | Windows PowerShell: gleiche Logik. |
| `deploy.sh` | Helm validieren (`lint`/`template`); echtes Deployment **nur** mit `CONFIRM_DEPLOY=yes`. |
| `destroy.sh` | Lokale Docker-Stacks stoppen; `terraform destroy` **nur** mit `CONFIRM_TERRAFORM_DESTROY=yes` + Tastatur-Bestätigung. |
| `health-check.sh` | Prüft lokale URLs (Frontend/Backend/Grafana/Prometheus) und gibt OK/FAIL aus. |

## Beispiele

**Git Bash / Linux / macOS:**
```bash
# App-Stack starten (mit Build) + Observability
BUILD=true OBSERVABILITY=true ./scripts/setup-local.sh

# Health-Check
./scripts/health-check.sh

# Helm nur validieren (kein Deploy)
./scripts/deploy.sh

# Aufräumen (nur lokal)
./scripts/destroy.sh
```

**Windows PowerShell:**
```powershell
./scripts/setup-local.ps1 -Build -Observability
```

## 🔒 Sicherheitsmechanismen

- **`deploy.sh`** macht ohne `CONFIRM_DEPLOY=yes` **ausschließlich** Validierung
  (`helm lint` + `helm template`). Ein echtes `helm upgrade --install` passiert nur bewusst:
  ```bash
  CONFIRM_DEPLOY=yes ./scripts/deploy.sh
  ```
- **`destroy.sh`** stoppt standardmäßig **nur lokale Docker-Stacks**. Ein `terraform destroy`
  (löscht **echte AWS-Ressourcen**) erfordert **zwei** Schritte:
  1. Umgebungsvariable `CONFIRM_TERRAFORM_DESTROY=yes`
  2. zusätzlich exakt `DESTROY` eintippen.
- **`REMOVE_VOLUMES=yes`** ist nötig, um lokale Daten-Volumes zu löschen (sonst bleiben sie erhalten).

### Warum `destroy.sh` Terraform nicht automatisch ausführt

`terraform destroy` ist **nicht umkehrbar** und betrifft **echte, ggf. kostenpflichtige**
Cloud-Ressourcen. Ein versehentlicher Aufruf könnte Daten/Infrastruktur löschen. Deshalb ist
es bewusst hinter eine doppelte Bestätigung gelegt – lokales Aufräumen (Docker) bleibt dagegen
gefahrlos der Standard.

## Hinweise

- **Keine Secrets** in den Skripten. **Keine AWS-Credentials** – diese kommen aus deiner
  lokalen AWS-Credential-Kette, nicht aus dem Repo.
- Die Skripte starten hier **nichts von selbst** – du führst sie bewusst aus.
- Git Bash unter Windows: ggf. `chmod +x scripts/*.sh` vor dem ersten Lauf.
