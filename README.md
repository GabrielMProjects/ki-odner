# LaraShop – End-to-End E-Commerce & DevOps Showcase

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows)
[![IaC](https://img.shields.io/badge/IaC-Terraform-7B42BC?logo=terraform&logoColor=white)](infra/terraform)
[![Kubernetes](https://img.shields.io/badge/Deploy-Helm_/_k3s-326CE5?logo=kubernetes&logoColor=white)](helm/angel-lara)

**LaraShop** ist ein End-to-End-Portfolioprojekt: ein entkoppeltes **Angular-18-Frontend** und ein
**Bagisto/Laravel-11-Backend**, das **live auf AWS** (EC2 · k3s · Helm) läuft – mit vollständiger
Observability (Prometheus, Grafana, Loki, Tempo, OpenTelemetry), echten Backend-/Worker-**Traces**
und -**Logs**, **Alertmanager**-Alerting und **KEDA**-Autoscaling; Container via Docker/ECR, CI mit
GitHub Actions, IaC mit Terraform/Ansible.

- **Live bewiesen:** EC2, k3s, Helm, Docker/ECR, CI, Observability, Logs, Traces, Alerting, Autoscaling.
- **Geplanter Ausbau (nicht live):** RDS, S3, CloudFront, ElastiCache (Terraform-Toggles vorbereitet).

## 🚀 Live-Demo (AWS · k3s · Helm)

Die Demo läuft auf **einer AWS-EC2-Instanz** (m7i-flex.large, free-tier-fähig) mit **k3s + Helm**
und dem vollständigen **Observability-Stack**. Stabile URLs über `nip.io` (kein LoadBalancer):

- **Shop:** http://app.18.157.163.103.nip.io/
- **Grafana:** http://grafana.18.157.163.103.nip.io/

> ⚠️ **Temporäre Demo.** Die Instanz wird bewusst nur zeitweise betrieben und kann abgeschaltet
> sein (Kosten/Teardown). Architektur, Beweise und Screenshots unten sind unabhängig davon gültig.

## Live-Demo-GIFs

### Shop-Demo

![Shop-Demo](docs/demo.gif)

### Grafana-/Observability-Demo

![Grafana-Demo](docs/demo-grafana.gif)

## 📋 Nachweise / Proofs

| Nachweis | Status | Umgebung |
|---|---|---|
| **App** (Angular SPA + Bagisto, 11 Demo-Produkte) | ✅ live | AWS · EC2 · k3s · Helm |
| **Distributed Tracing** (Backend+Worker → OTel → Tempo → Grafana) | ✅ live | AWS k3s |
| **Zentrale Logs** (Backend+Worker Laravel-Logs in Loki via Alloy) | ✅ live | AWS k3s |
| **Alerting** (PrometheusRule → Alertmanager empfängt Alert) | ✅ nachgewiesen | AWS k3s |
| **Autoscaling** (HPA CPU · KEDA Redis-Scaler · optional Prometheus-Scaler) | ✅ nachgewiesen | AWS k3s |
| **Frühere lokale Proofs** (kind / Compose) | 📄 dokumentiert | [k8s-proof](docs/k8s-proof.md) · [observability](docs/observability-k8s-proof.md) |
| **Architektur** | 📄 | [docs/architecture.md](docs/architecture.md) |

Eine ehrliche Gesamtübersicht steht in der **[Live-Status-Matrix](#live-status-matrix)** unten.
Detaillierte Beweis-/Screenshot-Liste: **[docs/PROOFS.md](docs/PROOFS.md)**.

## Live-Status-Matrix

| Komponente | Status | Umgebung / Hinweis |
|---|---|---|
| Angular 18 Frontend · Bagisto/Laravel 11 Backend · Docker | 🟢 live | AWS k3s; Backend als nginx+php-fpm-Split |
| k3s + Helm-Deployment | 🟢 live | EC2 (Ansible-provisioniert) |
| ECR (Container-Registry) | 🟢 live genutzt | Images dort, IAM-Pull |
| MySQL · Redis (in-cluster, PVC) | 🟢 live | persistent (local-path) |
| OpenTelemetry Traces (HTTP + Queue-Spans) | 🟢 live | manuelle OTel-SDK-Instrumentierung → Tempo |
| Loki Logs (Backend via Datei+tail, Worker via stderr) | 🟢 live | Grafana Alloy DaemonSet |
| Prometheus · Grafana · Alertmanager | 🟢 live | kube-prometheus-stack |
| HPA (CPU) | 🟢 live | Backend |
| KEDA Redis-Queue-Scaler | 🟢 live | Worker (normaler Steady-State-Scaler) |
| KEDA Prometheus-Scaler | 🟢 nachgewiesen | **optional** (Toggle), als Demo getestet: Worker 1→2→1 |
| Tempo-Persistenz | 🟢 PVC | dediziertes local-path PVC `tempo-data` (2Gi); Traces überleben `tempo-0`-Neustart (Demo: single-node local-path, kein Multi-AZ) |
| RDS · S3 · CloudFront · ElastiCache | 🔵 nicht live | nur `enable_*`-Toggles, **keine** Terraform-Module, **nicht** bewiesen |
| GitHub Actions CI | 🟢 | Lint/Build/Validate – **kein** Deploy/Push |

🟢 live/nachgewiesen · 🟡 vorhanden mit Einschränkung · 🔵 optionaler, nicht umgesetzter Ausbau

## Projektübersicht

**LaraShop** ist ein vollständiges E-Commerce-Projekt **plus** die komplette DevOps-Schicht
drumherum – in einem Monorepo. Es zeigt den Weg **von der laufenden Anwendung bis zum
reproduzierbaren Cloud-Deployment**:

- **App:** ein entkoppeltes **Angular-18-Frontend** (`angel/`), das ein **Bagisto/Laravel-Backend**
  (`lara/`) über dessen REST-API anspricht.
- **DevOps:** Docker, Terraform (AWS), Ansible (k3s), Helm, Observability-Stack und GitHub-Actions-CI.

Leitlinie überall: **sicher, kostenbewusst, reproduzierbar** – erst lokal lauffähig, Cloud nur bewusst.

---

## Architektur

```
                 User
                  │
        CloudFront (optional, CDN)
                  │
          Traefik Ingress (k3s)
                  │
        ┌─────────┴─────────┐
        │                   │
  Angular Frontend ──────►  Laravel/Bagisto Backend
   (Nginx, SPA)        REST   (PHP-FPM)
                              │
                       ┌──────┴──────┐
                     MySQL          Redis
                  (Daten)      (Cache/Queue)
```

**Telemetrie / Observability:**

```
   App / Services
        │  (OTLP)
 OpenTelemetry Collector
        │
   ┌────┼─────┐
Prometheus  Loki  Tempo
 (Metrics) (Logs)(Traces)
   └────┬─────┘
      Grafana   ◄── Alertmanager (Alarme)
   (Dashboards)
```

Eine ausführlichere Variante mit Erläuterungen: **[docs/architecture.md](docs/architecture.md)**.

---

## Tech Stack

| Technologie | Rolle im Projekt |
|---|---|
| **Angular 18** | Frontend (SPA, NgRx, Angular Material) |
| **Laravel 11** | Backend-Framework |
| **Bagisto** | E-Commerce-Plattform (auf Laravel) |
| **Docker** | Containerisierung von Frontend & Backend |
| **Docker Compose** | lokaler Multi-Service-Stack (App + Observability) |
| **Terraform** | Infrastructure as Code (AWS) |
| **AWS** | EC2 + ECR **live** genutzt; RDS/S3/CloudFront nur als Toggles vorbereitet (nicht live) |
| **Ansible** | Server-Provisioning (k3s, Docker, Helm) |
| **k3s** | leichtgewichtiges Kubernetes |
| **Helm** | Kubernetes-Paketierung/-Deployment |
| **GitHub Actions** | CI (Lint, Build, Validate) |
| **Prometheus** | Metriken |
| **Grafana** | Dashboards/Visualisierung |
| **Loki** | Log-Aggregation |
| **Tempo** | Distributed Tracing |
| **OpenTelemetry** | zentraler Telemetrie-Eingang (OTLP) |
| **Alertmanager** | Alarm-Routing |
| **KEDA** | ereignisbasiertes Autoscaling (Redis-Queue-Scaler; optionaler Prometheus-Scaler) |

---

## DevOps Features

- 🐳 **Containerisierung** beider Apps (Multi-Stage-Dockerfiles, schlanke Runtime-Images).
- 🧩 **Lokaler Stack** via Docker Compose: Frontend, Backend, MySQL, Redis.
- 🏗️ **Terraform-Module**: Netzwerk (VPC/Subnetze/Routing) und Compute (EC2 für k3s) –
  modular, getoggelt, kostenkontrolliert.
- 🔧 **Ansible-Rollen**: `common`, `docker`, `k3s`, `helm`, `security` (UFW).
- ☸️ **Helm-Chart** für k3s: Frontend, Backend, Worker, Scheduler (CronJob), Migration-Job
  (Helm-Hook), Ingress, HPA, KEDA, ConfigMap/Secret.
- 📈 **Observability-Stack**: Prometheus, Grafana, Loki, Tempo, OpenTelemetry Collector, Alertmanager.
- 🤖 **CI** (GitHub Actions): Angular-Build, Laravel-Checks, `terraform validate`, `helm lint`,
  `docker build` – **ohne** Deploy/Push.
- 🛟 **Helfer-Skripte**: `setup-local`, `deploy`, `destroy`, `health-check` – mit Sicherheitsschranken.

---

## Projektstruktur

```
ki-odner/
├── angel/             # Angular-18-Frontend (Storefront "LaraShop")
├── lara/              # Bagisto/Laravel-Backend (REST-API + Admin)
├── infra/terraform/   # Infrastructure as Code (AWS) + Module (network, compute)
├── ansible/           # Provisioning zu einem k3s-Node (Rollen + Playbooks)
├── helm/angel-lara/   # Helm-Chart für das Kubernetes-Deployment
├── observability/     # Prometheus, Grafana, Loki, Tempo, OTel, Alertmanager (Compose)
├── scripts/           # setup-local / deploy / destroy / health-check
├── .github/workflows/ # CI-Pipelines (ci, terraform, docker)
└── docs/              # Architektur, Docker- & Deployment-Doku, Screenshots
```

---

## Quickstart (lokal)

> Voraussetzungen: Docker + Docker Compose. Für die App-Entwicklung zusätzlich Node 20 & PHP 8.2.

**Windows (PowerShell):**
```powershell
scripts/setup-local.ps1 -Build -Observability
```

**Linux / macOS / Git Bash:**
```bash
BUILD=true OBSERVABILITY=true ./scripts/setup-local.sh
```

**Health-Check:**
```bash
./scripts/health-check.sh
```

**Stoppen / Aufräumen:**
```bash
./scripts/destroy.sh
```

Erreichbar: Frontend `:8080`, Backend `:8000`, Grafana `:3000`, Prometheus `:9090`.
Details zum Container-Setup: **[docs/docker.md](docs/docker.md)**.

<details>
<summary>App direkt (ohne Docker) starten</summary>

**Backend (`lara/`):**
```bash
cd lara
composer install
cp .env.example .env        # DB-Zugang eintragen (DB_HOST/DB_DATABASE/DB_USERNAME/DB_PASSWORD)
php artisan key:generate
php artisan bagisto:install  # bei Beispielprodukten 'true' wählen → gefüllter Demo-Shop
npm install && npm run build
php artisan serve            # http://localhost:8000  (Admin: /admin)
```

**Frontend (`angel/`):**
```bash
cd angel
npm install --legacy-peer-deps   # NgRx ^21 vs. Angular 18 -> legacy peer deps
npm start                        # http://localhost:4200
```

**Demo-Daten nachträglich seeden:**
```bash
cd lara
php artisan tinker --execute="app(\Webkul\Installer\Helpers\DatabaseManager::class)->seedSampleProducts(['default_locale'=>'en','allowed_locales'=>['en'],'default_currency'=>'USD','allowed_currencies'=>['USD']]);"
php artisan indexer:index --mode=full
```
</details>

---

## Screenshots

| Startseite | Produktübersicht | Produktdetail |
|---|---|---|
| ![Home](docs/01-home.png) | ![Products](docs/02-products.png) | ![Detail](docs/03-product-detail.png) |

---

## CI/CD

GitHub Actions unter `.github/workflows/` (Details: **[.github/workflows/README.md](.github/workflows/README.md)**):

- **`ci.yml`** – Angular (`npm ci`/`build`), Laravel (`composer install`, `php -l`, `artisan --version`), Helm (`lint` + `template`).
- **`terraform.yml`** – `fmt -check`, `init -backend=false`, `validate` (nur bei `infra/terraform/**`).
- **`docker.yml`** – `docker build` für beide Images (**`push: false`**).

**Bewusst:** CI **prüft nur** – kein Deploy, kein `terraform apply`, kein `docker push`, keine Secrets
(`permissions: contents: read`). Ein echter Deploy-Workflow wäre separat, manuell (`workflow_dispatch`)
und mit AWS-**OIDC** statt langlebiger Keys.

---

## Observability

**Live auf AWS k3s** (Helm: kube-prometheus-stack, Loki, Tempo, OTel Collector, Grafana Alloy):

- **OpenTelemetry Collector** – OTLP-Eingang (4317/4318) → Tempo (Traces), Loki (Logs), Prometheus (Metriken).
- **Traces:** Die App ist **manuell mit dem OpenTelemetry-PHP-SDK** instrumentiert –
  **HTTP-Server-Spans** (Backend) und **Queue-Consumer-Spans** (Worker), sichtbar in **Tempo/Grafana**
  als `service.name = angel-lara-backend` / `angel-lara-worker`.
- **Logs:** **Grafana Alloy** (DaemonSet) sammelt Pod-Logs → **Loki**. Echte Laravel-`production.*`-Logs
  von **Backend** (`container=php-fpm`, via Datei + `tail`) **und Worker** (`container=worker`, via stderr).
- **Alerting:** eigene **PrometheusRule** (`AngelLaraBackendUnavailable`) + nachgewiesener
  **Alertmanager-Empfang** eines Test-Alerts (API-Beweis, ohne externen Dienst).
- **Autoscaling:** **HPA** (Backend-CPU), **KEDA** Redis-Queue-Scaler (Worker, normaler Scaler) +
  optionaler **Prometheus-Scaler** (als Demo nachgewiesen: 1→2→1).
- **Tempo** persistiert Traces auf einem **dedizierten local-path PVC** (`tempo-data`, 2Gi, RWO)
  unter `/var/tempo` – Traces **überleben einen `tempo-0`-Pod-Neustart** (per Delete-Test verifiziert).
  Für die Demo bewusst single-node/local-path (kein Multi-AZ/Production-Storage).

Der **lokale** Compose-Stack (`observability/`) bleibt für die kostenfreie lokale Reproduktion erhalten.

---

## Infrastruktur

- **Terraform** (`infra/terraform/`) – Provider/Variablen/Outputs + drei Module:
  - **network** – VPC, je 2 öffentliche/private Subnetze, IGW, Route Tables, optionales NAT Gateway.
  - **compute** – **EC2** (Ubuntu; Demo: `m7i-flex.large`, free-tier-fähig) + Security Group (SSH/HTTP/HTTPS, k8s-API 6443
    nicht öffentlich) + Key Pair – **nur** bei `enable_compute=true`.
  - **ecr** – Container-Registry (backend/frontend) – **nur** bei `enable_ecr=true`.
- **Ansible** (`ansible/`) – provisioniert die EC2 zu einem **k3s-Node** (Docker, k3s, Helm, UFW).
- **Helm** (`helm/angel-lara/`) – deployt die Container-Images auf k3s (inkl. Worker/Scheduler/Ingress/HPA/KEDA).
- **AWS-Deployment** Schritt für Schritt: **[DEPLOYMENT.md](DEPLOYMENT.md)** (mit Kosten-/Free-Tier-Hinweisen).
- **Geplanter AWS-Ausbau** (RDS/S3/CloudFront/ElastiCache – Toggles vorbereitet, **nicht** live):
  **[docs/aws-expansion.md](docs/aws-expansion.md)**.

---

## Sicherheit

- 🔒 **Keine Secrets im Repository** – `.env`, Keys, `*.tfvars`, `inventory.ini` sind gitignored;
  Helm-Secret/ConfigMap enthalten nur Platzhalter, kein echter `APP_KEY`.
- 💶 **Terraform kostenkontrolliert** – alle kostenträchtigen Toggles (`enable_compute`, `enable_rds`,
  `enable_nat_gateway`, …) standardmäßig `false`; nur kleine Instanzen.
- 🚦 **Deployments nur mit expliziter Bestätigung** – `deploy.sh` deployt erst bei `CONFIRM_DEPLOY=yes`;
  CI deployt nie automatisch.
- 🛑 **Destroy-Schutz** – `destroy.sh` macht standardmäßig nur lokalen Cleanup; `terraform destroy`
  erfordert `CONFIRM_TERRAFORM_DESTROY=yes` **und** ein zusätzlich eingetipptes `DESTROY`.
- 🌐 **Netzwerk** – private Subnetze ohne öffentliche IP; Kubernetes-API (6443) nicht öffentlich.

---

## Bewerbungsrelevante Skills

| Skill | Im Projekt nachweisbar durch |
|---|---|
| **Docker** | Multi-Stage-Dockerfiles (Angular/Nginx, PHP-FPM/Nginx), Compose-Stack |
| **Kubernetes** | k3s-Zielplattform, Deployments/Services/CronJob/Ingress |
| **Helm** | vollständiges Chart mit Hooks, HPA, KEDA, ConfigMap/Secret |
| **Terraform** | modulare IaC (network/compute), Toggles, `fmt/validate` in CI |
| **AWS** | EC2/VPC/ECR live (k3s-Demo); RDS/S3/CloudFront als Toggles vorbereitet (Module ausstehend) |
| **Ansible** | Rollenbasiertes Provisioning eines k3s-Nodes |
| **GitHub Actions** | CI für App, IaC, Container, Helm |
| **Observability** | OTel-Tracing (Backend+Worker), Loki-Logs, Alertmanager-Alert, KEDA-Scaler – **live** nachgewiesen |
| **CI/CD** | automatisierte Qualitätsprüfung, sichere Deploy-Strategie |
| **Infrastructure as Code** | gesamte Infra versioniert, reproduzierbar, reviewbar |

---

## Bekannte Hinweise

- **NgRx-Versionen:** `@ngrx/*` sind in `angel/package.json` auf `^21` gepinnt, das Projekt läuft auf
  Angular 18 → Install mit `--legacy-peer-deps`. Sauber: NgRx auf 18.x angleichen.
- **Produktbilder:** Uploads liegen in `lara/storage/app/public/` und sind (Laravel-üblich) nicht im
  Repo. Frische Installation zeigt Platzhalter, bis Beispielprodukte geseedet werden.
- **`.env` / Build-Artefakte:** `.env` und `lara/public/build/*` sind gitignored und gehören nicht ins Repo.
- **Tempo-Persistenz:** Tempo nutzt ein dediziertes **local-path PVC** (`tempo-data`, 2Gi) unter
  `/var/tempo`; Traces überleben einen `tempo-0`-Neustart. Bewusst single-node/local-path (Demo) –
  kein Multi-AZ/Production-Grade-Storage.
- **Backend-App-Logs:** Laravel/php-fpm loggt in eine Datei, ein `tail` im php-fpm-Container leitet sie
  nach stdout → Loki (FPM `catch_workers_output` reicht `php://stderr` in diesem Image nicht durch).
  Der **Worker** loggt direkt via `stderr`.
- **AWS-Ausbau:** `enable_rds`/`enable_s3`/`enable_cloudfront`/`enable_elasticache` existieren als
  Toggles, die zugehörigen Terraform-Module sind aber **noch nicht implementiert** (bewusst, Kosten).

---

> Hinweis: Dies ist ein **Demo-/Portfolioprojekt**. Es ist für die **lokale Ausführung** und eine
> **kurze, bewusste** AWS-Demo gedacht – nicht als dauerhaft öffentlich betriebener Produktionsshop.
