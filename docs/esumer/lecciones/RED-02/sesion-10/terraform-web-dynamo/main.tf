# =====================================================================
#  La tienda web de Laura: página en S3 que guarda pedidos en DynamoDB
#  Esumer · Cloud Computing, Redes y Ciberseguridad
#
#  Navegador → S3 (index.html) → API Gateway → Lambda → DynamoDB
#
#  Uso (terminal de VS Code, en la carpeta con main.tf, app.py e index.html):
#    terraform init
#    terraform apply      (1 minuto)
#    terraform destroy    (al final)
# =====================================================================

terraform {
  required_providers {
    aws     = { source = "hashicorp/aws", version = "~> 6.0" }
    archive = { source = "hashicorp/archive", version = "~> 2.0" }
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_caller_identity" "yo" {}

# ---------- 1 · La base: tabla DynamoDB (llave de partición + llave de orden)
resource "aws_dynamodb_table" "pedidos" {
  name         = "pedidos-web"
  billing_mode = "PAY_PER_REQUEST" # sin servidores: pagas por petición
  hash_key     = "cliente"         # llave de partición: reparte los datos
  range_key    = "fecha"           # llave de orden: ordena los pedidos de cada cliente

  attribute {
    name = "cliente"
    type = "S"
  }
  attribute {
    name = "fecha"
    type = "S"
  }
}

# ---------- 2 · El permiso de la Lambda: solo escribir y leer ESTA tabla
resource "aws_iam_role" "lambda" {
  name = "tienda-web-lambda"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy" "tabla" {
  name = "solo-tabla-pedidos"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Action = ["dynamodb:PutItem", "dynamodb:Query", "dynamodb:Scan"], Resource = aws_dynamodb_table.pedidos.arn }]
  })
}

resource "aws_iam_role_policy_attachment" "logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ---------- 3 · El cerebro: Lambda en Python (app.py)
data "archive_file" "app" {
  type        = "zip"
  source_file = "${path.module}/app.py"
  output_path = "${path.module}/app.zip"
}

resource "aws_lambda_function" "app" {
  function_name    = "tienda-web"
  role             = aws_iam_role.lambda.arn
  runtime          = "python3.12"
  handler          = "app.handler"
  filename         = data.archive_file.app.output_path
  source_code_hash = data.archive_file.app.output_base64sha256
  environment {
    variables = { TABLA = aws_dynamodb_table.pedidos.name }
  }
}

# ---------- 4 · La puerta: API Gateway (HTTP API) que llama a la Lambda
resource "aws_apigatewayv2_api" "api" {
  name          = "tienda-web-api"
  protocol_type = "HTTP"
  target        = aws_lambda_function.app.arn # crea la ruta y la etapa por defecto
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST"]
    allow_headers = ["content-type"]
  }
}

resource "aws_lambda_permission" "api" {
  statement_id  = "api-gateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.app.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*"
}

# ---------- 5 · La vitrina: bucket S3 con la página web
resource "aws_s3_bucket" "web" {
  bucket        = "tienda-web-${data.aws_caller_identity.yo.account_id}"
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "web" {
  bucket = aws_s3_bucket.web.id
  index_document { suffix = "index.html" }
}

resource "aws_s3_bucket_public_access_block" "web" {
  bucket                  = aws_s3_bucket.web.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "web" {
  bucket     = aws_s3_bucket.web.id
  depends_on = [aws_s3_bucket_public_access_block.web]
  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = "*", Action = "s3:GetObject", Resource = "${aws_s3_bucket.web.arn}/*" }]
  })
}

resource "aws_s3_object" "index" {
  bucket       = aws_s3_bucket.web.id
  key          = "index.html"
  content_type = "text/html; charset=utf-8"
  content      = templatefile("${path.module}/index.html", { api = aws_apigatewayv2_api.api.api_endpoint })
}

# ---------- Lo que necesitas al terminar
output "url_tienda" {
  value = "http://${aws_s3_bucket_website_configuration.web.website_endpoint}"
}
output "api" {
  value = aws_apigatewayv2_api.api.api_endpoint
}
