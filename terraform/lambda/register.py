"""ab-leads-register: registro de usuarios (leads) del portal.

Function URL (POST). Valida, aplica honeypot y guarda/actualiza el lead en
DynamoDB de forma idempotente (created_at solo se escribe la primera vez).
CORS lo gestiona la configuración de la Function URL.
"""
import json
import os
import re
import time

import boto3

TABLE = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")
INTERESES = {"comunidad", "mentoria", "charlas", "todo"}


def _resp(status, payload):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload),
    }


def handler(event, _context):
    method = (event.get("requestContext", {}).get("http", {}) or {}).get("method", "")
    if method != "POST":
        return _resp(405, {"ok": False, "error": "method"})

    try:
        body = json.loads(event.get("body") or "{}")
    except (ValueError, TypeError):
        return _resp(400, {"ok": False, "error": "json"})

    # Honeypot: los bots llenan el campo oculto; respondemos ok sin guardar.
    if (body.get("web") or "").strip():
        return _resp(200, {"ok": True})

    email = (body.get("email") or "").strip().lower()
    nombre = (body.get("nombre") or "").strip()
    whatsapp = re.sub(r"[^\d+]", "", body.get("whatsapp") or "")[:20]
    interes = (body.get("interes") or "comunidad").strip().lower()
    if interes not in INTERESES:
        interes = "comunidad"

    if not EMAIL_RE.match(email) or len(email) > 120:
        return _resp(400, {"ok": False, "error": "email"})
    if not 2 <= len(nombre) <= 80:
        return _resp(400, {"ok": False, "error": "nombre"})

    now = int(time.time())
    TABLE.update_item(
        Key={"email": email},
        UpdateExpression=(
            "SET nombre = :n, whatsapp = :w, interes = :i, updated_at = :t, "
            "created_at = if_not_exists(created_at, :t), #src = if_not_exists(#src, :s)"
        ),
        ExpressionAttributeNames={"#src": "source"},
        ExpressionAttributeValues={
            ":n": nombre,
            ":w": whatsapp,
            ":i": interes,
            ":t": now,
            ":s": "web",
        },
    )
    return _resp(200, {"ok": True})
