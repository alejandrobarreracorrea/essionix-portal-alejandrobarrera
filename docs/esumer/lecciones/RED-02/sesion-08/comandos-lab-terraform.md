# LAB Terraform · pyme-vpc + EC2 desde TU PC (copiar y pegar en el chat)

_Bloques validados con `terraform validate` (el main.tf armado pieza por pieza), 2026-10-02._
Todo se hace en **tu PC con VS Code**: el editor para main.tf y su terminal (**Terminal → New Terminal**, PowerShell) para los comandos. Terraform ya quedó instalado en la clase 2.

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
code $HOME\pyme-tf
```
(o en VS Code: **File → Open Folder → pyme-tf**)

**Paso 2 · Conecta tu PC a AWS con tu llave**
```
aws configure
```
Pega el *Access key ID*, la *Secret access key*, región `us-east-1` y formato `json`.
```
aws sts get-caller-identity
aws ec2 describe-vpcs --query "Vpcs[].[VpcId,CidrBlock]" --output table
aws cloudtrail lookup-events --lookup-attributes "AttributeKey=EventName,AttributeValue=CreateVpc" --query "Events[].[EventTime,Username]" --output table
aws ec2 describe-key-pairs --query "KeyPairs[].KeyName" --output text
```
> `get-caller-identity` debe decir `user/terraform-lab`. CloudTrail guarda 90 días: ahí aparece el `CreateVpc` de cuando creaste tu VPC a clics.

**Demo · una VPC por CLI (diapositiva "¿Por qué nació Terraform?" → botón 🧪)**
```powershell
aws ec2 create-vpc --cidr-block 10.2.0.0/16 --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=vpc-cli}]" --query Vpc.VpcId --output text
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=vpc-cli" --query "Vpcs[].[VpcId,CidrBlock,State]" --output table
```
Corre el primero **otra vez** y vuelve a mirar: ¡dos `vpc-cli`! (el problema de los scripts). Luego bórralas (máximo 5 VPC por región):
```powershell
foreach ($id in (aws ec2 describe-vpcs --filters "Name=tag:Name,Values=vpc-cli" --query "Vpcs[].VpcId" --output text).Split()) { aws ec2 delete-vpc --vpc-id $id; "borrada: $id" }
```

**Paso 3 · Arma tu red pieza por pieza** (en el deck: diapositiva interactiva → toca la pieza → Copiar). Pega **cada bloque una sola vez al final de main.tf**, guarda con **Ctrl+S** y en la terminal corre el comando; responde `yes`.

### 0 · El traductor y tus datos
En la carpeta pyme-tf (abierta en VS Code) crea main.tf con este bloque: le dice a Terraform que hable con AWS en us-east-1 (el provider) y declara lo que cambia por estudiante. Crea también terraform.tfvars con tus datos. → verás: `Terraform has been successfully initialized!`
_Crea main.tf, pega esto y guarda (Ctrl+S)_
```hcl
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
```
_Crea terraform.tfvars, pon tus datos y guarda_
```hcl
mi_ip = "TU.IP.DE.CASA/32"   # mírala en https://checkip.amazonaws.com
llave = "NOMBRE-DE-TU-KEY-PAIR"
```
_En la terminal de VS Code_
```powershell
terraform init
```

### 1 · La urbanización: la VPC
Un solo bloque = el botón «Crear VPC» que diste la clase pasada: 10.0.0.0/16. → verás: `Plan: 1 to add → escribe yes`
_Pégalo al final de main.tf y guarda (Ctrl+S)_
```hcl
# ---------- La urbanización: la VPC
resource "aws_vpc" "pyme" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags                 = { Name = "pyme-vpc-tf" }
}
```
_En la terminal de VS Code_
```powershell
terraform apply
```

### 2 · Las 4 calles: subredes
Con for_each, un bloque crea las 4 subredes. Fíjate en aws_vpc.pyme.id: así sabe en qué VPC van. Por eso la VPC va primero. → verás: `Plan: 4 to add → yes`
_Pégalo al final de main.tf y guarda (Ctrl+S)_
```hcl
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
```
_En la terminal de VS Code_
```powershell
terraform apply
```

### 3 · Internet Gateway + tabla de rutas
La puerta a internet y el camino 0.0.0.0/0 → puerta, asociado solo a la calle web. Eso es lo que la vuelve pública. → verás: `Plan: 3 to add → yes`
_Pégalo al final de main.tf y guarda (Ctrl+S)_
```hcl
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
```
_En la terminal de VS Code_
```powershell
terraform apply
```

### 4 · El portero: Security Group
Puerto 80 abierto para todos (la página) y 22 solo para tu IP (el SSH). Usa var.mi_ip, el dato de tu terraform.tfvars. → verás: `Plan: 1 to add → yes`
_Pégalo al final de main.tf y guarda (Ctrl+S)_
```hcl
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
```
_En la terminal de VS Code_
```powershell
terraform apply
```

### 5 · La casa: EC2 + NGINX + tu URL
Busca la AMI de Amazon Linux más reciente, lanza la EC2 en la calle web con el portero y le instala NGINX al nacer (user_data). Al final te entrega tu URL. → verás: `Plan: 1 to add → yes → tu_web = "http://…" (espera 1–2 min)`
_Pégalo al final de main.tf y guarda (Ctrl+S)_
```hcl
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
```
_En la terminal de VS Code_
```powershell
terraform apply
```

### 🧹 Borrar todo, en orden
Terraform borra los 10 recursos en orden inverso (primero la EC2, al final la VPC). Tu pyme-vpc hecha a clics no se toca. → verás: `Destroy complete! Resources: 10 destroyed.`
_En la terminal de VS Code_
```powershell
terraform destroy
```

**Paso 4 · La magia**
1. En la terminal: `terraform plan` → `No changes`.
2. En main.tf cambia `Name = "web-tf"` por `Name = "web-terraform"` → **Ctrl+S** → `terraform apply` → `1 to change`.
3. Al final, el bloque 🧹 Destroy.

**Cierre · apaga tu llave**
IAM → `terraform-lab` → Credenciales de seguridad → la clave → **Acciones → Desactivar** → **Eliminar**. Y en la terminal: `Remove-Item $HOME\.aws\credentials`.

**Plan B (todo de una):** descarga el archivo completo en la carpeta: `Invoke-WebRequest https://raw.githubusercontent.com/alejandrobarreracorrea/essionix-portal-alejandrobarrera/main/docs/esumer/lecciones/RED-02/sesion-08/terraform/main.tf -OutFile main.tf` + tu terraform.tfvars + `terraform init; terraform apply`.

> Tu IP de casa: abre https://checkip.amazonaws.com en el navegador y agrégale `/32`.
> Si `Duplicate resource …`: pegaste un bloque dos veces → bórralo en main.tf y guarda.
> Si `Reference to undeclared resource`: pegaste una pieza antes de la que necesita (respeta el orden 0→5).
> Si `UnauthorizedOperation` / `AccessDenied`: a terraform-lab le falta una política (paso 0.2).
> Si `No valid credential sources found`: falta `aws configure` (paso 2).
> Si `InvalidKeyPair.NotFound`: el nombre en terraform.tfvars no coincide con tu key pair (paso 2, último comando).
> Si `VpcLimitExceeded`: máximo 5 VPC por región → borra VPC de pruebas que no uses.
> Si `t3.micro` no es elegible en tu cuenta: agrega `tipo_instancia = "t2.micro"` en terraform.tfvars.
> ¿No guardaste? Si `terraform apply` dice `No changes` justo después de pegar, te faltó **Ctrl+S**.
> Nunca subas `terraform.tfstate`, `terraform.tfvars`, tu `.ppk` ni el `.csv` de la llave a GitHub.
