# LAB Terraform · pyme-vpc + EC2 desde código (copiar y pegar en el chat)

_Bloques validados con Terraform (`terraform validate` en cada etapa, `plan` completo → 10 recursos), 2026-10-02._
Se trabaja en **AWS CloudShell** (ícono `>_` arriba a la derecha de la consola, región **us-east-1**).

**Paso 0 · Tu llave para la CLI (en la consola)**
1. Buscador → **IAM** → **Usuarios** → **Crear usuario** → nombre `terraform-lab` (casilla de acceso a la consola **vacía**).
2. **Establecer permisos** → *Adjuntar políticas directamente* → `AmazonEC2FullAccess`, `AmazonSSMReadOnlyAccess`, `AWSCloudTrail_ReadOnlyAccess` → Siguiente → **Crear usuario**.
3. Entra a `terraform-lab` → **Credenciales de seguridad** → **Crear clave de acceso** → caso de uso **Interfaz de línea de comandos (CLI)** → marca “Entiendo…” → Siguiente → **Crear clave de acceso**.
4. **Descargar archivo .csv** (la clave secreta se ve una sola vez).
> 🔐 Nunca pegues la llave en el chat, WhatsApp ni GitHub. Al chat solo: “listo 🔑”.

**Paso 1 · Configurar la llave y hablar con la API (CLI)**
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

**Paso 2 · Instalar Terraform**
```
curl -sLo /tmp/tf.zip https://releases.hashicorp.com/terraform/1.16.5/terraform_1.16.5_linux_amd64.zip
mkdir -p ~/bin && unzip -oq /tmp/tf.zip -d ~/bin && export PATH=$HOME/bin:$PATH
terraform -version
```

**Paso 3 · Arma tu red pieza por pieza** (en el deck: diapositiva interactiva → toca la pieza → Copiar). Pega **cada bloque una sola vez**, en orden, y responde `yes`.

### 0 · El traductor y tus datos
Le dice a Terraform que hable con AWS en us-east-1 (el provider) y declara lo que cambia por estudiante: tu IP y tu key pair. init descarga el traductor. → verás: `Terraform has been successfully initialized!`
_1 · Plano base + init_
```
mkdir -p ~/pyme-tf && cd ~/pyme-tf && export PATH=$HOME/bin:$PATH
cat > main.tf <<'EOF'
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
EOF
terraform init
```
_2 · Tus datos (te pregunta tu IP y tu key pair)_
```
cd ~/pyme-tf && read -p "Tu IP de casa (mírala en checkip.amazonaws.com): " IP && read -p "Nombre de tu key pair: " K && printf 'mi_ip = "%s/32"\nllave = "%s"\n' "$IP" "$K" > terraform.tfvars && cat terraform.tfvars
```

### 1 · La urbanización: la VPC
Un solo bloque = el botón «Crear VPC» que diste la clase pasada: 10.0.0.0/16. → verás: `Plan: 1 to add → escribe yes`
```
cd ~/pyme-tf && export PATH=$HOME/bin:$PATH
cat >> main.tf <<'EOF'
# ---------- La urbanización: la VPC
resource "aws_vpc" "pyme" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags                 = { Name = "pyme-vpc-tf" }
}
EOF
terraform apply
```

### 2 · Las 4 calles: subredes
Con for_each, un bloque crea las 4 subredes. Fíjate en aws_vpc.pyme.id: así sabe en qué VPC van. Por eso la VPC va primero. → verás: `Plan: 4 to add → yes`
```
cd ~/pyme-tf && export PATH=$HOME/bin:$PATH
cat >> main.tf <<'EOF'
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
EOF
terraform apply
```

### 3 · Internet Gateway + tabla de rutas
La puerta a internet y el camino 0.0.0.0/0 → puerta, asociado solo a la calle web. Eso es lo que la vuelve pública. → verás: `Plan: 3 to add → yes`
```
cd ~/pyme-tf && export PATH=$HOME/bin:$PATH
cat >> main.tf <<'EOF'
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
EOF
terraform apply
```

### 4 · El portero: Security Group
Puerto 80 abierto para todos (la página) y 22 solo para tu IP (el SSH). Usa var.mi_ip, el dato que diste en la base. → verás: `Plan: 1 to add → yes`
```
cd ~/pyme-tf && export PATH=$HOME/bin:$PATH
cat >> main.tf <<'EOF'
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
EOF
terraform apply
```

### 5 · La casa: EC2 + NGINX + tu URL
Busca la AMI de Amazon Linux más reciente, lanza la EC2 en la calle web con el portero y le instala NGINX al nacer (user_data). Al final te entrega tu URL. → verás: `Plan: 1 to add → yes → tu_web = "http://…" (espera 1–2 min)`
```
cd ~/pyme-tf && export PATH=$HOME/bin:$PATH
cat >> main.tf <<'EOF'
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

  user_data = <<-SCRIPT
    #!/bin/bash
    dnf install -y nginx
    echo "<h1>Hola desde Terraform 🚀</h1><p>Esta red y este servidor nacieron de un archivo de código.</p>" > /usr/share/nginx/html/index.html
    systemctl enable --now nginx
  SCRIPT

  tags = { Name = "web-tf" }
}

output "tu_web" {
  value = "http://${aws_instance.web.public_ip}"
}
EOF
terraform apply
```

### 🧹 Borrar todo, en orden
Terraform borra los 10 recursos en orden inverso (primero la EC2, al final la VPC). Tu pyme-vpc hecha a clics no se toca. → verás: `Destroy complete! Resources: 10 destroyed.`
```
cd ~/pyme-tf && export PATH=$HOME/bin:$PATH
terraform destroy
```

**Paso 4 · La magia**
```
cd ~/pyme-tf && terraform plan
sed -i 's/"web-tf"/"web-terraform"/' main.tf && terraform apply
```
→ `No changes` y luego `1 to change`. Al final, el bloque 🧹 Destroy.

**Cierre · apaga tu llave**
IAM → `terraform-lab` → Credenciales de seguridad → la clave → **Acciones → Desactivar** → **Eliminar**. Y en CloudShell: `rm ~/.aws/credentials`.

**Plan B (todo de una):** `cd ~/pyme-tf && curl -sO https://raw.githubusercontent.com/alejandrobarreracorrea/essionix-portal-alejandrobarrera/main/docs/esumer/lecciones/RED-02/sesion-08/terraform/main.tf` (archivo completo; ya incluye las variables) + tus datos (bloque 0.2) + `terraform init && terraform apply`.

> Si CloudShell se reinicia y "terraform: command not found": `export PATH=$HOME/bin:$PATH` (cada bloque ya lo incluye).
> Si `Duplicate resource …`: pegaste un bloque dos veces → `nano ~/pyme-tf/main.tf` y borra la copia.
> Si `UnauthorizedOperation` / `AccessDenied`: a terraform-lab le falta una política (paso 0.2).
> Si `InvalidKeyPair.NotFound`: el nombre de la llave en terraform.tfvars no coincide (paso 1, último comando).
> Si `VpcLimitExceeded`: máximo 5 VPC por región → borra VPC de pruebas que no uses.
> Si `t3.micro` no es elegible en tu cuenta: `echo 'tipo_instancia = "t2.micro"' >> ~/pyme-tf/terraform.tfvars`.
> Nunca subas `terraform.tfstate`, tu `.ppk` ni el `.csv` de la llave a GitHub.
