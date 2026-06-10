# infra/terraform

Terraform-Grundgerüst für die (spätere, optionale) AWS-Demo von **angel-lara**.

In diesem Abschnitt werden **bewusst noch keine Ressourcen** definiert – nur Provider,
Variablen, Toggles, Namen/Tags und Outputs. `terraform plan` zeigt daher „No changes."

---

## Dateien

| Datei | Zweck |
|---|---|
| `versions.tf` | Terraform- & Provider-Versionen (AWS `~> 5.0`, Terraform `>= 1.5`). |
| `providers.tf` | AWS-Provider mit Region + automatischen `default_tags`. Keine Credentials im Code. |
| `variables.tf` | Eingabevariablen inkl. aller `enable_*`-Toggles (Default `false`). |
| `locals.tf` | Abgeleitete Werte: `name_prefix`, gemeinsame Tags, Feature-Übersicht. |
| `main.tf` | Einstiegspunkt – aktuell nur Kommentare/Muster, **keine** Ressourcen. |
| `outputs.tf` | Outputs (Projekt, Env, Region, Präfix, aktive Features). |
| `terraform.tfvars.example` | Beispielwerte. Kopieren nach `terraform.tfvars` (wird **nicht** committet). |

---

## Benutzung (lokal, sicher)

```bash
cd infra/terraform

terraform init       # Provider/Plugins laden (legt .terraform/ an – ist gitignored)
terraform fmt        # Formatierung prüfen/korrigieren
terraform validate   # Syntax/Konsistenz prüfen (braucht KEINE AWS-Credentials)
terraform plan        # Vorschau – zeigt hier "No changes." (keine Ressourcen)
```

> `terraform validate` und `terraform fmt` funktionieren **ohne** AWS-Zugang.
> `terraform plan`/`apply` nutzen die normale AWS-Credential-Kette (Env-Vars, `~/.aws/...`).

---

## ⚠️ Kein `apply` ohne bewusstes Aktivieren

- Standardmäßig sind **alle** kostenträchtigen Features deaktiviert:
  `enable_rds`, `enable_elasticache`, `enable_cloudfront`, `enable_nat_gateway`,
  `enable_load_balancer` = `false`.
- Es wird **nichts automatisch** erstellt. `terraform apply` führst nur **du** bewusst aus.
- Für die echte Demo nur **kleine Instanzen** (`t3.micro`/`t3.small`).

## 💶 Kostenhinweis

- Solange kein `apply` läuft, entstehen **keine Kosten**.
- Beim späteren `apply`: nur Free-Tier-/kleine Ressourcen aktivieren und einen
  **Budget-Alarm** in AWS einrichten.

## 🧹 Aufräumen (spätere Demo)

Nach der Demo alle erstellten Ressourcen wieder entfernen:

```bash
terraform destroy
```

Ein komfortables `scripts/destroy.sh` (das auch Terraform-Destroy kapselt) folgt in einem
späteren Abschnitt.
