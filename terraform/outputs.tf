output "bucket_name" {
  description = "Nombre del bucket S3 dedicado con el sitio"
  value       = aws_s3_bucket.site.id
}

output "distribution_id" {
  description = "ID de la distribución de CloudFront (para invalidaciones)"
  value       = aws_cloudfront_distribution.site.id
}

output "distribution_domain_name" {
  description = "Dominio *.cloudfront.net de la distribución nueva"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "review_url" {
  description = "URL para revisar el sitio nuevo antes del cutover de alias"
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "custom_domain_enabled" {
  description = "Si el dominio propio (alias + cert ACM + registros Route53) está activo"
  value       = var.enable_custom_domain
}

output "site_urls" {
  description = "URLs públicas del dominio propio (cuando enable_custom_domain = true)"
  value       = var.enable_custom_domain ? [for d in local.aliases : "https://${d}"] : []
}
