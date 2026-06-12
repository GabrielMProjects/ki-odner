# Observability in Kubernetes (lokale Demo)

Deployt **Prometheus, Grafana, Alertmanager, Loki, Tempo und den OpenTelemetry Collector**
per Helm in den Namespace `observability` – rein **lokal** (kind/k3s), **keine Cloud, keine Kosten**.

Schlank konfiguriert: **keine Persistence** (emptyDir), kurze Retention, kleine Requests.
Tempo und OTel-Collector sind auf getestete, lokal gecachte Versionen **gepinnt**.

## Helm-Repos

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo update
```

## Installation (Namespace `observability`)

```bash
kubectl create namespace observability

# 1) kube-prometheus-stack (Prometheus + Grafana + Alertmanager + kube-state-metrics + node-exporter)
#    Grafana-Admin-Passwort zur LAUFZEIT setzen (NICHT committen):
helm install kps prometheus-community/kube-prometheus-stack -n observability \
  -f kube-prometheus-stack-values.yaml \
  --set grafana.adminPassword='<DEMO-PASSWORT>'

# 2) Loki
helm install loki grafana/loki -n observability -f loki-values.yaml

# 3) Tempo
helm install tempo grafana/tempo -n observability -f tempo-values.yaml

# 4) OpenTelemetry Collector
#    Chart-Version 0.85.0 == App-Version 0.96.0 (gepinnte, gecachte Binary).
#    Wichtig: neuere Charts injizieren das neue 'service.telemetry.metrics.readers'-
#    Schema, das die 0.96.0-Binary nicht kennt -> Chart-Version passend pinnen.
helm install otel-collector open-telemetry/opentelemetry-collector --version 0.85.0 \
  -n observability -f otel-collector-values.yaml
```

## Grafana-Datasources (automatisch provisioniert)

| Datasource | URL (in-cluster) |
|---|---|
| Prometheus | von kube-prometheus-stack automatisch (Default) |
| Loki | `http://loki.observability.svc.cluster.local:3100` |
| Tempo | `http://tempo.observability.svc.cluster.local:3200` |

## Nachweise

```bash
kubectl get pods -n observability
helm list -n observability

# Port-Forwards
kubectl -n observability port-forward svc/kps-grafana 3000:80        # Grafana (admin / <DEMO-PASSWORT>)
kubectl -n observability port-forward svc/kps-kube-prometheus-prometheus 9090:9090  # Prometheus
kubectl -n observability port-forward svc/loki 3100:3100             # Loki  -> /ready
kubectl -n observability port-forward svc/tempo 3200:3200            # Tempo -> /ready
```

OTLP-Eingang des Collectors: gRPC `:4317`, HTTP `:4318` (Service `otel-collector-opentelemetry-collector`).

## Hinweise / Bekannte Einschränkungen

- **Lokal, keine Cloud-Kosten.** Alles emptyDir → Daten sind nach Pod-Neustart weg (Wegwerf-Demo).
- **Versions-Pinning:** Tempo `2.3.1`, OTel-Collector contrib `0.96.0` (Lehre aus dem Compose-Proof: `:latest` driftet im Config-Schema).
- **Speicher:** Stack braucht ~2–2,5 GiB RAM (Requests) + ~1,5–2 GB Image-/Datendisk. Lokal vorher genug Platz schaffen.
- App-Telemetrie (Traces/Metriken aus Angular/Laravel) ist optional und Teil eines späteren Schrittes (App-Instrumentierung).
