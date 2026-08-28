"""ab-leads-register: registro con verificación por código, login sin contraseña y progreso.

Flujo (POST JSON, campo "action"):
  register -> mínimo viable (nombre + email), guarda lead y envía código de 6 dígitos
  verify   -> valida código (10 min, máx. 6 intentos), marca verified=true y emite
              token de sesión (HMAC, 30 días) — el mismo flujo firma registro y login
  resend   -> reenvía código (cooldown 60 s, máx. 6 envíos/día)
  login    -> envía código SOLO si el email ya es miembro (si no: error "desconocido")
  profile  -> enriquecimiento opcional post-firma (país, dedicación, rol, empresa,
              linkedin, canal, interés, whatsapp) — cada campo se guarda si viene
  me       -> (token) nombre + progreso del miembro
  progress -> (token) marca una clase del catálogo como completada

CORS lo gestiona la Function URL. Honeypot: campo "web" en register/login.
"""
import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import time

import boto3

TABLE = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])
SES = boto3.client("sesv2")
SENDER = os.environ["SENDER"]
SESSION_SECRET = os.environ["SESSION_SECRET"].encode()

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")
PAISES = {"colombia", "mexico", "peru", "ecuador", "argentina", "chile", "bolivia", "venezuela", "espana", "otro"}
DEDICACIONES = {"estudiante", "onprem", "cloud", "dev", "datos", "otro"}
CANALES = {"clases", "linkedin", "evento", "amigo", "otro"}
INTERESES = {"comunidad", "mentoria", "charlas", "todo"}

CODE_TTL = 600
MAX_ATTEMPTS = 6
RESEND_COOLDOWN = 60
MAX_SENDS_DAY = 6
SESSION_TTL = 30 * 86400
CLASES = {f"a{n}" for n in range(1, 13)}  # ids del catálogo público (/cursos)


def _b64e(raw):
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def _b64d(text):
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def _issue_token(email):
    exp = int(time.time()) + SESSION_TTL
    mac = hmac.new(SESSION_SECRET, f"{email}|{exp}".encode(), hashlib.sha256).hexdigest()
    return f"{_b64e(email.encode())}.{exp}.{mac}"


def _token_email(token):
    """Devuelve el email del token si la firma es válida y no expiró; si no, None."""
    try:
        email_b64, exp_raw, mac = token.split(".")
        email = _b64d(email_b64).decode()
        exp = int(exp_raw)
    except (ValueError, AttributeError):
        return None
    if time.time() > exp:
        return None
    good = hmac.new(SESSION_SECRET, f"{email}|{exp}".encode(), hashlib.sha256).hexdigest()
    return email if hmac.compare_digest(mac, good) else None


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
            "Subject": {"Data": f"{code} es tu firma — IAOps · Alejandro Barrera", "Charset": "UTF-8"},
            "Body": {
                "Text": {"Charset": "UTF-8", "Data": (
                    f"Hola {primer_nombre},\n\nEn IAOps nada importante pasa sin firma. "
                    f"Esta es la tuya: {code}\nVence en 10 minutos.\n\n"
                    f"Si no fuiste tú, ignora este correo.\n\n"
                    f"— Alejandro Barrera · IAOps\nhttps://alejandrobarrera.net")},
                "Html": {"Charset": "UTF-8", "Data": (
                    "<div style='background:#08080b;color:#f5f5f7;font-family:Arial,sans-serif;"
                    "padding:40px;border-radius:16px;max-width:520px;margin:auto'>"
                    "<p style='color:#9a8cff;font-size:13px;letter-spacing:2px;margin:0 0 18px'>"
                    "IAOPS · LA IA EJECUTA. TÚ DIRIGES.</p>"
                    f"<p style='font-size:16px;margin:0 0 8px'>Hola {primer_nombre} — en IAOps nada "
                    "importante pasa sin firma. Esta es la tuya:</p>"
                    f"<p style='font-size:44px;font-weight:bold;letter-spacing:10px;margin:16px 0;"
                    f"color:#38e0d8'>{code}</p>"
                    "<p style='color:#9c9caa;font-size:13px'>Vence en 10 minutos. Si no fuiste tú, ignora este correo.</p>"
                    "<p style='color:#66666f;font-size:12px;margin-top:28px'>— Alejandro Barrera · "
                    "<a href='https://alejandrobarrera.net' style='color:#9a8cff'>alejandrobarrera.net</a></p></div>")},
            },
        }},
    )


