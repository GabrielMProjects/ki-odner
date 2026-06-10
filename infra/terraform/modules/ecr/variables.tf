variable "enable_ecr" {
  description = "ECR-Repositories erstellen. Standard: aus (es wird nichts erstellt)."
  type        = bool
  default     = false
}

variable "name_prefix" {
  description = "Präfix für die Repository-Namen (z. B. angel-lara-demo)."
  type        = string
}

variable "repository_names" {
  description = "Liste der Repository-Kurznamen."
  type        = list(string)
  default     = ["backend", "frontend"]
}

variable "tags" {
  description = "Zusätzliche Tags."
  type        = map(string)
  default     = {}
}
