variable "environment" {
  description = "Entorno de despliegue (ej. pdn)"
  type        = string
  default     = "pdn"
}

variable "aws_region" {
  description = "Región principal. CloudFront/ACM requieren us-east-1."
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Dominio apex del sitio (zona Route53 ya existente en la cuenta)"
  type        = string
  default     = "alejandrobarrera.net"
}

# ---------------------------------------------------------------------------
# Interruptor del dominio propio. A diferencia de solucionesanteladian, aquí
# la zona Route53 y el certificado ACM YA EXISTEN (se referencian con data
# sources, no se crean). El toggle existe por el conflicto de alias CNAME:
# un mismo alias no puede vivir en dos distribuciones de CloudFront a la vez.
#
#  - false (default): la distro nueva se crea SIN aliases (certificado por
#    defecto de CloudFront). El sitio se revisa por la URL *.cloudfront.net,
#    sin tocar la distribución/dominio legacy.
#  - true (cutover): requiere haber liberado antes el alias en la distro vieja.
#    La distro nueva toma el alias del dominio con el cert ACM existente y
#    Route53 (apex + www) apunta a ella.
# ---------------------------------------------------------------------------
variable "enable_custom_domain" {
  description = "Activa el dominio propio (alias + cert ACM existente + registros Route53). Encender SOLO tras liberar el alias en la distro legacy."
  type        = bool
  default     = false
}

variable "include_www" {
  description = "Incluir www.<dominio> como alias adicional (requiere que el cert ACM cubra el SAN www)."
  type        = bool
  default     = false
}
