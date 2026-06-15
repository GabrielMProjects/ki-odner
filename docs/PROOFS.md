# Beweise / Proofs – Live-Stand (AWS k3s)

Nachweise der live laufenden Komponenten. Verlinkte Bilder liegen in `docs/`.
⬜ = Screenshot noch zu erstellen (der Roh-/CLI-Beweis ist jeweils genannt).

| # | Beweis | Status | Evidenz |
|---|---|---|---|
| 1 | App live (Storefront) | ✅ | `01-home.png`, `02-products.png`, `03-product-detail.png`, `demo.gif` |
| 2 | GitHub Actions „CI" grün | ⬜ | GitHub → Actions → CI (Commit `efff834`) |
| 3 | Grafana-Datasources (Tempo/Loki/Prometheus) | ✅ | `observability-k8s-grafana-datasources.png` |
| 4 | Tempo – Trace sichtbar | ✅ Smoke / ⬜ Backend+Worker | `observability-k8s-tempo.png` (Backend/Worker-Trace ⬜) |
| 5 | Loki – Logs sichtbar | ✅ / ⬜ Backend+Worker-Filter | `observability-k8s-loki.png` |
| 6 | Prometheus-Targets up | ✅ | `observability-k8s-prometheus-targets.png` |
| 7 | Alertmanager Demo-Alert empfangen | ⬜ | CLI-Beweis erbracht (PrometheusRule + `/api/v2/alerts`) |
| 8 | KEDA Worker 1→2→1 | ⬜ | CLI-Beweis erbracht (HPA/ScaledObject-Events) |
| 9 | Tempo-Persistenz (PVC) | ⬜ | CLI-Beweis: Trace überlebt `tempo-0`-Delete |

## Noch zu erstellende Screenshots (Vorschlag)
- **CI grün:** GitHub-Actions-„CI"-Run zu `efff834` (Job-Übersicht grün).
- **Tempo Backend+Worker:** Grafana → Explore → Tempo, Suche `service.name=angel-lara-backend` und `…-worker`.
- **Loki Backend+Worker:** Grafana → Explore → Loki, `{namespace="angel-lara", container="php-fpm"}` bzw. `{container="worker"}`.
- **Alertmanager:** Alertmanager-UI `/#/alerts` mit dem Demo-Alert (oder Grafana Alerting).
- **KEDA:** `kubectl get hpa` + Events während Worker 1→2→1.
- **Tempo-PVC:** `kubectl get pvc tempo-data` (Bound) + Trace nach `tempo-0`-Delete.

> Große Demo-Artefakte (`k8s-observability-demo.gif/.webm`, `observability-k8s-demo-tempo.png`)
> sind **bewusst gitignored** und gehören **nicht** ins Repo (Größe). Schlanke, aussagekräftige
> PNGs bevorzugen.
