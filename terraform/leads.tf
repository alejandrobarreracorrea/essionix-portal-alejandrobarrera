# ---------------------------------------------------------------------------
# Registro de usuarios (leads) — 100% serverless, prefijo ab-leads-*
# (permisos del pipeline: terraform/bootstrap). El sitio hace POST a la
# Function URL; el pipeline inyecta la URL en index.html al desplegar.
# ---------------------------------------------------------------------------

data "archive_file" "register" {
  type        = "zip"
  source_file = "${path.module}/lambda/register.py"
  output_path = "${path.module}/build/register.zip"
}

resource "aws_dynamodb_table" "leads" {
  name         = "ab-leads-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "email"

  attribute {
    name = "email"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = local.tags
}

resource "aws_iam_role" "leads_exec" {
  name = "ab-leads-exec-${var.environment}"
  tags = local.tags

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "leads_exec" {
  name = "ab-leads-exec-${var.environment}"
  role = aws_iam_role.leads_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "WriteLeads"
        Effect   = "Allow"
        Action   = ["dynamodb:UpdateItem", "dynamodb:GetItem"]
        Resource = aws_dynamodb_table.leads.arn
      },
      {
        Sid      = "SendVerification"
        Effect   = "Allow"
        Action   = ["ses:SendEmail"]
        Resource = aws_sesv2_email_identity.site.arn
      },
      {
        Sid      = "Logs"
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/ab-leads-*"
      },
    ]
  })
}

# Clave HMAC de los tokens de sesión (login sin contraseña). Vive solo en el
# estado remoto y en el env del Lambda; rotarla invalida todas las sesiones.
resource "random_password" "session_secret" {
  length  = 48
  special = false
}

resource "aws_lambda_function" "register" {
  function_name    = "ab-leads-register-${var.environment}"
  role             = aws_iam_role.leads_exec.arn
  runtime          = "python3.12"
  handler          = "register.handler"
  filename         = data.archive_file.register.output_path
  source_code_hash = data.archive_file.register.output_base64sha256
  timeout          = 10
  memory_size      = 128
  tags             = local.tags

  environment {
    variables = {
      TABLE_NAME     = aws_dynamodb_table.leads.name
      SENDER         = "Alejandro Barrera · IAOps <hola@${var.domain_name}>"
      SESSION_SECRET = random_password.session_secret.result
    }
  }
}

resource "aws_lambda_function_url" "register" {
  function_name      = aws_lambda_function.register.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = ["https://${var.domain_name}", "https://iaopslatam.com", "https://www.iaopslatam.com"]
    allow_methods = ["POST"]
    allow_headers = ["content-type"]
    max_age       = 86400
  }
}

resource "aws_lambda_permission" "register_url" {
  statement_id           = "AllowPublicFunctionUrl"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.register.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

# Desde oct-2025 las Function URL nuevas exigen TAMBIÉN lambda:InvokeFunction
# en la resource policy (si falta: 403 Forbidden aunque el auth sea NONE).
# Nota: FunctionUrlAuthType no es condicionable en esta acción.
resource "aws_lambda_permission" "register_url_invoke" {
  statement_id  = "AllowPublicFunctionUrlInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.register.function_name
  principal     = "*"
}

output "register_url" {
  description = "Function URL del registro de leads (el pipeline la inyecta en el sitio)"
  value       = aws_lambda_function_url.register.function_url
}
