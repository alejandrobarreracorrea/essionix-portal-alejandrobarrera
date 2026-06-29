provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}

locals {
  bucket_name = "alejandrobarrera-${var.environment}-${data.aws_caller_identity.current.account_id}"
  aliases     = var.include_www ? [var.domain_name, "www.${var.domain_name}"] : [var.domain_name]
  tags = {
    Project     = "essionix-portal-alejandrobarrera"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# ---------------------------------------------------------------------------
# Recursos EXISTENTES referenciados (NO se crean):
#  - Zona Route53 alejandrobarrera.net (creada en 2020, el DNS ya vive aquí).
#  - Certificado ACM ya emitido para el dominio (se reutiliza).
# Solo se consultan cuando enable_custom_domain = true.
# ---------------------------------------------------------------------------
data "aws_route53_zone" "site" {
  count        = var.enable_custom_domain ? 1 : 0
  name         = "${var.domain_name}."
  private_zone = false
}

data "aws_acm_certificate" "site" {
  count       = var.enable_custom_domain ? 1 : 0
  domain      = var.domain_name
  statuses    = ["ISSUED"]
  most_recent = true
}

# ---------------------------------------------------------------------------
# S3: bucket privado dedicado que almacena el sitio estático.
# ---------------------------------------------------------------------------
resource "aws_s3_bucket" "site" {
  bucket = local.bucket_name
  tags   = local.tags
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id
  versioning_configuration {
    status = "Enabled"
  }
}

# ---------------------------------------------------------------------------
# CloudFront: OAC + distribución sirviendo el bucket privado por HTTPS.
# ---------------------------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${local.bucket_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Alejandro Barrera — portal personal (${var.environment})"
  default_root_object = "index.html"
  aliases             = var.enable_custom_domain ? local.aliases : []
  price_class         = "PriceClass_100"
  tags                = local.tags

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-${aws_s3_bucket.site.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-${aws_s3_bucket.site.id}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # Managed policy "CachingOptimized".
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  # Sitio de una sola página: rutas no encontradas devuelven index.html.
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

  # Con dominio propio usa el certificado ACM existente; sin él, el certificado
  # por defecto de CloudFront (sirve por la URL *.cloudfront.net).
  viewer_certificate {
    cloudfront_default_certificate = var.enable_custom_domain ? null : true
    acm_certificate_arn            = var.enable_custom_domain ? data.aws_acm_certificate.site[0].arn : null
    ssl_support_method             = var.enable_custom_domain ? "sni-only" : null
    minimum_protocol_version       = var.enable_custom_domain ? "TLSv1.2_2021" : null
  }
}

# ---------------------------------------------------------------------------
# Bucket policy: solo esta distribución de CloudFront puede leer el bucket.
# ---------------------------------------------------------------------------
data "aws_iam_policy_document" "site" {
  statement {
    sid       = "AllowCloudFrontServicePrincipalReadOnly"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.site.json
}

# ---------------------------------------------------------------------------
# Route53 (solo con dominio propio): alias A + AAAA -> CloudFront, en la zona
# existente. Pre-requisito: el alias debe estar liberado en la distro legacy.
# ---------------------------------------------------------------------------
resource "aws_route53_record" "ipv4" {
  for_each = var.enable_custom_domain ? toset(local.aliases) : toset([])

  zone_id         = data.aws_route53_zone.site[0].zone_id
  name            = each.value
  type            = "A"
  allow_overwrite = true # sobrescribe el registro apex legacy (apunta a la distro vieja)

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "ipv6" {
  for_each = var.enable_custom_domain ? toset(local.aliases) : toset([])

  zone_id         = data.aws_route53_zone.site[0].zone_id
  name            = each.value
  type            = "AAAA"
  allow_overwrite = true # sobrescribe el registro apex legacy (apunta a la distro vieja)

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}
