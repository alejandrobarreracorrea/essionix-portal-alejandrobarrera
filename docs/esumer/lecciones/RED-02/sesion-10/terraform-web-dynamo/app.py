# La Lambda de la tienda: recibe pedidos de la página y los guarda en DynamoDB
import base64, json, os
from datetime import datetime, timezone

import boto3
from boto3.dynamodb.conditions import Key

tabla = boto3.resource("dynamodb").Table(os.environ["TABLA"])


def responder(codigo, datos):
    return {"statusCode": codigo, "headers": {"content-type": "application/json"}, "body": json.dumps(datos, default=str)}


def handler(event, context):
    metodo = event["requestContext"]["http"]["method"]

    if metodo == "POST":  # guardar un pedido
        cuerpo = event.get("body") or "{}"
        if event.get("isBase64Encoded"):
            cuerpo = base64.b64decode(cuerpo).decode()
        datos = json.loads(cuerpo)
        cliente = datos.get("cliente", "").strip().lower()
        if not cliente:
            return responder(400, {"error": "falta el cliente"})
        pedido = {
            "cliente": cliente,                                          # llave de partición
            "fecha": datetime.now(timezone.utc).isoformat(timespec="seconds"),  # llave de orden
            "producto": datos.get("producto", "camiseta"),
            "talla": datos.get("talla", "M"),
        }
        tabla.put_item(Item=pedido)  # PutItem
        return responder(200, pedido)

    # GET: ?cliente=camila → Query (solo su partición) · sin cliente → Scan (toda la tabla)
    cliente = ((event.get("queryStringParameters") or {}).get("cliente") or "").strip().lower()
    if cliente:
        items = tabla.query(KeyConditionExpression=Key("cliente").eq(cliente))["Items"]
        return responder(200, {"operacion": "Query", "pedidos": items})
    items = tabla.scan()["Items"]
    return responder(200, {"operacion": "Scan", "pedidos": items})
