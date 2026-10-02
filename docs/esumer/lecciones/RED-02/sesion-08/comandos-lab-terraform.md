# LAB Terraform · pyme-vpc + EC2 desde código (copiar y pegar en el chat)

_Código validado con Terraform 1.16.5 + provider AWS 6.x (`terraform validate` y `terraform plan` → 10 recursos), 2026-10-02._
Se trabaja en **AWS CloudShell** (ícono `>_` arriba a la derecha de la consola, región **us-east-1**).

**Paso 1 · Hablar con la API (CLI)**
```
aws sts get-caller-identity
aws ec2 describe-vpcs --query "Vpcs[].[VpcId,CidrBlock]" --output table
aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=CreateVpc --query "Events[].[EventTime,Username]" --output table
aws ec2 describe-key-pairs --query "KeyPairs[].KeyName" --output text
```
> CloudTrail guarda 90 días: ahí aparece el `CreateVpc` de cuando creaste tu VPC a clics.

**Paso 2 · Instalar Terraform y bajar el plano**
```
curl -sLo /tmp/tf.zip https://releases.hashicorp.com/terraform/1.16.5/terraform_1.16.5_linux_amd64.zip
mkdir -p ~/bin && unzip -oq /tmp/tf.zip -d ~/bin && export PATH=$HOME/bin:$PATH
terraform -version
mkdir -p ~/pyme-tf && cd ~/pyme-tf
curl -sO https://raw.githubusercontent.com/alejandrobarreracorrea/essionix-portal-alejandrobarrera/main/docs/esumer/lecciones/RED-02/sesion-08/terraform/main.tf
cat main.tf
```

**Paso 3 · Tus datos, init y plan** (tu IP: abre https://checkip.amazonaws.com en TU navegador)
```
printf 'mi_ip = "TU.IP.DE.CASA/32"\nllave = "NOMBRE-DE-TU-KEY-PAIR"\n' > terraform.tfvars
terraform init
terraform plan
```
→ `Plan: 10 to add, 0 to change, 0 to destroy.`

**Paso 4 · Construir**
```
terraform apply
```
Escribe `yes`. Espera 1–2 min y abre la URL de `tu_web`.

**Paso 5 · La magia y el destroy**
```
terraform plan
sed -i 's/"web-tf"/"web-terraform"/' main.tf && terraform apply
terraform destroy
```

> Si CloudShell se reinicia y "terraform: command not found": `export PATH=$HOME/bin:$PATH`.
> Si `InvalidKeyPair.NotFound`: el nombre de la llave en terraform.tfvars no coincide (paso 1, último comando).
> Si `VpcLimitExceeded`: máximo 5 VPC por región → borra VPC de pruebas que no uses.
> Si `t3.micro` no es elegible en tu cuenta: agrega `tipo_instancia = "t2.micro"` en terraform.tfvars.
> Nunca subas `terraform.tfstate` ni tu `.ppk` a GitHub.
