# Outputs des Grundgerüsts.
# Verweisen ausschließlich auf Variablen/Locals (keine Ressourcen),
# damit sie auch ohne `apply` funktionieren.

output "project_name" {
  description = "Projektname."
  value       = var.project_name
}

output "environment" {
  description = "Aktive Umgebung."
  value       = var.environment
}

output "aws_region" {
  description = "Konfigurierte AWS-Region."
  value       = var.aws_region
}

output "name_prefix" {
  description = "Einheitliches Namenspräfix für Ressourcen."
  value       = local.name_prefix
}

output "enabled_features" {
  description = "Welche optionalen (kostenträchtigen) Features aktiv sind."
  value       = local.enabled_features
}
