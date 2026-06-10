# ─────────────────────────────────────────────────────────────────────
# Bootstrap: erzeugt das Remote-State-Backend (S3 + DynamoDB-Lock).
#
# Dieser Stack nutzt BEWUSST lokalen State (Henne-Ei-Problem) und wird genau
# EINMAL angewandt, bevor das Haupt-Terraform ein S3-Backend nutzen kann.
#
# ⚠️ `terraform apply` hier erzeugt ECHTE AWS-Ressourcen. KOSTEN sind minimal
#    (S3-Speicher + DynamoDB On-Demand; bei dieser Nutzung praktisch kostenlos),
#    aber es ist KEIN Null-Kosten-Schritt. Siehe docs/aws-safe-deploy-runbook.md.
# ─────────────────────────────────────────────────────────────────────

resource "aws_s3_bucket" "tfstate" {
  bucket = var.state_bucket_name
}

# Versionierung: erlaubt Wiederherstellung früherer State-Stände.
resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Verschlüsselung at-rest.
resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Öffentlichen Zugriff komplett blockieren.
resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket                  = aws_s3_bucket.tfstate.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lock-Tabelle (verhindert parallele/konfligierende State-Änderungen).
resource "aws_dynamodb_table" "tf_locks" {
  name         = var.lock_table_name
  billing_mode = "PAY_PER_REQUEST" # On-Demand: keine Grundgebühr
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
