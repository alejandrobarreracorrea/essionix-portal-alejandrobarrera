# LAB A · DynamoDB + S3 desde la AWS CLI (copiar y pegar en el chat)

_Terminal de VS Code (PowerShell), dentro de la carpeta `lab-dynamo`. Sintaxis validada con la AWS CLI v2 (2026-10-09)._

**Paso 0 · Permisos y carpeta**
- IAM → Usuarios → `terraform-lab` → Agregar permisos → `AmazonDynamoDBFullAccess` (y `AmazonS3FullAccess` si no la tienes)
```
mkdir $HOME\lab-dynamo
code $HOME\lab-dynamo
```
Crea estos 5 archivos (mismo nombre, pega y Ctrl+S):

`camila.json`
```
{
  "cliente":   { "S": "camila" },
  "productos": { "L": [ { "S": "camiseta L" } ] },
  "valor":     { "N": "45" },
  "catalogo":  { "S": "catalogo.json" }
}
```

`pedro.json`
```
{
  "cliente":   { "S": "pedro" },
  "productos": { "L": [ { "S": "gorra" }, { "S": "buzo M" } ] },
  "valor":     { "N": "110" }
}
```

`llave.json`
```
{ "cliente": { "S": "camila" } }
```

`agregar.json`
```
{ ":p": { "L": [ { "S": "gorra" } ] }, ":v": { "N": "30" } }
```

`catalogo.json`
```
{
  "tienda": "Laura",
  "productos": [
    { "nombre": "camiseta", "precio": 45 },
    { "nombre": "gorra",    "precio": 30 },
    { "nombre": "buzo",     "precio": 80 }
  ]
}
```

**Paso 1 · DynamoDB: la tabla de carritos**
```
$T = "carritos-tunombre"
aws dynamodb create-table --table-name $T --attribute-definitions "AttributeName=cliente,AttributeType=S" --key-schema "AttributeName=cliente,KeyType=HASH" --billing-mode PAY_PER_REQUEST
aws dynamodb wait table-exists --table-name $T
aws dynamodb put-item --table-name $T --item file://camila.json
aws dynamodb put-item --table-name $T --item file://pedro.json
aws dynamodb get-item --table-name $T --key file://llave.json
aws dynamodb update-item --table-name $T --key file://llave.json --update-expression "SET productos = list_append(productos, :p), valor = valor + :v" --expression-attribute-values file://agregar.json --return-values ALL_NEW
aws dynamodb scan --table-name $T
```
Consola → DynamoDB → Tablas → tu tabla → **Explorar elementos** 📸

**Paso 2 · S3: el catálogo, privado**
```
$B = "tienda-laura-tunombre-123"
aws s3 mb "s3://$B"
aws s3 cp catalogo.json "s3://$B/"
aws s3 ls "s3://$B/"
aws s3 presign "s3://$B/catalogo.json" --expires-in 300
```
Abre `https://TU-BUCKET.s3.amazonaws.com/catalogo.json` → **AccessDenied** (privado). Abre el link de `presign` → se ve (vence en 5 min) 📸

**Limpieza (al final)**
```
aws dynamodb delete-table --table-name $T
aws s3 rb "s3://$B" --force
```

> Si sale *ResourceInUseException*: esa tabla ya existe → cambia el nombre en `$T`.
> Si sale *BucketAlreadyExists*: el nombre ya lo usa alguien en el mundo → cambia el número en `$B`.
> Si sale *AccessDeniedException* en DynamoDB: falta la política `AmazonDynamoDBFullAccess` en tu usuario.
> Si `file://` dice que no encuentra el archivo: la terminal no está dentro de `lab-dynamo` → `cd $HOME\lab-dynamo`.
