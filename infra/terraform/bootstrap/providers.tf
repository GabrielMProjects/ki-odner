# AWS-Provider für den Bootstrap-Stack.
# Keine Credentials im Code – Terraform nutzt die übliche AWS-Credential-Kette
# (idealerweise ein NICHT-Root IAM-User, siehe Runbook).

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "angel-lara"
      Component = "tf-state-bootstrap"
      ManagedBy = "Terraform"
    }
  }
}
