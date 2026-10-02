# LAB Terraform · pyme-vpc + EC2 desde TU PC (copiar y pegar en el chat)

_Bloques probados en PowerShell 7 (pegado pieza por pieza → `terraform validate` OK en cada etapa, también con saltos de línea de Windows), 2026-10-02._
Todo se hace en **PowerShell de tu PC** (Inicio → PowerShell). Terraform ya quedó instalado en la clase 2.

**Paso 0 · Tu llave para la CLI (en la consola de AWS)**
1. Buscador → **IAM** → **Usuarios** → **Crear usuario** → nombre `terraform-lab` (casilla de acceso a la consola **vacía**).
2. **Establecer permisos** → *Adjuntar políticas directamente* → `AmazonEC2FullAccess`, `AmazonSSMReadOnlyAccess`, `AWSCloudTrail_ReadOnlyAccess` → Siguiente → **Crear usuario**.
3. Entra a `terraform-lab` → **Credenciales de seguridad** → **Crear clave de acceso** → caso de uso **Interfaz de línea de comandos (CLI)** → marca “Entiendo…” → Siguiente → **Crear clave de acceso**.
4. **Descargar archivo .csv** (la clave secreta se ve una sola vez).
> 🔐 Nunca pegues la llave en el chat, WhatsApp ni GitHub. Al chat solo: “listo 🔑”.

**Paso 1 · Prepara tu PC**
```
terraform -version
aws --version
```
Si `aws` no se reconoce:
```
winget install -e --id Amazon.AWSCLI
```
→ **cierra PowerShell y ábrelo de nuevo** y repite `aws --version`. Luego:
```
mkdir $HOME\pyme-tf
```

**Paso 2 · Conecta tu PC a AWS con tu llave**
```
aws configure
```
Pega el *Access key ID*, la *Secret access key*, región `us-east-1` y formato `json`.
```
aws sts get-caller-identity
aws ec2 describe-vpcs --query "Vpcs[].[VpcId,CidrBlock]" --output table
aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=CreateVpc --query "Events[].[EventTime,Username]" --output table
aws ec2 describe-key-pairs --query "KeyPairs[].KeyName" --output text
```
> `get-caller-identity` debe decir `user/terraform-lab`. CloudTrail guarda 90 días: ahí aparece el `CreateVpc` de cuando creaste tu VPC a clics.

**Paso 3 · Arma tu red pieza por pieza** (en el deck: diapositiva interactiva → toca la pieza → Copiar). Pega **cada bloque una sola vez**, en orden, y responde `yes`.

### 0 · El traductor y tus datos
Le dice a Terraform que hable con AWS en us-east-1 (el provider) y declara lo que cambia por estudiante: tu IP y tu key pair. init descarga el traductor. → verás: `Terraform has been successfully initialized! · y luego tu IP y tu key pair`
_1 · Plano base + init_
```powershell
New-Item -ItemType Directory -Force $HOME\pyme-tf | Out-Null
Set-Location $HOME\pyme-tf
@'
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 6.0" }
  }
}

provider "aws" {
  region = "us-east-1"
}

variable "mi_ip" { type = string } # tu IP de casa con /32
variable "llave" { type = string } # nombre de tu key pair
variable "tipo_instancia" {
  type    = string
  default = "t3.micro"
}
'@ | Set-Content -Encoding ascii main.tf
terraform init
```
_2 · Tus datos (detecta tu IP y te pregunta tu key pair)_
```powershell
Set-Location $HOME\pyme-tf; $k = Read-Host "Nombre de tu key pair"; $ip = (Invoke-RestMethod https://checkip.amazonaws.com).Trim(); Set-Content -Encoding ascii terraform.tfvars "mi_ip = `"$ip/32`"`nllave = `"$k`""; Get-Content terraform.tfvars
```

### 1 · La urbanización: la VPC
Un solo bloque = el botón «Crear VPC» que diste la clase pasada: 10.0.0.0/16. → verás: `Plan: 1 to add → escribe yes`
```powershell
Set-Location $HOME\pyme-tf
@'
# ---------- La urbanizacion: la VPC
resource "aws_vpc" "pyme" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags                 = { Name = "pyme-vpc-tf" }
}
'@ | Add-Content -Encoding ascii main.tf
terraform apply
```

### 2 · Las 4 calles: subredes
Con for_each, un bloque crea las 4 subredes. Fíjate en aws_vpc.pyme.id: así sabe en qué VPC van. Por eso la VPC va primero. → verás: `Plan: 4 to add → yes`
```powershell
Set-Location $HOME\pyme-tf
@'
# ---------- Las 4 calles: subredes (VLSM)
locals {
  subredes = {
    ventas = "10.0.1.0/26"
    admin  = "10.0.1.64/27"
    web    = "10.0.1.96/28"
    bd     = "10.0.1.112/28"
  }
}

