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

# ─── Netzwerk ────────────────────────────────────────────────────────
variable "vpc_cidr" {
  description = "CIDR-Block der VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR-Blöcke der öffentlichen Subnetze (mindestens 2)."
  type        = list(string)
  default     = ["10.20.0.0/24", "10.20.1.0/24"]

  validation {
    condition     = length(var.public_subnet_cidrs) >= 2
    error_message = "Es müssen mindestens 2 Public-Subnet-CIDRs angegeben werden."
  }
}

variable "private_subnet_cidrs" {
  description = "CIDR-Blöcke der privaten Subnetze (mindestens 2)."
  type        = list(string)
  default     = ["10.20.10.0/24", "10.20.11.0/24"]

  validation {
    condition     = length(var.private_subnet_cidrs) >= 2
    error_message = "Es müssen mindestens 2 Private-Subnet-CIDRs angegeben werden."
  }
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
