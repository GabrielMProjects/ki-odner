# ECR-Repositories für die App-Images (backend, frontend).
# Werden NUR erstellt, wenn enable_ecr = true (Standard: false).
#
# Kosten: leere Repos sind praktisch kostenlos; Kosten entstehen erst durch
# gespeicherte Images (Storage) und Datentransfer.

resource "aws_ecr_repository" "this" {
  for_each = var.enable_ecr ? toset(var.repository_names) : toset([])

  name                 = "${var.name_prefix}/${each.value}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}/${each.value}"
  })
}
