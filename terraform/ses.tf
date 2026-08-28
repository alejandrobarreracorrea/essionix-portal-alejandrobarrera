# ---------------------------------------------------------------------------
# SES: identidad del dominio para enviar los códigos de verificación del
# registro (la cuenta ya está en producción). DKIM verificado vía Route53.
# ---------------------------------------------------------------------------

resource "aws_sesv2_email_identity" "site" {
  email_identity = var.domain_name
  tags           = local.tags
}

# 3 registros CNAME de DKIM en la zona existente.
resource "aws_route53_record" "ses_dkim" {
  count = var.enable_custom_domain ? 3 : 0

  zone_id = data.aws_route53_zone.site[0].zone_id
  name    = "${aws_sesv2_email_identity.site.dkim_signing_attributes[0].tokens[count.index]}._domainkey.${var.domain_name}"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_sesv2_email_identity.site.dkim_signing_attributes[0].tokens[count.index]}.dkim.amazonses.com"]
}

output "ses_identity_status" {
  description = "Estado de verificación de la identidad SES del dominio"
  value       = aws_sesv2_email_identity.site.verified_for_sending_status
}
