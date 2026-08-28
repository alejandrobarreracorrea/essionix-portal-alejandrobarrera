# ---------------------------------------------------------------------------
# BOOTSTRAP (aplicar LOCALMENTE con credenciales admin, una sola vez):
# permisos que el rol OIDC del pipeline necesita para gestionar el stack de
# leads (ab-leads-*). Vive en un estado separado porque el propio pipeline
# no puede (ni debe) auto-otorgarse permisos.
#
#   cd terraform/bootstrap
#   terraform init \
#     -backend-config="bucket=essionix-s3-pdn-us-east-1-remotestates" \
#     -backend-config="key=essionix-portal-alejandrobarrera/bootstrap/terraform.tfstate" \
#     -backend-config="region=us-east-1"
#   terraform apply
# ---------------------------------------------------------------------------
terraform {
  required_version = ">= 1.8.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {}
}

provider "aws" {
  region = "us-east-1"
}

data "aws_caller_identity" "current" {}

resource "aws_iam_role_policy" "ab_leads_deploy" {
  name = "ab-leads-deploy"
  role = "essionix-role-pdn-us-east-1-oidc"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "LeadsLambda"
        Effect = "Allow"
        Action = "lambda:*"
        Resource = [
          "arn:aws:lambda:us-east-1:${data.aws_caller_identity.current.account_id}:function:ab-leads-*",
          "arn:aws:lambda:us-east-1:${data.aws_caller_identity.current.account_id}:function:ab-leads-*:*",
        ]
      },
      {
        Sid      = "LeadsDynamo"
        Effect   = "Allow"
        Action   = "dynamodb:*"
        Resource = "arn:aws:dynamodb:us-east-1:${data.aws_caller_identity.current.account_id}:table/ab-leads-*"
      },
      {
        Sid    = "LeadsIamRole"
        Effect = "Allow"
        Action = [
          "iam:CreateRole", "iam:DeleteRole", "iam:GetRole", "iam:TagRole", "iam:UntagRole",
          "iam:PutRolePolicy", "iam:GetRolePolicy", "iam:DeleteRolePolicy", "iam:ListRolePolicies",
          "iam:ListAttachedRolePolicies", "iam:AttachRolePolicy", "iam:DetachRolePolicy",
          "iam:ListInstanceProfilesForRole", "iam:UpdateAssumeRolePolicy", "iam:PassRole",
        ]
        Resource = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/ab-leads-*"
      },
      {
        Sid      = "LeadsLogs"
        Effect   = "Allow"
        Action   = "logs:*"
        Resource = "arn:aws:logs:us-east-1:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/ab-leads-*"
      },
    ]
  })
}
