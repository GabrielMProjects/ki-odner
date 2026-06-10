# bootstrap – Terraform Remote-State (S3 + DynamoDB)

Erzeugt **einmalig** das Backend für den Terraform-State des Hauptprojekts:
- **S3-Bucket** (versioniert, verschlüsselt, kein öffentlicher Zugriff) für die `.tfstate`.
- **DynamoDB-Tabelle** für State-**Locking** (verhindert parallele/konfligierende Änderungen).

Dieser Stack nutzt **lokalen** State (Henne-Ei) – deshalb ist er bewusst getrennt vom Hauptprojekt.

## ⚠️ Wichtig
- `terraform apply` hier erzeugt **echte AWS-Ressourcen**. **Kosten minimal** (S3-Speicher +
  DynamoDB On-Demand ≈ Cent-Bereich), aber **nicht** null. Nur **bewusst** anwenden.
- Verwende einen **Nicht-Root IAM-User** (siehe `docs/aws-safe-deploy-runbook.md`).
- Keine Secrets nötig – S3/DynamoDB brauchen keine.

## Ablauf (später, bewusst)
```bash
cd infra/terraform/bootstrap
cp terraform.tfvars.example terraform.tfvars   # Bucket-Namen global eindeutig wählen
terraform init                                  # lokaler State
terraform plan                                  # read-only Vorschau
terraform apply                                 # erzeugt S3 + DynamoDB (einmalig)
terraform output                                # Bucket-/Tabellennamen notieren
```
Danach `infra/terraform/backend.tf.example` aktivieren (siehe Datei) und im Hauptprojekt
`terraform init -migrate-state` ausführen.

## Aufräumen
```bash
# Vorsicht: löscht State-Bucket + Lock-Tabelle. Erst NACH 'terraform destroy' des Hauptprojekts!
terraform destroy
```
> Ein versionierter S3-Bucket muss vor dem Löschen ggf. geleert werden.
