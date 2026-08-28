"""ab-leads-register: registro de usuarios con verificación por código al correo.

Acciones (POST JSON, campo "action"):
  register -> valida perfil, guarda lead (no verificado), envía código de 6 dígitos vía SES
  verify   -> compara código (expira a los 10 min, máx. 6 intentos) y marca verified=true
  resend   -> reenvía código (cooldown 60 s, máx. 6 envíos/día)

CORS lo gestiona la Function URL. Honeypot: campo "web".
"""
import json
import os
import re
import secrets
import time

import boto3

TABLE = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])
SES = boto3.client("sesv2")
SENDER = os.environ["SENDER"]

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")
PAISES = {"colombia", "mexico", "peru", "ecuador", "argentina", "chile", "bolivia", "venezuela", "espana", "otro"}
DEDICACIONES = {"estudiante", "onprem", "cloud", "dev", "datos", "otro"}
CANALES = {"clases", "linkedin", "evento", "amigo", "otro"}
INTERESES = {"comunidad", "mentoria", "charlas", "todo"}

CODE_TTL = 600          # 10 min
MAX_ATTEMPTS = 6
RESEND_COOLDOWN = 60    # seg
MAX_SENDS_DAY = 6


def _resp(status, payload):
    return {"statusCode": status, "headers": {"Content-Type": "application/json"}, "body": json.dumps(payload)}


def _get(email):
    return TABLE.get_item(Key={"email": email}).get("Item")


def _send_code(email, nombre, code):
    primer_nombre = (nombre or "").split(" ")[0] or "hola"
    SES.send_email(
        FromEmailAddress=SENDER,
        Destination={"ToAddresses": [email]},
        Content={"Simple": {
            "Subject": {"Data": f"{code} es tu código — IAOps · Alejandro Barrera", "Charset": "UTF-8"},
            "Body": {
                "Text": {"Charset": "UTF-8", "Data": (
                    f"Hola {primer_nombre},\n\nTu código de verificación es: {code}\n"
                    f"Vence en 10 minutos.\n\nSi no fuiste tú, ignora este correo.\n\n"
                    f"— Alejandro Barrera · IAOps\nhttps://alejandrobarrera.net")},
                "Html": {"Charset": "UTF-8", "Data": (
                    "<div style='background:#08080b;color:#f5f5f7;font-family:Arial,sans-serif;"
                    "padding:40px;border-radius:16px;max-width:520px;margin:auto'>"
                    "<p style='color:#9a8cff;font-size:13px;letter-spacing:2px;margin:0 0 18px'>"
                    "IAOPS · LA IA EJECUTA. TÚ DIRIGES.</p>"
                    f"<p style='font-size:16px;margin:0 0 8px'>Hola {primer_nombre}, tu código de verificación:</p>"
                    f"<p style='font-size:44px;font-weight:bold;letter-spacing:10px;margin:16px 0;"
                    f"color:#38e0d8'>{code}</p>"
                    "<p style='color:#9c9caa;font-size:13px'>Vence en 10 minutos. Si no fuiste tú, ignora este correo.</p>"
                    "<p style='color:#66666f;font-size:12px;margin-top:28px'>— Alejandro Barrera · "
                    "<a href='https://alejandrobarrera.net' style='color:#9a8cff'>alejandrobarrera.net</a></p></div>")},
            },
        }},
    )


def _issue_code(email, nombre, item):
    """Genera, guarda y envía un código nuevo. Devuelve respuesta HTTP."""
    now = int(time.time())
    if item:
        if now - int(item.get("last_send", 0)) < RESEND_COOLDOWN:
            return _resp(429, {"ok": False, "error": "cooldown"})
        window_start = int(item.get("send_window", 0))
        sends = int(item.get("send_count", 0))
        if now - window_start > 86400:
            window_start, sends = now, 0
        if sends >= MAX_SENDS_DAY:
            return _resp(429, {"ok": False, "error": "max_sends"})
    else:
        window_start, sends = now, 0

    code = f"{secrets.randbelow(1000000):06d}"
    TABLE.update_item(
        Key={"email": email},
        UpdateExpression=(
            "SET verify_code = :c, verify_expires = :e, attempts = :z, "
            "last_send = :t, send_window = :ws, send_count = :sc"
        ),
        ExpressionAttributeValues={
            ":c": code, ":e": now + CODE_TTL, ":z": 0,
            ":t": now, ":ws": window_start, ":sc": sends + 1,
        },
    )
    _send_code(email, nombre, code)
    return _resp(200, {"ok": True, "sent": True})


