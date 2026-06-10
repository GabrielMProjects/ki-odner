# Eingabevariablen des Compute-Moduls.

variable "name_prefix" {
  description = "Namenspräfix für alle Compute-Ressourcen (z. B. angel-lara-demo)."
  type        = string
}

variable "enable_compute" {
  description = "EC2-Instanz (+ SG + Key Pair) erstellen. KOSTET Geld bei apply. Standard: aus."
  type        = bool
  default     = false
}

variable "instance_type" {
  description = "EC2-Instanztyp. Bewusst klein (Free-Tier-nah)."
  type        = string
  default     = "t3.micro"
}

variable "vpc_id" {
  description = "ID der VPC (aus dem Netzwerk-Modul) für die Security Group."
  type        = string
}

variable "public_subnet_id" {
  description = "ID eines öffentlichen Subnetzes (aus dem Netzwerk-Modul)."
  type        = string
}

variable "root_volume_size" {
  description = "Größe des Root-Volumes in GB."
  type        = number
  default     = 20
}

# ─── SSH-Public-Key (NIEMALS den privaten Key angeben!) ──────────────
variable "public_key" {
  description = "Öffentlicher SSH-Key als String. Alternativ ssh_public_key_path nutzen."
  type        = string
  default     = ""
}

variable "ssh_public_key_path" {
  description = "Pfad zu einer .pub-Datei (öffentlicher SSH-Key). Alternativ public_key."
  type        = string
  default     = ""
}

# ─── Zugriffssteuerung ───────────────────────────────────────────────
variable "allowed_ssh_cidr" {
  description = "CIDR, der per SSH (Port 22) zugreifen darf. Demo-Default offen – später einschränken!"
  type        = string
  default     = "0.0.0.0/0"
}

variable "allowed_kubernetes_api_cidr" {
  description = "CIDR, der die Kubernetes-API (6443) erreichen darf. Bewusst NICHT 0.0.0.0/0."
  type        = string
  default     = "10.20.0.0/16"
}

variable "tags" {
  description = "Zusätzliche Tags für alle Compute-Ressourcen."
  type        = map(string)
  default     = {}
}
