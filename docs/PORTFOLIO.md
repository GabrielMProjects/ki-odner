# Portfolio-/Bewerbungstexte – LaraShop

Wiederverwendbare Texte für README, Bewerbung, LinkedIn und Vorstellungsgespräch.
**Ehrlich gehalten:** live Bewiesenes ist klar von geplantem Ausbau getrennt.

## README-Kurzbeschreibung (2–3 Sätze)
**LaraShop** ist ein End-to-End-Portfolioprojekt: ein entkoppeltes **Angular-18-Frontend** und ein
**Bagisto/Laravel-11-Backend**, das **live auf AWS** (EC2 · k3s · Helm) läuft – mit vollständiger
Observability (Prometheus, Grafana, Loki, Tempo, OpenTelemetry), echten Backend-/Worker-**Traces**
und -**Logs**, **Alertmanager**-Alerting und **KEDA**-Autoscaling. Container via Docker/ECR, CI mit
GitHub Actions, Infrastruktur als Code mit Terraform/Ansible. Managed-Service-Ausbau (RDS, S3,
CloudFront, ElastiCache) ist als Toggle **vorbereitet, aber bewusst nicht live**.

## Bewerbung / LinkedIn (kurzer Absatz)
In meinem Portfolio-Projekt **LaraShop** habe ich eine vollständige E-Commerce-App (Angular 18 +
Laravel/Bagisto) nicht nur gebaut, sondern **live auf AWS in Kubernetes (k3s) mit Helm** betrieben –
mit produktionsnaher Observability: verteilte Traces (OpenTelemetry → Tempo), zentrale Logs (Loki),
Metriken & Alerting (Prometheus/Alertmanager) und ereignisbasiertes Autoscaling (KEDA). CI über
GitHub Actions, Infrastruktur als Code mit Terraform und Ansible. Mir war wichtig, **nachweisbar
funktionierende** Bausteine zu zeigen – inklusive ehrlicher Abgrenzung, was live bewiesen ist und
was als Ausbau geplant ist.

## 30-Sekunden-Erklärung (Interview)
„LaraShop ist ein E-Commerce-Shop – Angular-Frontend, Laravel/Bagisto-Backend –, den ich komplett
selbst auf AWS in einem Kubernetes-Cluster (k3s) mit Helm deployt habe. Das Besondere ist die
DevOps-Tiefe: Images in ECR, CI mit GitHub Actions und ein voller Observability-Stack. Ich kann für
jede Anfrage den Trace in Grafana/Tempo zeigen, die Logs in Loki, Alerts über Alertmanager – und der
Worker skaliert automatisch per KEDA. Managed Services wie RDS oder S3 sind vorbereitet, aber bewusst
nicht live, um die Demo kostenarm zu halten."

## 2-Minuten-Erklärung (technisch)
Architektur: Ein Angular-18-SPA spricht per REST ein Bagisto/Laravel-11-Backend an; MySQL und Redis
laufen in-cluster mit PVCs. Deployment: Eine EC2 wird per **Ansible** zu einem **k3s**-Node
provisioniert, die App per **Helm** ausgerollt – Backend als nginx+php-fpm-Split, dazu Queue-Worker,
Scheduler-CronJob, Ingress über nip.io und CPU-HPA.

Observability ist der Kern: Das Backend ist **manuell mit dem OpenTelemetry-PHP-SDK** instrumentiert
– HTTP-Server-Spans und Queue-Consumer-Spans gehen über den OTel-Collector nach **Tempo** und sind in
Grafana als `angel-lara-backend` bzw. `-worker` sichtbar. **Grafana Alloy** sammelt die Pod-Logs nach
**Loki** – Backend-Laravel-Logs (Datei + tail) und Worker-Logs (stderr). Metriken über
kube-prometheus-stack; eine eigene PrometheusRule löst einen Alert aus, dessen Empfang ich im
**Alertmanager** nachgewiesen habe. Der **KEDA**-Redis-Queue-Scaler skaliert den Worker; einen
optionalen Prometheus-Scaler habe ich als Beweis 1→2→1 getestet. **Tempo** persistiert seine Traces
jetzt auf einem dedizierten local-path-**PVC** – ein Trace überlebt nachweislich einen Pod-Neustart.

CI über GitHub Actions (Lint/Build/Validate, bewusst ohne Deploy). Ehrlich abgegrenzt: Es ist eine
**single-node-Demo** (kein Multi-AZ); **RDS, S3, CloudFront und ElastiCache** sind als
Terraform-Toggles **vorbereitet, aber nicht live** – der Ausbau ist in `docs/aws-expansion.md`
dokumentiert.

## Live bewiesen vs. geplant
**Live & nachgewiesen:** AWS EC2 · k3s · Helm · Docker/ECR · GitHub-Actions-CI · Observability
(Prometheus/Grafana/Loki/Tempo/OpenTelemetry) · Backend- und Worker-Logs · Backend- und Worker-Traces
· Alertmanager-Alert · KEDA-Autoscaling · Tempo-Trace-Persistenz (PVC).

**Geplant / optional (nicht live):** RDS · S3 · CloudFront · ElastiCache – Terraform-Toggles
vorbereitet, Module ausstehend (siehe [aws-expansion.md](aws-expansion.md)).
