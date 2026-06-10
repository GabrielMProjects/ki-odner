# AWS Safe Deploy Runbook

Sichere, kostenkontrollierte Schrittfolge für ein späteres AWS-Deployment von **angel-lara**.

> **Grundprinzip:** zuerst absichern (Budget, Nicht-Root-IAM), dann **read-only** prüfen
> (`plan`), dann **bewusst** das Nötigste erstellen, danach **vollständig aufräumen**.
> Standardmäßig ist alles Teure per Terraform-Toggle **deaktiviert**.

---

## Phase 0 – Vorbereitung in der AWS-Konsole (manuell, DU)

Diese Schritte macht **du** in der Konsole – sie erzeugen **keine** nennenswerten Kosten:

1. **Budget-Alarm** anlegen (Billing → Budgets → z. B. „Zero spend" oder 5 €) mit E-Mail-Benachrichtigung.
2. **Nicht-Root IAM-User/Role** für Terraform anlegen (least privilege). **Niemals den Root-Account** für Deployments nutzen.
3. Zugangsdaten **lokal** konfigurieren (`aws configure` oder SSO) – die Keys bleiben bei dir,
   gehören **nicht** ins Repo und werden hier **nicht** ausgegeben.
4. Region festlegen (Standard im Projekt: `eu-central-1`).

> Erst wenn Budget-Alarm + Nicht-Root-Zugang stehen, weiter mit Phase 1.

---

## Phase 1 – Read-only prüfen (keine Kosten, erstellt nichts)

| Befehl | Wirkung |
|---|---|
| `terraform fmt -check -recursive` | nur Formatprüfung |
| `terraform validate` | Syntax/Konsistenz (braucht keine AWS-Creds) |
| `terraform plan` | **read-only Vorschau** – erstellt/ändert **nichts** |
| `aws sts get-caller-identity` | zeigt, als wer du eingeloggt bist (read-only) |
| `aws ec2 describe-* / aws s3 ls` | read-only Abfragen |

> `plan` ist sicher: Es zeigt nur, *was* passieren würde. Mit allen Toggles `false`
> sollte `plan` außer dem (kostenlosen) Netzwerk nichts Kostenpflichtiges vorschlagen.

---

## Phase 2 – Remote-State-Backend (einmalig, minimale Kosten)

Siehe `infra/terraform/bootstrap/README.md`.

1. `cd infra/terraform/bootstrap`
2. `cp terraform.tfvars.example terraform.tfvars` → **global eindeutigen** Bucket-Namen wählen
3. `terraform init` → `terraform plan` → **`terraform apply`** (erstellt S3 + DynamoDB)
4. `terraform output` → Bucket-/Tabellennamen notieren
5. `infra/terraform/backend.tf.example` → nach `backend.tf` umbenennen, Block **entkommentieren**,
   Werte eintragen → im Hauptprojekt `terraform init -migrate-state`

💶 **Kosten:** S3-Speicher + DynamoDB On-Demand ≈ Cent-Bereich.

---

## Phase 3 – Registry (ECR) + Images (bewusst)

1. Im Hauptprojekt `enable_ecr = true` setzen → `terraform plan` → `terraform apply`
   (erstellt die leeren Repos `backend`/`frontend`).
2. Images bauen, taggen, pushen → siehe `infra/terraform/modules/ecr/README.md`.
3. Helm-`values` (`backend.image.repository` / `frontend.image.repository`) auf die ECR-URLs zeigen lassen.

💶 **Kosten:** leere Repos ~0; Storage für Images gering.

---

## Phase 4 – Compute + Deployment (kostenpflichtig, kurz halten)

1. `enable_compute = true`, **`allowed_ssh_cidr` auf die eigene IP** (`x.x.x.x/32`) einschränken,
   öffentlichen SSH-Key setzen. `terraform plan` → **`terraform apply`** (erstellt EC2 + SG).
2. Per **Ansible** provisionieren (k3s/Docker/Helm) – Terraform-Output → Inventory.
3. **Helm-Deploy** auf den k3s-Node (Secrets/`APP_KEY` sicher zuführen, z. B. SSM/Secrets Manager).

💶 **Kosten:** EC2 läuft **stundenweise** → **nur für die Demo** anlassen, danach Phase 5.

---

## Befehls-Ampel

| 🟢 read-only (sicher) | 🟡 erstellt/kostet (bewusst) | 🔴 destruktiv (Vorsicht) |
|---|---|---|
| `terraform plan` | `terraform apply` | `terraform destroy` |
| `terraform validate/fmt` | `aws ecr create-*` (via TF) | `aws s3 rb` / Bucket leeren |
| `aws sts get-caller-identity` | `docker push` (Storage) | `kind delete cluster` (lokal, ok) |
| `aws … describe-*/ls` | `helm upgrade --install` | `aws ec2 terminate-instances` |

> Im Repo erzwingen die Skripte das zusätzlich: `deploy.sh` deployt nur mit `CONFIRM_DEPLOY=yes`,
> `destroy.sh` macht `terraform destroy` nur mit `CONFIRM_TERRAFORM_DESTROY=yes` + Tastatur-Bestätigung.

---

## Kosten vermeiden

- Alle teuren Toggles **`false`** lassen, bis wirklich gebraucht.
- Nur **kleine** Instanzen (`t3.micro`/`t3.small`).
- `enable_nat_gateway` **aus** lassen (NAT kostet pro Stunde + Traffic).
- Demo **kurz** laufen lassen, danach sofort aufräumen.
- **Budget-Alarm** aktiv halten.

---

## Alles wieder löschen (Teardown, in dieser Reihenfolge)

```bash
# 1) App/Compute-Infra zuerst
cd infra/terraform
terraform destroy        # entfernt EC2, SG, (ECR,) Netzwerk ...

# 2) ECR-Images ggf. vorher löschen (sonst kann Repo-Destroy scheitern)
#    aws ecr batch-delete-image ...   (bewusst)

# 3) Zuletzt das State-Backend (nur wenn endgültig)
cd bootstrap
terraform destroy        # S3-Bucket (ggf. vorher leeren) + DynamoDB

# 4) Lokaler kind-Cluster (kostenlos, jederzeit)
kind delete cluster --name angel-lara
```

Danach in der Konsole prüfen, dass keine Ressourcen mehr laufen (Billing/Cost Explorer),
und den Budget-Alarm bestehen lassen.

---

## Sicherheitsregeln (gelten durchgehend)

- **Kein Root-Account** für Deployments.
- **Keine Secrets** ins Repo/Image; echte Werte via SSM Parameter Store / Secrets Manager /
  Sealed Secrets zur Laufzeit. `.env` bleibt lokal & gitignored.
- CI bleibt **deploy-frei**; ein echter Deploy-Workflow käme separat (manuell, OIDC, Approval).
- Vor jedem `apply`: erst `plan` lesen.
