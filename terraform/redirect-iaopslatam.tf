# ---------------------------------------------------------------------------
# iaopslatam.com — LA CASA del ecosistema (comunidad + cursos + programa).
# v1 (2026-08-28): deja de ser redirect y se convierte en sitio propio:
# bucket privado + OAC + la distribución existente reapuntada. El contenido
# vive en site-iaops/ y lo publica el mismo pipeline.
# ---------------------------------------------------------------------------

variable "enable_iaopslatam" {
  description = "Activa el sitio iaopslatam.com (requiere registro de dominio completado)"
  type        = bool
  default     = false
}

locals {
  iaops_domains     = ["iaopslatam.com", "www.iaopslatam.com"]
  iaops_bucket_name = "iaopslatam-${var.environment}-${data.aws_caller_identity.current.account_id}"
}

data "aws_route53_zone" "iaops" {
  count        = var.enable_iaopslatam ? 1 : 0
  name         = "iaopslatam.com."
  private_zone = false
}

resource "aws_acm_certificate" "iaops" {
  count                     = var.enable_iaopslatam ? 1 : 0
  domain_name               = "iaopslatam.com"
  subject_alternative_names = ["www.iaopslatam.com"]
  validation_method         = "DNS"
  tags                      = local.tags

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "iaops_acm_validation" {
  for_each = var.enable_iaopslatam ? {
    for dvo in aws_acm_certificate.iaops[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  zone_id         = data.aws_route53_zone.iaops[0].zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "iaops" {
  count                   = var.enable_iaopslatam ? 1 : 0
  certificate_arn         = aws_acm_certificate.iaops[0].arn
  validation_record_fqdns = [for r in aws_route53_record.iaops_acm_validation : r.fqdn]
}

# ---------------------------------------------------------------------------
# S3 privado del sitio de la comunidad
# ---------------------------------------------------------------------------
resource "aws_s3_bucket" "iaops" {
  count  = var.enable_iaopslatam ? 1 : 0
  bucket = local.iaops_bucket_name
  tags   = local.tags
}

resource "aws_s3_bucket_public_access_block" "iaops" {
  count                   = var.enable_iaopslatam ? 1 : 0
  bucket                  = aws_s3_bucket.iaops[0].id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "iaops" {
  count  = var.enable_iaopslatam ? 1 : 0
  bucket = aws_s3_bucket.iaops[0].id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_cloudfront_origin_access_control" "iaops" {
  count                             = var.enable_iaopslatam ? 1 : 0
  name                              = "${local.iaops_bucket_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# NOTA: este recurso nació como función de redirect; hoy es el url-rewrite de
# URLs limpias del sitio. Se conserva el label para actualizarlo in-place.
resource "aws_cloudfront_function" "iaops_redirect" {
  count   = var.enable_iaopslatam ? 1 : 0
  name    = "iaopslatam-redirect-${var.environment}"
  runtime = "cloudfront-js-2.0"
  publish = true
  comment = "Pretty URLs iaopslatam.com: agrega index.html a rutas de carpeta"

  code = <<-EOT
    function handler(event) {
      var req = event.request;
      if (req.uri.endsWith("/")) {
        req.uri += "index.html";
      } else if (!req.uri.includes(".")) {
        req.uri += "/index.html";
      }
      return req;
    }
  EOT
}

resource "aws_cloudfront_distribution" "iaops" {
  count               = var.enable_iaopslatam ? 1 : 0
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "iaopslatam.com — comunidad (${var.environment})"
  default_root_object = "index.html"
  aliases             = local.iaops_domains
  price_class         = "PriceClass_100"
  tags                = local.tags

  origin {
    domain_name              = aws_s3_bucket.iaops[0].bucket_regional_domain_name
    origin_id                = "s3-${aws_s3_bucket.iaops[0].id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.iaops[0].id
  }

  default_cache_behavior {
    target_origin_id       = "s3-${aws_s3_bucket.iaops[0].id}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.iaops_redirect[0].arn
    }
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.iaops[0].certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

data "aws_iam_policy_document" "iaops" {
  count = var.enable_iaopslatam ? 1 : 0

  statement {
    sid       = "AllowCloudFrontServicePrincipalReadOnly"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.iaops[0].arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.iaops[0].arn]
    }
  }
}

resource "aws_s3_bucket_policy" "iaops" {
  count  = var.enable_iaopslatam ? 1 : 0
  bucket = aws_s3_bucket.iaops[0].id
  policy = data.aws_iam_policy_document.iaops[0].json
}

resource "aws_route53_record" "iaops_ipv4" {
  for_each = var.enable_iaopslatam ? toset(local.iaops_domains) : toset([])

  zone_id = data.aws_route53_zone.iaops[0].zone_id
  name    = each.value
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.iaops[0].domain_name
    zone_id                = aws_cloudfront_distribution.iaops[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "iaops_ipv6" {
  for_each = var.enable_iaopslatam ? toset(local.iaops_domains) : toset([])

  zone_id = data.aws_route53_zone.iaops[0].zone_id
  name    = each.value
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.iaops[0].domain_name
    zone_id                = aws_cloudfront_distribution.iaops[0].hosted_zone_id
    evaluate_target_health = false
  }
}

output "iaops_bucket_name" {
  value = var.enable_iaopslatam ? aws_s3_bucket.iaops[0].id : ""
}

output "iaops_distribution_id" {
  value = var.enable_iaopslatam ? aws_cloudfront_distribution.iaops[0].id : ""
}
