# Eingabevariablen für den Bootstrap-Stack. Nur Platzhalter-Defaults.

variable "aws_region" {
  description = "AWS-Region für State-Bucket und Lock-Tabelle."
  type        = string
  default     = "eu-central-1"
}

variable "state_bucket_name" {
  description = "GLOBAL EINDEUTIGER S3-Bucket-Name für den Terraform-State. Platzhalter anpassen!"
  type        = string
  default     = "angel-lara-tfstate-CHANGE-ME"
}

variable "lock_table_name" {
  description = "DynamoDB-Tabelle für das State-Locking."
  type        = string
  default     = "angel-lara-tf-locks"
}
