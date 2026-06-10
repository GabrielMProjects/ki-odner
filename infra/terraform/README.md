# infra/terraform

Infrastructure as Code (Terraform) für die AWS-Demo.

**Grundsätze in diesem Projekt:**
- Hier liegen **nur Terraform-Dateien**. Es wird **nichts automatisch** angewendet
  (`terraform apply` führst ausschließlich du bewusst selbst aus).
- Alle optionalen, kostenträchtigen Module sind **standardmäßig deaktiviert**:
  - `enable_rds = false`
  - `enable_elasticache = false`
  - `enable_cloudfront = false`
  - `enable_nat_gateway = false`
  - `enable_load_balancer = false`
- Für die echte Demo nur **kleine Instanzen** (z. B. `t3.micro`/`t3.small`).
- `terraform plan` zum Vorschauen, bevor irgendetwas erstellt wird.

> Inhalt (Module, Variablen, Outputs) wird in einem späteren Abschnitt befüllt.
