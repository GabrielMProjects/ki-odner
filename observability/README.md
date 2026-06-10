# observability

Lokaler Observability-Stack (Demo) für **Metriken, Logs und Traces** – komplett lokal,
**ohne Cloud** und **ohne echte Secrets**.

## Bestandteile & Zweck

| Tool | Zweck | Port |
|---|---|---|
| **Prometheus** | sammelt & speichert **Metriken**, wertet Alert-Regeln aus | 9090 |
| **Grafana** | **Dashboards** & Visualisierung (Metrics/Logs/Traces) | 3000 |
| **Loki** | zentrale **Logs** (wie „Prometheus für Logs") | 3100 |
| **Tempo** | verteilte **Traces** | 3200 |
| **OpenTelemetry Collector** | zentraler **Telemetrie-Eingang** (OTLP) → verteilt an Tempo/Prometheus/Loki | 4317 (gRPC), 4318 (HTTP) |
| **Alertmanager** | **Alarme** routen/gruppieren (hier Demo, ohne echtes Ziel) | 9093 |

Datenfluss: App → **OTLP** an den Collector (4317/4318) → Traces zu **Tempo**, Metriken via
**Prometheus**-Scrape, Logs zu **Loki**; alles sichtbar in **Grafana**.

## Starten / Stoppen (lokal)

```bash
# Starten
docker compose -f observability/docker-compose.observability.yml up -d

# Logs ansehen
docker compose -f observability/docker-compose.observability.yml logs -f

# Stoppen (Container entfernen)
docker compose -f observability/docker-compose.observability.yml down

# Inkl. Daten-Volumes entfernen
docker compose -f observability/docker-compose.observability.yml down -v
```

Danach:
- **Grafana:** http://localhost:3000 — Datasources (Prometheus/Loki/Tempo) und Dashboards
  („Application Overview", „Infrastructure Overview") sind automatisch provisioniert.
- **Prometheus:** http://localhost:9090 · **Alertmanager:** http://localhost:9093

## 🔐 Zugang / Secrets

- **Grafana-Demo-Login:** `admin` / `admin` — **nur als lokaler Demo-Hinweis**.
- **Niemals echte Passwörter/Secrets committen.** Für mehr als eine Demo das Admin-Passwort
  über eine lokale `.env`/Umgebungsvariable setzen (z. B. `GF_SECURITY_ADMIN_PASSWORD`).
- Alertmanager nutzt **keine** echten Webhooks (Beispiel ist auskommentiert).

## Später: Anbindung an Laravel & Kubernetes

- **Laravel/Bagisto:** App-Telemetrie per **OTLP** an den Collector schicken
  (`OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`), bzw. Prometheus-Metriken unter
  `/metrics` bereitstellen und in `prometheus/prometheus.yml` den (auskommentierten)
  `laravel-backend`-Job aktivieren.
- **Kubernetes/k3s:** denselben Stack via Helm/Manifeste im Cluster betreiben; der
  OTel-Collector bündelt die Telemetrie aller Pods. Das **KEDA ScaledObject**
  (`helm/angel-lara`) kann dann gegen **Prometheus** skalieren.

## Hinweis

Reine Vorbereitung – es wird hier **nichts gestartet**. Erst `docker compose ... up -d`
startet den Stack bewusst lokal.
