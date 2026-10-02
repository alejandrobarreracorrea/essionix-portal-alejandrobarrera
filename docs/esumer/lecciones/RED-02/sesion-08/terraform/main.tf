# =====================================================================
#  pyme-vpc en Terraform · Esumer · Cloud Computing, Redes y Ciberseguridad
#  Lo mismo que construimos a clics (VPC + 4 subredes + Internet Gateway
#  + ruta pública + Security Group + EC2 con NGINX), ahora como CÓDIGO.
#
#  Uso (en PowerShell de tu PC, con aws configure hecho):
#    terraform init
#    terraform plan  -var "mi_ip=TU.IP.DE.CASA/32" -var "llave=NOMBRE-DE-TU-KEY-PAIR"
#    terraform apply -var "mi_ip=TU.IP.DE.CASA/32" -var "llave=NOMBRE-DE-TU-KEY-PAIR"
#    terraform destroy (al final, para no dejar nada encendido)
# =====================================================================

# ---------- 1 · El traductor: Terraform habla con AWS a través del provider
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# ---------- 2 · Variables: lo que cambia de un estudiante a otro
variable "mi_ip" {
  description = "Tu IP de casa con /32 (búscala en https://checkip.amazonaws.com). Solo ella podrá entrar por SSH."
  type        = string
}

variable "llave" {
  description = "Nombre del key pair que ya tienes en EC2 (el de tu .ppk)."
  type        = string
}

variable "tipo_instancia" {
  description = "Tamaño de la EC2 (capa gratuita: t3.micro; cuentas antiguas: t2.micro)."
  type        = string
  default     = "t3.micro"
}

# ---------- 3 · La urbanización: la VPC (10.0.0.0/16 = 65.536 direcciones)
resource "aws_vpc" "pyme" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags                 = { Name = "pyme-vpc-tf" }
}

# ---------- 4 · Las calles: 4 subredes (el diseño VLSM de la clase de redes)
locals {
  subredes = {
    ventas = "10.0.1.0/26"   # 59 IPs útiles
    admin  = "10.0.1.64/27"  # 27 IPs útiles
    web    = "10.0.1.96/28"  # 11 IPs útiles  ← la pública
    bd     = "10.0.1.112/28" # 11 IPs útiles
  }
}

resource "aws_subnet" "area" {
  for_each                = local.subredes
  vpc_id                  = aws_vpc.pyme.id
  cidr_block              = each.value
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = each.key == "web" # IP pública automática solo en web
  tags                    = { Name = "${each.key}-tf" }
}

# ---------- 5 · La puerta a la calle: Internet Gateway
resource "aws_internet_gateway" "puerta" {
  vpc_id = aws_vpc.pyme.id
  tags   = { Name = "pyme-igw-tf" }
}

# ---------- 6 · El camino a la puerta: ruta 0.0.0.0/0 → IGW, solo para web
resource "aws_route_table" "publica" {
  vpc_id = aws_vpc.pyme.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.puerta.id
  }
  tags = { Name = "rt-publica-tf" }
}

resource "aws_route_table_association" "web" {
  subnet_id      = aws_subnet.area["web"].id
  route_table_id = aws_route_table.publica.id
}

# ---------- 7 · El portero: Security Group (80 para todos, 22 solo tu IP)
resource "aws_security_group" "web" {
  name        = "web-sg-tf"
  description = "HTTP para todos, SSH solo desde mi IP"
  vpc_id      = aws_vpc.pyme.id

  ingress {
    description = "Web"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "SSH solo mi IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.mi_ip]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "web-sg-tf" }
}

# ---------- 8 · La casa: EC2 con Amazon Linux 2023 + NGINX (se instala solo)
data "aws_ssm_parameter" "amazon_linux" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_instance" "web" {
  ami                    = data.aws_ssm_parameter.amazon_linux.value
  instance_type          = var.tipo_instancia
  subnet_id              = aws_subnet.area["web"].id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = var.llave

  # Una línea por comando (join): funciona igual si el archivo tiene saltos de línea de Windows
  user_data = join("\n", [
    "#!/bin/bash",
    "dnf install -y nginx",
    "echo '<h1>Hola desde Terraform &#128640;</h1><p>Esta red y este servidor nacieron de un archivo de codigo.</p>' > /usr/share/nginx/html/index.html",
    "systemctl enable --now nginx",
  ])

  tags = { Name = "web-tf" }
}

# ---------- 9 · Lo que Terraform te muestra al terminar
output "ip_publica" {
  value = aws_instance.web.public_ip
}

output "tu_web" {
  value = "http://${aws_instance.web.public_ip}"
}
