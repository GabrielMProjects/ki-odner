output "repository_urls" {
  description = "Map: Repo-Kurzname -> ECR-URL (leer, wenn enable_ecr=false)."
  value       = { for k, r in aws_ecr_repository.this : k => r.repository_url }
}

output "enabled_ecr" {
  description = "Ob ECR aktiviert ist."
  value       = var.enable_ecr
}
