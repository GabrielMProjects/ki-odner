# Outputs des Netzwerk-Moduls.

output "vpc_id" {
  description = "ID der VPC."
  value       = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "IDs der öffentlichen Subnetze."
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs der privaten Subnetze."
  value       = aws_subnet.private[*].id
}

output "internet_gateway_id" {
  description = "ID des Internet Gateways."
  value       = aws_internet_gateway.this.id
}

output "public_route_table_id" {
  description = "ID der öffentlichen Route Table."
  value       = aws_route_table.public.id
}

output "private_route_table_id" {
  description = "ID der privaten Route Table."
  value       = aws_route_table.private.id
}

output "nat_gateway_id" {
  description = "ID des NAT Gateways (null, wenn enable_nat_gateway = false)."
  value       = try(aws_nat_gateway.this[0].id, null)
}

output "enabled_nat_gateway" {
  description = "Ob das NAT Gateway aktiviert ist."
  value       = var.enable_nat_gateway
}
