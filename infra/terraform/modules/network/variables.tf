# Eingabevariablen des Netzwerk-Moduls.

variable "name_prefix" {
  description = "Namenspräfix für alle Netzwerk-Ressourcen (z. B. angel-lara-demo)."
  type        = string
}

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

variable "enable_nat_gateway" {
  description = "Optionales NAT Gateway aktivieren (KOSTET Geld pro Stunde + Traffic). Standard: aus."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Zusätzliche Tags für alle Netzwerk-Ressourcen."
  type        = map(string)
  default     = {}
}
