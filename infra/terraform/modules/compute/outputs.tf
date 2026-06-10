# Outputs des Compute-Moduls.
# Verwenden try(), damit sie auch bei enable_compute = false (keine Ressourcen) funktionieren.

output "instance_id" {
  description = "ID der EC2-Instanz (null, wenn enable_compute = false)."
  value       = try(aws_instance.k3s[0].id, null)
}

output "public_ip" {
  description = "Öffentliche IP der EC2-Instanz (null, wenn deaktiviert)."
  value       = try(aws_instance.k3s[0].public_ip, null)
}

output "public_dns" {
  description = "Öffentlicher DNS-Name der EC2-Instanz (null, wenn deaktiviert)."
  value       = try(aws_instance.k3s[0].public_dns, null)
}

output "security_group_id" {
  description = "ID der k3s-Security-Group (null, wenn deaktiviert)."
  value       = try(aws_security_group.k3s[0].id, null)
}

output "key_pair_name" {
  description = "Name des AWS Key Pairs (null, wenn deaktiviert)."
  value       = try(aws_key_pair.this[0].key_name, null)
}

output "enabled_compute" {
  description = "Ob das Compute-Modul aktiv ist."
  value       = var.enable_compute
}
