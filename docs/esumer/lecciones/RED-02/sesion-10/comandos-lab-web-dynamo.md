# LAB A · Tienda web en S3 que guarda en DynamoDB (copiar y pegar en el chat)

_Arquitectura: navegador → S3 (index.html) → API Gateway → Lambda (app.py) → DynamoDB. Terraform validado: `terraform plan` → **12 to add** (2026-10-09). Los 3 archivos están en `terraform-web-dynamo/`._

**Paso 0 · Permisos y carpeta**
- IAM → Usuarios → `terraform-lab` → Agregar permisos → `AmazonDynamoDBFullAccess`, `AWSLambda_FullAccess`, `AmazonAPIGatewayAdministrator`, `IAMFullAccess` (y `AmazonS3FullAccess` si no la tienes)
```
mkdir $HOME\tienda-web
code $HOME\tienda-web
```
Crea `main.tf`, `app.py` e `index.html` (copia el contenido de la presentación o de la carpeta `terraform-web-dynamo/`).

**Paso 1 · Desplegar y hacer pedidos**
```
terraform init
terraform apply
```
Abre `url_tienda`, guarda 3 pedidos (camila ×2, pedro ×1) y prueba **Ver todos (Scan)** vs **Ver solo este cliente (Query)**.
```
aws dynamodb describe-table --table-name pedidos-web --query "Table.KeySchema"
aws dynamodb scan --table-name pedidos-web --query "Count"
```
Consola → DynamoDB → `pedidos-web` → **Explorar elementos** 📸

**Paso 2 · Limpieza**
```
terraform destroy
```
→ `Destroy complete! Resources: 12 destroyed.`

> Si sale *AccessDenied* creando el rol: falta `IAMFullAccess` en `terraform-lab`.
> Si sale *LimitExceeded* al adjuntar políticas: un usuario tiene máximo 10; quita las de clases pasadas que no uses.
> Si la página dice "guardando…" y no avanza: abre F12 → Consola; si es CORS, revisa que `index.html` tenga `var API = "${api}";` tal cual.
> Si `terraform apply` falla en el bucket con *BucketAlreadyExists*: ya existe uno con ese nombre en tu cuenta → `terraform destroy` y vuelve a aplicar.
