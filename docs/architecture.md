# Architektur

Dieses Dokument beschreibt die Architektur von **LaraShop** ausführlicher als die README –
sowohl die **Anwendung** als auch die **Infrastruktur-/Observability-Schicht**.

---

## 1. Gesamtüberblick (Request-Pfad)

```
                                   ┌────────────┐
                                   │    User    │
                                   └─────┬──────┘
                                         │  HTTPS
                          ┌──────────────▼──────────────┐
                          │   CloudFront (optional CDN)  │   enable_cloudfront = false (Default)
                          └──────────────┬──────────────┘
                                         │
                          ┌──────────────▼──────────────┐
                          │     Traefik Ingress (k3s)    │   ingress.enabled (Helm)
                          └───────┬──────────────┬───────┘
                          /  (UI) │              │ /api, /admin
                     ┌────────────▼───┐   ┌──────▼─────────────────┐
                     │ Angular        │   │ Laravel / Bagisto       │
                     │ Frontend       │──►│ Backend (PHP-FPM)       │
                     │ (Nginx, SPA)   │API│  + Queue Worker         │
                     └────────────────┘   │  + Scheduler (CronJob)  │
                                          └───────┬─────────┬───────┘
                                                  │         │
                                          ┌───────▼──┐  ┌───▼────────┐
                                          │  MySQL   │  │   Redis    │
                                          │ (Daten)  │  │ Cache/Queue│
                                          └──────────┘  └────────────┘
```

**Erläuterung**

- **User → (CloudFront) → Ingress:** In der Cloud-Ausbaustufe kann ein CDN (CloudFront) vorgelagert
  werden; standardmäßig **aus**. Der **Traefik-Ingress** von k3s routet anhand des Pfads.
- **Angular Frontend:** statischer SPA-Build, von Nginx ausgeliefert (SPA-Fallback auf `index.html`).
  Spricht das Backend ausschließlich über dessen **REST-API** an.
- **Laravel/Bagisto Backend:** PHP-FPM hinter Nginx. Zusätzlich laufen als eigene Workloads ein
  **Queue Worker** (`queue:work`) und ein **Scheduler** (`schedule:run` als CronJob).
- **MySQL/Redis:** persistente Daten bzw. Cache/Queue. In der Cloud optional als **RDS**/externes Redis.

---

## 2. Telemetrie / Observability

```
   Angular / Laravel / Worker / Scheduler
                  │  OTLP (gRPC 4317 / HTTP 4318)
       ┌──────────▼───────────┐
       │ OpenTelemetry Collector
       └───┬─────────┬─────────┬───┘
   traces │  metrics │    logs │
   ┌──────▼───┐ ┌────▼─────┐ ┌─▼──────┐
   │  Tempo   │ │Prometheus│ │  Loki  │
   └──────┬───┘ └────┬─────┘ └───┬────┘
          └──────────┼───────────┘
                ┌────▼────┐        ┌──────────────┐
                │ Grafana │        │ Alertmanager │ ◄── Alerts aus Prometheus-Rules
                └─────────┘        └──────────────┘
```

**Erläuterung**

- **OpenTelemetry Collector:** ein zentraler Eingang für alle Telemetrie (OTLP). Trennt die App von
  konkreten Backends und verteilt: **Traces → Tempo**, **Metriken → Prometheus**, **Logs → Loki**.
- **Prometheus:** sammelt Metriken (Pull/Scrape) und wertet **Alert-Regeln** aus
  (`observability/prometheus/alerts.yml`).
- **Loki / Tempo:** „Prometheus für Logs" bzw. Distributed Tracing.
- **Grafana:** vereint Metriken, Logs und Traces in Dashboards (Datasources auto-provisioniert).
- **Alertmanager:** routet/gruppiert Alarme (in der Demo ohne echtes Ziel/Secret).
- **KEDA:** kann den **Queue Worker** anhand einer Prometheus-Query (z. B. Queue-Länge) skalieren.

---

## 3. Infrastruktur (AWS, via Terraform)

```
AWS-Region (eu-central-1)
└── VPC  10.20.0.0/16  (enable_dns_support/hostnames)
    ├── Public Subnets  (2 AZs)  ── map_public_ip_on_launch = true
    │     ├── Internet Gateway + Public Route Table (0.0.0.0/0 → IGW)
    │     └── EC2 (t3.micro)  ── k3s-Node  [enable_compute]
    │           └── Security Group: 22 (SSH, eingeschränkt), 80, 443, 6443 (nur intern)
    ├── Private Subnets (2 AZs)  ── keine öffentliche IP
    │     └── Private Route Table  (0.0.0.0/0 → NAT)  [enable_nat_gateway, Default aus]
    └── (optional) NAT Gateway / RDS / ElastiCache / ALB / CloudFront  ── alle Default AUS
```

**Provisioning-Kette**

1. **Terraform** legt Netzwerk + EC2 an (`terraform apply`, bewusst).
2. **Ansible** richtet die EC2 ein: `common` → `security` (UFW) → `docker` → `k3s` → `helm`.
3. **Helm** deployt die App auf den k3s-Node.
4. **CI** (GitHub Actions) prüft App, IaC, Container und Chart bei jedem Push/PR.

---

## 4. Designprinzipien

- **Trennung von App und Infra:** App-Code (`angel/`, `lara/`) unverändert; Infra als eigene Schicht.
- **Toggles & Kostenkontrolle:** teure AWS-Ressourcen standardmäßig deaktiviert.
- **Reproduzierbar:** alles als Code (Docker, Terraform, Ansible, Helm) – kein „Klick-Ops".
- **Sicher per Default:** keine Secrets im Repo; Deploy/Destroy nur mit expliziter Bestätigung;
  k8s-API nicht öffentlich.
- **Beobachtbar:** Metriken, Logs und Traces über einen einheitlichen OTLP-Eingang.

---

## 5. Datenfluss (kurz)

| Von | Nach | Protokoll/Weg |
|---|---|---|
| Browser | Angular (Nginx) | HTTPS |
| Angular | Backend `/api` | REST/HTTP |
| Backend | MySQL | SQL (PDO) |
| Backend | Redis | Cache/Queue |
| App/Workloads | OTel Collector | OTLP (4317/4318) |
| OTel Collector | Tempo/Prometheus/Loki | OTLP / Scrape / push |
| Prometheus | Alertmanager | Alerts |
| KEDA | (Worker) | Skalierung anhand Prometheus-Query |
