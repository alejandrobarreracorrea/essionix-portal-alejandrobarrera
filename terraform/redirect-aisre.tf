# ---------------------------------------------------------------------------
# aisrelatam.com + iasrelatam.com — registro defensivo del término "AI SRE"
# (el nombre que usa el mercado US para la categoría; IAOps es la marca en ES).
# Redirect 301 permanente hacia iaopslatam.com. Una sola distribución con los
# 4 aliases; la CloudFront Function responde en viewer-request, así que el
# origin (dummy) nunca se contacta.
# ---------------------------------------------------------------------------

variable "enable_aisre_redirect" {
  description = "Activa el redirect aisrelatam.com/iasrelatam.com -> iaopslatam.com (requiere ambos registros de dominio completados)"
  type        = bool
  default     = false
}

locals {
  aisre_apexes  = ["aisrelatam.com", "iasrelatam.com"]
  aisre_aliases = flatten([for d in local.aisre_apexes : [d, "www.${d}"]])
}

data "aws_route53_zone" "aisre" {
  for_each     = var.enable_aisre_redirect ? toset(local.aisre_apexes) : toset([])
  name         = "${each.value}."
  private_zone = false
}

resource "aws_acm_certificate" "aisre" {
  count                     = var.enable_aisre_redirect ? 1 : 0
  domain_name               = "aisrelatam.com"
  subject_alternative_names = ["www.aisrelatam.com", "iasrelatam.com", "www.iasrelatam.com"]
  validation_method         = "DNS"
  tags                      = local.tags

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "aisre_acm_validation" {
  for_each = var.enable_aisre_redirect ? {
    for dvo in aws_acm_certificate.aisre[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  zone_id         = data.aws_route53_zone.aisre[trimprefix(each.key, "www.")].zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "aisre" {
  count                   = var.enable_aisre_redirect ? 1 : 0
  certificate_arn         = aws_acm_certificate.aisre[0].arn
  validation_record_fqdns = [for r in aws_route53_record.aisre_acm_validation : r.fqdn]
}

resource "aws_cloudfront_function" "aisre_redirect" {
  count   = var.enable_aisre_redirect ? 1 : 0
  name    = "aisrelatam-redirect-${var.environment}"
  runtime = "cloudfront-js-2.0"
  publish = true
  comment = "301 aisrelatam.com / iasrelatam.com -> iaopslatam.com (conserva la ruta)"

  code = <<-EOT
    function handler(event) {
      return {
        statusCode: 301,
        statusDescription: "Moved Permanently",
        headers: { "location": { value: "https://iaopslatam.com" + event.request.uri } }
      };
    }
  EOT
}

resource "aws_cloudfront_distribution" "aisre" {
  count           = var.enable_aisre_redirect ? 1 : 0
  enabled         = true
  is_ipv6_enabled = true
  comment         = "aisrelatam/iasrelatam -> 301 iaopslatam.com (${var.environment})"
  aliases         = local.aisre_aliases
  price_class     = "PriceClass_100"
  tags            = local.tags

  # Origin dummy: la función 301 responde antes de llegar aquí.
  origin {
    domain_name = "iaopslatam.com"
    origin_id   = "redirect-dummy"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "redirect-dummy"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.aisre_redirect[0].arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.aisre[0].certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_route53_record" "aisre_ipv4" {
  for_each = var.enable_aisre_redirect ? toset(local.aisre_aliases) : toset([])

  zone_id = data.aws_route53_zone.aisre[trimprefix(each.value, "www.")].zone_id
  name    = each.value
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.aisre[0].domain_name
    zone_id                = aws_cloudfront_distribution.aisre[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "aisre_ipv6" {
  for_each = var.enable_aisre_redirect ? toset(local.aisre_aliases) : toset([])

  zone_id = data.aws_route53_zone.aisre[trimprefix(each.value, "www.")].zone_id
  name    = each.value
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.aisre[0].domain_name
    zone_id                = aws_cloudfront_distribution.aisre[0].hosted_zone_id
    evaluate_target_health = false
  }
}
