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

# ─── Netzwerk (aus dem network-Modul) ────────────────────────────────
output "vpc_id" {
  description = "ID der VPC."
  value       = module.network.vpc_id
}

output "public_subnet_ids" {
  description = "IDs der öffentlichen Subnetze."
  value       = module.network.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs der privaten Subnetze."
  value       = module.network.private_subnet_ids
}

output "internet_gateway_id" {
  description = "ID des Internet Gateways."
  value       = module.network.internet_gateway_id
}

output "public_route_table_id" {
  description = "ID der öffentlichen Route Table."
  value       = module.network.public_route_table_id
}

output "private_route_table_id" {
  description = "ID der privaten Route Table."
  value       = module.network.private_route_table_id
}

output "nat_gateway_id" {
  description = "ID des NAT Gateways (null, wenn deaktiviert)."
  value       = module.network.nat_gateway_id
}

output "enabled_nat_gateway" {
  description = "Ob das NAT Gateway aktiviert ist."
  value       = module.network.enabled_nat_gateway
}
