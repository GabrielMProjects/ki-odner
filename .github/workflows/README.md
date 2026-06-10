# .github/workflows

CI-Pipelines für das Projekt. **Reine Qualitätsprüfung** – es wird **nichts deployt**,
**kein AWS** angesprochen und **kein Docker-Image gepusht**.

## Workflows

| Workflow | Trigger | Was er prüft |
|---|---|---|
| `ci.yml` | Push/PR auf `main` | **Angular**: `npm ci`/`install` + `npm run build`. **Laravel/Bagisto**: PHP 8.2, `composer install`, `php artisan key:generate`, `php -l`-Syntaxcheck, `php artisan --version`. **Helm**: `helm lint` + `helm template`. |
| `terraform.yml` | Push/PR mit Änderungen unter `infra/terraform/**` | `terraform fmt -check -recursive`, `init -backend=false`, `validate`. |
| `docker.yml` | Push/PR mit Änderungen an `angel/**`, `lara/**`, `*Dockerfile`, `docker-compose.yml` | `docker build` für **angel** und **lara** (`push: false`). |

## Bewusste Grenzen (Sicherheit)

- ❌ **Kein Deploy** – die Pipelines verändern nichts Live.
- ❌ **Kein `terraform apply`** – nur `fmt`/`init -backend=false`/`validate` (keine AWS-Credentials nötig).
- ❌ **Kein `docker push`** – Images werden nur gebaut, nicht in eine Registry geladen.
- ❌ **Keine Secrets** – die Workflows benötigen keine Repository-Secrets.
  `permissions: contents: read` hält die Rechte minimal.

## Später: Deploy-Workflow ergänzen

Ein separater Workflow (z. B. `deploy.yml`) könnte – **bewusst und manuell** ausgelöst –
deployen. Empfehlungen:

- Trigger `workflow_dispatch` (Start per Knopfdruck) statt automatisch bei jedem Push.
- AWS-Zugriff über **OIDC** (`aws-actions/configure-aws-credentials`) statt langlebiger
  Access-Keys – so liegen **keine** Secrets im Repo.
- Eine **GitHub Environment**-Protection-Regel mit erforderlicher Freigabe (Approval).
- Erst dann `terraform apply` / `helm upgrade --install` / Image-Push in eine Registry.

So bleibt die hier eingebaute Linie erhalten: **CI prüft, Deploy passiert nur bewusst.**
