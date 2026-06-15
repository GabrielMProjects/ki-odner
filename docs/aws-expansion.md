# AWS-Ausbau (geplant) – RDS · S3 · CloudFront · ElastiCache

> **Status: geplanter Ausbau, NICHT live.** Die Demo läuft bewusst schlank/kostenarm auf
> **einer EC2** (k3s + Helm), mit **MySQL und Redis in-cluster** (PVCs) und **ECR** als Registry.
> **EC2 + ECR sind live genutzt.** Die folgenden Managed Services sind **als Feature-Toggle
> vorbereitet, aber nicht implementiert und nicht live bewiesen.**

## Aktueller Terraform-Stand

| Baustein | Toggle | Modul | Live |
|---|---|---|---|
| Netzwerk/VPC | – | ✅ `modules/network` | ✅ |
| EC2 (k3s) | `enable_compute` | ✅ `modules/compute` | ✅ |
| ECR | `enable_ecr` | ✅ `modules/ecr` | ✅ |
| RDS | `enable_rds` | ❌ (in `main.tf` auskommentiert) | ❌ |
| ElastiCache | `enable_elasticache` | ❌ | ❌ |
| CloudFront | `enable_cloudfront` | ❌ | ❌ |
| S3 (App-Storage) | ❌ kein Toggle | ❌ | ❌ |

> S3 existiert im Repo nur als **Terraform-State-Bucket** in `infra/terraform/bootstrap/`
> (S3 + DynamoDB-Lock) – das ist **nicht** App-Storage für Produktbilder.

## Geplante Bausteine

### 1. RDS MySQL statt in-cluster MySQL
Managed MySQL (Multi-AZ optional) statt des in-cluster `mysql`-Pods. App-Anbindung über
`DB_HOST`/`DB_*` (Helm-Secret) auf den RDS-Endpoint.
**Umsetzung:** neues `modules/rds` (Subnet-Group in privaten Subnetzen, SG nur aus dem Node-SG,
Parameter-Group), `enable_rds`-gated; in-cluster MySQL deaktivieren.
**Kosten:** laufende Instanz-Kosten (24/7), auch ohne Last.

### 2. S3 für Produktbilder/Storage
Bagisto-`public`-Disk auf einen S3-Bucket statt des geteilten PVC: `FILESYSTEM_DISK=s3` +
IAM-Anbindung (kein statischer Key im Repo).
**Umsetzung:** **neues Toggle `enable_s3`** + `modules/s3` (privater Bucket, Bucket-Policy,
ggf. OAC für CloudFront).
**Kosten:** gering, nutzungsabhängig (Storage + Requests).

### 3. CloudFront als CDN
CDN vor S3 (Produktbilder) und/oder dem Frontend (Cache, TLS, geringere Latenz).
**Umsetzung:** `modules/cloudfront` (Origin = S3 via OAC bzw. Ingress), `enable_cloudfront`-gated.
**Kosten:** v. a. traffic-abhängig.

### 4. ElastiCache Redis statt in-cluster Redis
Managed Redis (Cache + Queue) statt des in-cluster `redis`-Pods. App/KEDA-Anbindung über
`REDIS_HOST` bzw. `keda.redis.address` auf den ElastiCache-Endpoint.
**Umsetzung:** `modules/elasticache` (Subnet-Group, SG), `enable_elasticache`-gated.
**Kosten:** laufende Instanz-Kosten (24/7), auch ohne Last.

## Kosten- & Sicherheitshinweis
- **RDS und ElastiCache verursachen laufende Kosten** (Instanz-Stunden, auch ohne Last) – für die
  Kurz-Demo bewusst vermieden. S3/CloudFront sind nutzungsabhängig (gering bei Demo-Last).
- Alle Toggles bleiben **default `false`** – nichts entsteht ohne bewusstes `terraform apply`.
- Empfohlene Reihenfolge: Modul + `terraform plan` prüfen → gated `apply` → Helm-`values`
  (`DB_HOST`/`REDIS_HOST`/`FILESYSTEM_DISK`) auf die Managed-Endpoints umstellen.
