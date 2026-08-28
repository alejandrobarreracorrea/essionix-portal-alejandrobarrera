# ---------------------------------------------------------------------------
# iaopslatam.com → 301 → alejandrobarrera.net
# Dominio-marca de la escuela/comunidad (fácil de dictar en clase). Por ahora
# redirige al hub personal; en el futuro será su propia landing.
# Encender enable_iaopslatam cuando el registro del dominio esté COMPLETO
# (la validación ACM necesita que los nameservers ya deleguen).
# ---------------------------------------------------------------------------

variable "enable_iaopslatam" {
  description = "Activa el redirect de iaopslatam.com (requiere registro de dominio completado)"
  type        = bool
  default     = false
}

locals {
  iaops_domains = ["iaopslatam.com", "www.iaopslatam.com"]
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

# Función CloudFront: 301 permanente preservando ruta y query string.
resource "aws_cloudfront_function" "iaops_redirect" {
  count   = var.enable_iaopslatam ? 1 : 0
  name    = "iaopslatam-redirect-${var.environment}"
  runtime = "cloudfront-js-2.0"
  publish = true
  comment = "301 iaopslatam.com -> alejandrobarrera.net"

  code = <<-EOT
    function handler(event) {
      var req = event.request;
      var qs = "";
      var keys = Object.keys(req.querystring);
      if (keys.length > 0) {
        qs = "?" + keys.map(function (k) { return k + "=" + req.querystring[k].value; }).join("&");
      }
      return {
        statusCode: 301,
        statusDescription: "Moved Permanently",
        headers: {
          "location": { value: "https://${var.domain_name}" + req.uri + qs },
          "cache-control": { value: "max-age=86400" }
        }
      };
    }
  EOT
}

resource "aws_cloudfront_distribution" "iaops" {
  count           = var.enable_iaopslatam ? 1 : 0
  enabled         = true
  is_ipv6_enabled = true
  comment         = "iaopslatam.com redirect (${var.environment})"
  aliases         = local.iaops_domains
  price_class     = "PriceClass_100"
  tags            = local.tags

  # Origen nunca alcanzado: la función responde antes. CloudFront exige uno.
  origin {
    domain_name = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id   = "unused-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "unused-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.iaops_redirect[0].arn
    }
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

output "iaopslatam_enabled" {
  value = var.enable_iaopslatam
}
