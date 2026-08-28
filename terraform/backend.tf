terraform {
  required_version = ">= 1.8.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }

  # Backend remoto S3 (mismo patrón que essionix-portal-solucionesanteladian).
  # bucket/key/region se pasan vía -backend-config en el pipeline / init local.
  backend "s3" {}
}
