# helm/angel-lara

Helm-Chart, das **Frontend** (Angular), **Backend** (Bagisto/Laravel), **Queue Worker**,
**Scheduler** (CronJob), einen optionalen **Migration-Job** (Helm-Hook), **Services**, **Ingress**,
**HPA** und ein **KEDA ScaledObject** auf k3s deployen kann.

> **Stand:** reine Chart-Dateien. Es wird **nichts** deployt und **kein Cluster** verändert.

## Inhalt

| Datei | Zweck |
|---|---|
| `Chart.yaml` | Chart-Metadaten (Name, Version). |
| `values.yaml` | Alle Standardwerte (Images, Resources, Replicas, Ingress, Autoscaling, KEDA, Migrations, Secrets). |
| `templates/_helpers.tpl` | Namens-/Label-Helfer + gemeinsames `envFrom`. |
| `templates/frontend-deployment.yaml` / `frontend-service.yaml` | Angular/Nginx, Service **Port 80**. |
| `templates/backend-deployment.yaml` / `backend-service.yaml` | Laravel/Bagisto, Service **Port 8000**, ENV aus ConfigMap + Secret. |
| `templates/worker-deployment.yaml` | Queue Worker (`php artisan queue:work`). |
| `templates/scheduler-cronjob.yaml` | CronJob (`php artisan schedule:run`). |
| `templates/migration-job.yaml` | Job mit Hook `pre-install,pre-upgrade` (`php artisan migrate --force`). |
| `templates/ingress.yaml` | Ingress (Traefik), Host/TLS/cert-manager optional. |
| `templates/configmap.yaml` / `secret.yaml` | Nicht-sensible bzw. sensible Werte. |
| `templates/hpa.yaml` | HorizontalPodAutoscaler (CPU). |
| `templates/keda-scaledobject.yaml` | KEDA ScaledObject (Redis-Queue-Scaler) + optional TriggerAuthentication. |

## Lokale Prüfung (kein Deploy)

```bash
helm lint helm/angel-lara
helm template angel-lara helm/angel-lara
```

`helm template` rendert die Manifeste **lokal** – ohne Cluster-Zugriff.

## Installieren / Upgraden (später, bewusst)

```bash
# Images vorher bauen/pushen (siehe docs/docker.md), dann z. B.:
helm upgrade --install angel-lara helm/angel-lara \
  --namespace angel-lara --create-namespace
```

## Werte überschreiben

```bash
# einzeln per --set
helm upgrade --install angel-lara helm/angel-lara \
  --set backend.image.tag=v1.2.3 \
  --set ingress.enabled=true \
  --set ingress.host=shop.example.com

# oder eine eigene Wertedatei
helm upgrade --install angel-lara helm/angel-lara -f my-values.yaml
```

## Wichtige Defaults / Toggles

| Wert | Default | Bedeutung |
|---|---|---|
| `migrations.enabled` | **`false`** | Migration-Job (Hook) läuft **nur**, wenn bewusst aktiviert. |
| `worker.enabled` | `true` | Queue Worker. |
| `scheduler.enabled` | `true` | CronJob; Default `*/5 * * * *` (Laravel-üblich: `* * * * *`). |
| `ingress.enabled` | `false` | Ingress (Traefik) aus. |
| `autoscaling.enabled` | `false` | HPA (Backend, CPU) aus. **Braucht `metrics-server`** im Cluster. |
| `keda.enabled` | `false` | KEDA ScaledObject (Worker, Redis-Queue-Scaler) aus. **Braucht KEDA-Operator.** |

## Autoscaling – Voraussetzungen

- **HPA (Backend, CPU):** benötigt einen laufenden **metrics-server**.
  - **k3s** bringt `metrics-server` standardmäßig mit.
  - **kind**: manuell installieren und Kubelet-TLS lockern:
    ```bash
    kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
    kubectl -n kube-system patch deploy metrics-server --type=json \
      -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
    ```
  - Ohne `metrics-server` bleibt die HPA bei `<unknown>` und skaliert nicht.
- **KEDA (Worker, Redis-Queue):** benötigt den **KEDA-Operator** (`helm install keda kedacore/keda -n keda`).
  Der Scaler liest die **Redis-List-Länge** der Laravel-Queue (`keda.redis.listName`).
  ⚠️ **Beim Deploy prüfen**, dass `listName` dem echten Redis-Key entspricht (Laravel präfixt Queue-Keys oft, z. B. `…_database_queues:default`): `redis-cli KEYS '*queues*'`.

## 🔐 Secrets

- **`templates/secret.yaml` enthält nur Platzhalter** (`change-me`, leere `APP_KEY`).
- **Niemals echte Secrets committen.** Echte Werte zur Laufzeit liefern, z. B.:
  ```bash
  helm upgrade --install angel-lara helm/angel-lara \
    --set-file secrets.APP_KEY=./app_key.txt
  ```
  Besser noch: **Sealed Secrets** / **External Secrets** / vom Cluster verwaltete Secrets.
- `DB`/`Redis`/`S3`-Variablen sind vorbereitet → später auch **externes RDS/Redis/S3** möglich.