def _issue_code(email, nombre, item):
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
        UpdateExpression=("SET verify_code = :c, verify_expires = :e, attempts = :z, "
                          "last_send = :t, send_window = :ws, send_count = :sc"),
        ExpressionAttributeValues={":c": code, ":e": now + CODE_TTL, ":z": 0,
                                   ":t": now, ":ws": window_start, ":sc": sends + 1},
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
    now = int(time.time())

    # ---------- acciones con sesión (el email sale del token, no del body) ----------
    if action in ("me", "progress"):
        email = _token_email(body.get("token") or "")
        if not email:
            return _resp(401, {"ok": False, "error": "sesion"})
        item = _get(email)
        if not item or not item.get("verified"):
            return _resp(401, {"ok": False, "error": "sesion"})

        if action == "me":
            progress = item.get("progress") or {}
            return _resp(200, {"ok": True, "nombre": item.get("nombre", ""),
                               "email": email, "done": sorted(progress.keys())})

        clase = (body.get("clase") or "").strip().lower()
        if clase not in CLASES:
            return _resp(400, {"ok": False, "error": "clase"})
        TABLE.update_item(
            Key={"email": email},
            UpdateExpression="SET progress = if_not_exists(progress, :empty)",
            ExpressionAttributeValues={":empty": {}},
        )
        TABLE.update_item(
            Key={"email": email},
            UpdateExpression="SET progress.#c = :t, updated_at = :t",
            ExpressionAttributeNames={"#c": clase},
            ExpressionAttributeValues={":t": now},
        )
        return _resp(200, {"ok": True})

    email = (body.get("email") or "").strip().lower()
    if not EMAIL_RE.match(email) or len(email) > 120:
        return _resp(400, {"ok": False, "error": "email"})

    # ---------- register: mínimo viable ----------
    if action == "register":
        if (body.get("web") or "").strip():          # honeypot
            return _resp(200, {"ok": True, "sent": True})
        nombre = (body.get("nombre") or "").strip()
        if not 2 <= len(nombre) <= 80:
            return _resp(400, {"ok": False, "error": "nombre"})

        TABLE.update_item(
            Key={"email": email},
            UpdateExpression=("SET nombre = :n, updated_at = :t, "
                              "created_at = if_not_exists(created_at, :t), "
                              "verified = if_not_exists(verified, :f), "
                              "#src = if_not_exists(#src, :s)"),
            ExpressionAttributeNames={"#src": "source"},
            ExpressionAttributeValues={":n": nombre, ":t": now, ":f": False, ":s": "web"},
        )
        # Siempre se firma (aunque ya exista): así el flujo termina con sesión.
        return _issue_code(email, nombre, _get(email))

    # ---------- verify: la firma (registro Y login — siempre exige el código) ----------
    if action == "verify":
        code = re.sub(r"\D", "", body.get("code") or "")
        item = _get(email)
        if not item:
            return _resp(400, {"ok": False, "error": "desconocido"})
        if int(item.get("attempts", 0)) >= MAX_ATTEMPTS:
            return _resp(429, {"ok": False, "error": "max_attempts"})
        if now > int(item.get("verify_expires", 0)) or not item.get("verify_code"):
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
        return _resp(200, {"ok": True, "verified": True,
                           "token": _issue_token(email), "nombre": item.get("nombre", "")})

    # ---------- login: código solo para miembros existentes ----------
    if action == "login":
        if (body.get("web") or "").strip():           # honeypot
            return _resp(200, {"ok": True, "sent": True})
        item = _get(email)
        if not item:
            return _resp(404, {"ok": False, "error": "desconocido"})
        return _issue_code(email, item.get("nombre", ""), item)

    # ---------- resend ----------
    if action == "resend":
        item = _get(email)
        if not item:
            return _resp(400, {"ok": False, "error": "desconocido"})
        return _issue_code(email, item.get("nombre", ""), item)

    # ---------- profile: enriquecimiento opcional ----------
    if action == "profile":
        item = _get(email)
        if not item:
            return _resp(400, {"ok": False, "error": "desconocido"})

        sets, names, values = [], {}, {":t": now}
        def add(field, value):
            placeholder = f":v{len(values)}"
            alias = f"#f{len(names)}"
            names[alias] = field
            values[placeholder] = value
            sets.append(f"{alias} = {placeholder}")

        pais = (body.get("pais") or "").strip().lower()
        if pais in PAISES:
            add("pais", pais)
        dedicacion = (body.get("dedicacion") or "").strip().lower()
        if dedicacion in DEDICACIONES:
            add("dedicacion", dedicacion)
        canal = (body.get("canal") or "").strip().lower()
        if canal in CANALES:
            add("canal", canal)
        interes = (body.get("interes") or "").strip().lower()
        if interes in INTERESES:
            add("interes", interes)
        whatsapp = re.sub(r"[^\d+]", "", body.get("whatsapp") or "")[:20]
        if whatsapp:
            add("whatsapp", whatsapp)
        rol = (body.get("rol") or "").strip()[:80]
        if rol:
            add("rol", rol)
        empresa = (body.get("empresa") or "").strip()[:100]
        if empresa:
            add("empresa", empresa)
        linkedin = (body.get("linkedin") or "").strip()[:150]
        if linkedin:
            add("linkedin", linkedin)

        if not sets:
            return _resp(200, {"ok": True})
        TABLE.update_item(
            Key={"email": email},
            UpdateExpression="SET " + ", ".join(sets) + ", updated_at = :t",
            ExpressionAttributeNames=names,
            ExpressionAttributeValues=values,
        )
        return _resp(200, {"ok": True})

    return _resp(400, {"ok": False, "error": "action"})