def handler(event, _context):
    method = (event.get("requestContext", {}).get("http", {}) or {}).get("method", "")
    if method != "POST":
        return _resp(405, {"ok": False, "error": "method"})
    try:
        body = json.loads(event.get("body") or "{}")
    except (ValueError, TypeError):
        return _resp(400, {"ok": False, "error": "json"})

    action = (body.get("action") or "register").strip().lower()
    email = (body.get("email") or "").strip().lower()
    if not EMAIL_RE.match(email) or len(email) > 120:
        return _resp(400, {"ok": False, "error": "email"})

    now = int(time.time())

    # ---------------- register ----------------
    if action == "register":
        if (body.get("web") or "").strip():          # honeypot
            return _resp(200, {"ok": True, "sent": True})

        nombre = (body.get("nombre") or "").strip()
        if not 2 <= len(nombre) <= 80:
            return _resp(400, {"ok": False, "error": "nombre"})

        pais = (body.get("pais") or "").strip().lower()
        dedicacion = (body.get("dedicacion") or "").strip().lower()
        canal = (body.get("canal") or "").strip().lower()
        interes = (body.get("interes") or "comunidad").strip().lower()
        if pais not in PAISES or dedicacion not in DEDICACIONES or canal not in CANALES:
            return _resp(400, {"ok": False, "error": "campos"})
        if interes not in INTERESES:
            interes = "comunidad"

        whatsapp = re.sub(r"[^\d+]", "", body.get("whatsapp") or "")[:20]
        rol = (body.get("rol") or "").strip()[:80]
        empresa = (body.get("empresa") or "").strip()[:100]
        linkedin = (body.get("linkedin") or "").strip()[:150]

        item = _get(email)
        TABLE.update_item(
            Key={"email": email},
            UpdateExpression=(
                "SET nombre = :n, pais = :p, dedicacion = :d, canal = :ca, interes = :i, "
                "whatsapp = :w, rol = :r, empresa = :em, linkedin = :l, updated_at = :t, "
                "created_at = if_not_exists(created_at, :t), verified = if_not_exists(verified, :f), "
                "#src = if_not_exists(#src, :s)"
            ),
            ExpressionAttributeNames={"#src": "source"},
            ExpressionAttributeValues={
                ":n": nombre, ":p": pais, ":d": dedicacion, ":ca": canal, ":i": interes,
                ":w": whatsapp, ":r": rol, ":em": empresa, ":l": linkedin,
                ":t": now, ":f": False, ":s": "web",
            },
        )
        item = _get(email)
        if item.get("verified"):
            return _resp(200, {"ok": True, "verified": True})
        return _issue_code(email, nombre, item)

    # ---------------- verify ----------------
    if action == "verify":
        code = re.sub(r"\D", "", body.get("code") or "")
        item = _get(email)
        if not item:
            return _resp(400, {"ok": False, "error": "desconocido"})
        if item.get("verified"):
            return _resp(200, {"ok": True, "verified": True})
        if int(item.get("attempts", 0)) >= MAX_ATTEMPTS:
            return _resp(429, {"ok": False, "error": "max_attempts"})
        if now > int(item.get("verify_expires", 0)):
            return _resp(400, {"ok": False, "error": "expirado"})
        if code != item.get("verify_code"):
            TABLE.update_item(Key={"email": email},
                              UpdateExpression="SET attempts = attempts + :one",
                              ExpressionAttributeValues={":one": 1})
            return _resp(400, {"ok": False, "error": "codigo"})
        TABLE.update_item(
            Key={"email": email},
            UpdateExpression="SET verified = :v, verified_at = :t REMOVE verify_code, verify_expires, attempts",
            ExpressionAttributeValues={":v": True, ":t": now},
        )
        return _resp(200, {"ok": True, "verified": True})

    # ---------------- resend ----------------
    if action == "resend":
        item = _get(email)
        if not item:
            return _resp(400, {"ok": False, "error": "desconocido"})
        if item.get("verified"):
            return _resp(200, {"ok": True, "verified": True})
        return _issue_code(email, item.get("nombre", ""), item)

    return _resp(400, {"ok": False, "error": "action"})
