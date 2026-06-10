# Abgeleitete lokale Werte: einheitliche Namen und Tags.

locals {
  # Einheitliches Namenspräfix, z. B. "angel-lara-demo".
  name_prefix = "${var.project_name}-${var.environment}"

  # Gemeinsame Tags für alle Ressourcen (via provider default_tags).
  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    },
    var.additional_tags
  )

  # Übersicht der aktiven Features (rein informativ, für Outputs).
  enabled_features = {
    compute       = var.enable_compute
    ecr           = var.enable_ecr
    rds           = var.enable_rds
    elasticache   = var.enable_elasticache
    cloudfront    = var.enable_cloudfront
    nat_gateway   = var.enable_nat_gateway
    load_balancer = var.enable_load_balancer
  }
}