resource "aws_subnet" "area" {
  for_each                = local.subredes
  vpc_id                  = aws_vpc.pyme.id
  cidr_block              = each.value
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = each.key == "web"
  tags                    = { Name = "${each.key}-tf" }
}
'@ | Add-Content -Encoding ascii main.tf
terraform apply
```

### 3 · Internet Gateway + tabla de rutas
La puerta a internet y el camino 0.0.0.0/0 → puerta, asociado solo a la calle web. Eso es lo que la vuelve pública. → verás: `Plan: 3 to add → yes`
```powershell
Set-Location $HOME\pyme-tf
@'
# ---------- La puerta a internet y el camino hacia ella
resource "aws_internet_gateway" "puerta" {
  vpc_id = aws_vpc.pyme.id
  tags   = { Name = "pyme-igw-tf" }
}

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
'@ | Add-Content -Encoding ascii main.tf
terraform apply
```

### 4 · El portero: Security Group
Puerto 80 abierto para todos (la página) y 22 solo para tu IP (el SSH). Usa var.mi_ip, el dato que diste en la base. → verás: `Plan: 1 to add → yes`
```powershell
Set-Location $HOME\pyme-tf
@'
# ---------- El portero: Security Group
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
'@ | Add-Content -Encoding ascii main.tf
terraform apply
```

### 5 · La casa: EC2 + NGINX + tu URL
Busca la AMI de Amazon Linux más reciente, lanza la EC2 en la calle web con el portero y le instala NGINX al nacer (user_data). Al final te entrega tu URL. → verás: `Plan: 1 to add → yes → tu_web = "http://…" (espera 1–2 min)`
```powershell
Set-Location $HOME\pyme-tf
@'
# ---------- La casa: EC2 con Amazon Linux 2023 + NGINX
data "aws_ssm_parameter" "amazon_linux" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_instance" "web" {
  ami                    = data.aws_ssm_parameter.amazon_linux.value
  instance_type          = var.tipo_instancia
  subnet_id              = aws_subnet.area["web"].id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = var.llave

  user_data = join("\n", [
    "#!/bin/bash",
    "dnf install -y nginx",
    "echo '<h1>Hola desde Terraform &#128640;</h1><p>Esta red y este servidor nacieron de un archivo de codigo.</p>' > /usr/share/nginx/html/index.html",
    "systemctl enable --now nginx",
  ])

  tags = { Name = "web-tf" }
}

output "tu_web" {
  value = "http://${aws_instance.web.public_ip}"
}
'@ | Add-Content -Encoding ascii main.tf
terraform apply
```

### 🧹 Borrar todo, en orden
Terraform borra los 10 recursos en orden inverso (primero la EC2, al final la VPC). Tu pyme-vpc hecha a clics no se toca. → verás: `Destroy complete! Resources: 10 destroyed.`
```powershell
Set-Location $HOME\pyme-tf
terraform destroy
```

**Paso 4 · La magia**
```powershell
Set-Location $HOME\pyme-tf; terraform plan
(Get-Content main.tf) -replace '"web-tf"','"web-terraform"' | Set-Content -Encoding ascii main.tf; terraform apply
```
→ `No changes` y luego `1 to change`. Al final, el bloque 🧹 Destroy.

**Cierre · apaga tu llave**
IAM → `terraform-lab` → Credenciales de seguridad → la clave → **Acciones → Desactivar** → **Eliminar**. Y en PowerShell: `Remove-Item $HOME\.aws\credentials`.

**Plan B (todo de una):** en `$HOME\pyme-tf`: `Invoke-WebRequest https://raw.githubusercontent.com/alejandrobarreracorrea/essionix-portal-alejandrobarrera/main/docs/esumer/lecciones/RED-02/sesion-08/terraform/main.tf -OutFile main.tf` + tus datos (bloque 0.2) + `terraform init; terraform apply`.

> ¿Mac/Linux? Usa la app Terminal: `brew install awscli`; los bloques funcionan en `pwsh` o cambia `@'…'@ | Add-Content` por `cat >> main.tf <<'EOF' … EOF`.
> Si `Duplicate resource …`: pegaste un bloque dos veces → `notepad main.tf` y borra la copia.
> Si `UnauthorizedOperation` / `AccessDenied`: a terraform-lab le falta una política (paso 0.2).
> Si `No valid credential sources found`: falta `aws configure` (paso 2).
> Si `InvalidKeyPair.NotFound`: el nombre de la llave en terraform.tfvars no coincide (paso 2, último comando).
> Si `VpcLimitExceeded`: máximo 5 VPC por región → borra VPC de pruebas que no uses.
> Si `t3.micro` no es elegible en tu cuenta: `Add-Content -Encoding ascii terraform.tfvars 'tipo_instancia = "t2.micro"'`.
> Los bloques usan `-Encoding ascii` a propósito (sin tildes ni emojis): así Windows no mete caracteres raros que Terraform rechace.
> Nunca subas `terraform.tfstate`, tu `.ppk` ni el `.csv` de la llave a GitHub.
