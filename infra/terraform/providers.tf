# AWS-Provider-Konfiguration.
#
# WICHTIG:
# - Es werden hier KEINE Credentials hinterlegt. Terraform nutzt die übliche
#   AWS-Credential-Kette (Umgebungsvariablen, ~/.aws/credentials, SSO ...),
#   die DU lokal/bewusst einrichtest.
# - Allen Ressourcen werden automatisch die gemeinsamen Tags (local.common_tags)
#   angehängt (default_tags), damit später alles eindeutig zuordenbar/aufräumbar ist.

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}
