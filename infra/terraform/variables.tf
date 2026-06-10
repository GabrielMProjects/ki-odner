# Eingabevariablen für das Grundgerüst.
# Werte werden über terraform.tfvars (NICHT eingecheckt) oder -var gesetzt.
# Die Defaults sind bewusst sicher & kostenfrei.

# ─── Allgemein ────────────────────────────────────────────────────────
variable "aws_region" {
  description = "AWS-Region, in der die Infrastruktur (später) erstellt wird."
  type        = string
  default     = "eu-central-1"
}

variable "project_name" {
  description = "Projektname, wird für Namenspräfixe und Tags verwendet."
  type        = string
  default     = "angel-lara"
}

variable "environment" {
  description = "Umgebung (z. B. demo, staging, prod). Teil von Namen und Tags."
  type        = string
  default     = "demo"
}

variable "additional_tags" {
  description = "Optionale zusätzliche Tags, die an alle Ressourcen gehängt werden."
  type        = map(string)
  default     = {}
}

# ─── Größen / Defaults (klein halten!) ───────────────────────────────
variable "instance_type" {
  description = "EC2-Instanztyp für die spätere Demo. Bewusst klein (Free-Tier-nah)."
  type        = string
  default     = "t3.micro"
}

# ─── Feature-Toggles ─────────────────────────────────────────────────
# Alles potenziell Kostenträchtige ist standardmäßig AUS.
# Erst durch bewusstes Setzen auf true (in terraform.tfvars) wird es aktiv.

variable "enable_rds" {
  description = "Verwaltete RDS-Datenbank aktivieren (kostet Geld)."
  type        = bool
  default     = false
}

variable "enable_elasticache" {
  description = "ElastiCache (Redis/Memcached) aktivieren (kostet Geld)."
  type        = bool
  default     = false
}

variable "enable_cloudfront" {
  description = "CloudFront-CDN aktivieren (kann Geld kosten)."
  type        = bool
  default     = false
}

variable "enable_nat_gateway" {
  description = "NAT-Gateway aktivieren (kostet pro Stunde + Traffic)."
  type        = bool
  default     = false
}

variable "enable_load_balancer" {
  description = "Load Balancer (ALB/NLB) aktivieren (kostet pro Stunde)."
  type        = bool
  default     = false
}
