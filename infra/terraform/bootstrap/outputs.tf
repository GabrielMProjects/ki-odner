output "state_bucket" {
  description = "Name des S3-State-Buckets – in backend.tf eintragen."
  value       = aws_s3_bucket.tfstate.id
}

output "lock_table" {
  description = "Name der DynamoDB-Lock-Tabelle – in backend.tf eintragen."
  value       = aws_dynamodb_table.tf_locks.name
}
