#!/usr/bin/env python3
"""Sirve la presentación Y ejecuta el demo REAL:
verifica/aplica la infraestructura en AWS en vivo (bucket S3, política, CloudFront
pre-creado por provision.sh, Bedrock), genera con Bedrock, despliega y sirve por HTTPS
desde CloudFront. Cada paso se envía a la diapositiva por SSE.
Correr: ./presentar.sh   →   http://localhost:8777/slides.html"""
import os, json, re, time, urllib.parse, urllib.request, urllib.error, boto3, segno
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)              # docs/aws-ug-pereira (la presentación)
DEPLOY_PAUSE = 8.0                          # segundos mínimos por paso del despliegue (5 pasos ≈ 40 s)
PAUSE = 7.0                                 # segundos mínimos por fila del panel "Aprovisionando" (5 filas ≈ 35 s): pausa intencional para que se lea la terminal
BRIEF_PAUSE = 7.0                           # s que se muestra "Diseñando tu página" (el pedido a Bedrock) antes de invocar
TYPE_CPS = 55.0                             # velocidad a la que la diapositiva teclea cada comando (car/s); el server espera a que termine

def cfg():
    d = {}
    for line in open(os.path.join(HERE, "config.env")):
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1); d[k] = v
    return d
C = cfg()
SYS = open(os.path.join(HERE, "system-prompt.txt")).read()
REGION = C["REGION"]
SESSION = boto3.Session(profile_name=C["PROFILE"], region_name=REGION)

class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def log_message(self, *a): pass

    def do_GET(self):
        if self.path.startswith("/api/enciende"): return self.enciende()
        return super().do_GET()

    def sse(self, event, data):
        self.wfile.write(("event: %s\ndata: %s\n\n" % (event, json.dumps(data))).encode()); self.wfile.flush()

    def enciende(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        prompt = (q.get("p", ["una landing para una idea de negocio"])[0]).strip()
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache"); self.end_headers()
        s3 = SESSION.client("s3")
        try:
            t0 = time.time()
            bucket = C["BUCKET"]                      # fijo: lo creó provision.sh antes de la charla
            dist_id = C.get("DISTRIBUTION_ID", ""); cf_domain = C.get("CF_DOMAIN", "")

            # ---- Fase 1: la infra en AWS, en vivo. Cada fila hace la llamada real y
            # luego ESPERA a que AWS confirme que el recurso está listo (waiter/poll);
            # mientras tanto la fila muestra el progreso (texto + segundos). Nada se
            # marca "listo" por reloj: se marca cuando AWS lo dice. Cada fila queda
            # >= PAUSE s en pantalla para que se alcance a ver.
            def fila(r, fn):
                self.sse("prov", {"r": r, "status": "creating"})
                t = time.time()
                def progreso(txt):
                    self.sse("prov", {"r": r, "status": "creating", "detail": "%s · %ds" % (txt, int(time.time() - t))})
                fn(progreso)
                time.sleep(max(0, PAUSE - (time.time() - t)))
                self.sse("prov", {"r": r, "status": "done"})

            def api(r, cmd):
                """Muestra en la terminal de la diapositiva el equivalente AWS CLI de la
                llamada boto3 que se hace a continuación, y espera a que se teclee."""
                self.sse("api", {"r": r, "cmd": cmd})
                time.sleep(len(cmd) / TYPE_CPS + 0.5)
            def res(r, out):
                self.sse("api", {"r": r, "out": out})
                time.sleep(0.6)
            def http(resp):
                return "HTTP %s" % resp.get("ResponseMetadata", {}).get("HTTPStatusCode", "?")

            def esperar(cond, progreso, txt, cada=2.0, maximo=None):
                """Poll hasta que cond() sea True; informa progreso; maximo=None espera sin tope."""
                t = time.time()
                while not cond():
                    if maximo is not None and time.time() - t > maximo: raise RuntimeError("tiempo agotado: " + txt)
                    progreso(txt); time.sleep(cada)

            def crear_bucket(progreso):
                api("s3", "aws s3api create-bucket --bucket %s --region %s" % (bucket, REGION))
                try: out = s3.create_bucket(Bucket=bucket); res("s3", '{ "Location": "%s" }  %s' % (out.get("Location", "/" + bucket), http(out)))   # us-east-1: sin LocationConstraint
                except s3.exceptions.BucketAlreadyOwnedByYou: res("s3", "BucketAlreadyOwnedByYou → ya es tuyo, se reutiliza")
                progreso("esperando al bucket")
                api("s3", "aws s3api wait bucket-exists --bucket %s" % bucket)
                s3.get_waiter("bucket_exists").wait(Bucket=bucket, WaiterConfig={"Delay": 2, "MaxAttempts": 30})
                res("s3", "✓ bucket-exists")
            fila("s3", crear_bucket)

            # Bucket PRIVADO: Block Public Access encendido y solo CloudFront (OAC) puede leer.
            # (asegurar-oac.py dejó el origen de CloudFront con OAC; aquí se reafirma en vivo)
            acct = SESSION.client("sts").get_caller_identity()["Account"]
            if not dist_id: raise RuntimeError("falta DISTRIBUTION_ID en config.env: corre provision.sh y asegurar-oac.py")
            fuente = "arn:aws:cloudfront::%s:distribution/%s" % (acct, dist_id)
            def politica(progreso):
                api("policy", "aws s3api put-public-access-block --bucket %s --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" % bucket)
                out = s3.put_public_access_block(Bucket=bucket, PublicAccessBlockConfiguration={
                    "BlockPublicAcls": True, "IgnorePublicAcls": True,
                    "BlockPublicPolicy": True, "RestrictPublicBuckets": True})
                res("policy", http(out) + "  ·  nadie entra directo al bucket")
                api("policy", "aws s3api put-bucket-policy --bucket %s --policy '{\"Principal\":{\"Service\":\"cloudfront.amazonaws.com\"},\"Action\":\"s3:GetObject\",\"Condition\":{\"StringEquals\":{\"AWS:SourceArn\":\"%s\"}}}'" % (bucket, fuente))
                out = s3.put_bucket_policy(Bucket=bucket, Policy=json.dumps({"Version": "2012-10-17", "Statement": [{
                    "Sid": "SoloCloudFrontOAC", "Effect": "Allow", "Principal": {"Service": "cloudfront.amazonaws.com"},
                    "Action": "s3:GetObject", "Resource": "arn:aws:s3:::%s/*" % bucket,
                    "Condition": {"StringEquals": {"AWS:SourceArn": fuente}}}]}))
                res("policy", http(out) + "  ·  solo esta distribución de CloudFront puede leer")
                def privado():
                    try: return not s3.get_bucket_policy_status(Bucket=bucket)["PolicyStatus"]["IsPublic"]
                    except Exception: return False
                api("policy", "aws s3api get-bucket-policy-status --bucket %s" % bucket)
                esperar(privado, progreso, "cerrando el bucket", cada=1.0, maximo=60)
                res("policy", '{ "PolicyStatus": { "IsPublic": false } }  →  privado ✓')
            fila("policy", politica)

            # CloudFront es un prerrequisito lento (5-15 min en propagarse). Si ya existe
            # (provision.sh) solo se espera a que esté Deployed; si no existe, se crea
            # aquí y la animación espera lo que haga falta, mostrando el tiempo real.
            cf = SESSION.client("cloudfront")
            st = {"dist_id": dist_id, "domain": cf_domain}
            def cloudfront(progreso):
                if False and not st["dist_id"]:   # ya no se crea en vivo (origen privado con OAC: ver asegurar-oac.py)
                    progreso("creando distribución")
                    api("cloudfront", "aws cloudfront create-distribution --origin-domain-name %s.s3-website-%s.amazonaws.com" % (bucket, REGION))
                    out = cf.create_distribution(DistributionConfig={
                        "CallerReference": "encender-%d" % int(time.time()), "Comment": "demo encender tu idea",
                        "Enabled": True, "DefaultRootObject": "index.html",
                        "Origins": {"Quantity": 1, "Items": [{"Id": "s3site",
                            "DomainName": "%s.s3-website-%s.amazonaws.com" % (bucket, REGION),
                            "CustomOriginConfig": {"HTTPPort": 80, "HTTPSPort": 443, "OriginProtocolPolicy": "http-only",
                                "OriginSslProtocols": {"Quantity": 1, "Items": ["TLSv1.2"]}}}]},
                        "DefaultCacheBehavior": {"TargetOriginId": "s3site", "ViewerProtocolPolicy": "redirect-to-https",
                            "AllowedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"]}, "Compress": True,
                            "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"}})   # CachingDisabled
                    st["dist_id"] = out["Distribution"]["Id"]; st["domain"] = out["Distribution"]["DomainName"]
                    print("[cloudfront] creada %s (%s): pégala en config.env" % (st["dist_id"], st["domain"]))
                api("cloudfront", "aws cloudfront get-distribution --id %s --query Distribution.Status" % st["dist_id"])
                def desplegada():
                    d = cf.get_distribution(Id=st["dist_id"])["Distribution"]
                    return d["Status"] == "Deployed" and d["DistributionConfig"]["Enabled"]
                esperar(desplegada, progreso, "propagando a 600+ puntos", cada=5.0)
                oac = cf.get_distribution(Id=st["dist_id"])["Distribution"]["DistributionConfig"]["Origins"]["Items"][0].get("OriginAccessControlId", "")
                res("cloudfront", '"Deployed"  →  %s  ·  origen privado con OAC %s' % (st["domain"], "✓" if oac else "✗ (corre asegurar-oac.py)"))
            fila("cloudfront", cloudfront)

            def bedrock(progreso):   # se confirma el acceso al modelo antes de pedirle la página
                progreso("verificando acceso al modelo")
                api("bedrock", "aws bedrock list-inference-profiles --max-results 1")
                out = SESSION.client("bedrock").list_inference_profiles(maxResults=1)
                res("bedrock", "%s  ·  modelo: %s" % (http(out), C["MODEL_ID"]))
            fila("bedrock", bedrock)

            def https(progreso):     # se comprueba de verdad que CloudFront responde 200 por HTTPS
                def responde():
                    try: return urllib.request.urlopen("https://%s/" % st["domain"], timeout=8).status == 200
                    except Exception: return False
                directo = "https://%s.s3.%s.amazonaws.com/index.html" % (bucket, REGION)
                api("https", "curl -sI %s" % directo)
                try: cod = urllib.request.urlopen(directo, timeout=8).status
                except urllib.error.HTTPError as e: cod = e.code
                except Exception: cod = "sin respuesta"
                res("https", "HTTP %s AccessDenied  ·  directo al bucket: bloqueado ✓" % cod if cod == 403 else "HTTP %s  ⚠ el bucket responde directo" % cod)
                api("https", "curl -sI https://%s/" % st["domain"])
                esperar(responde, progreso, "probando https", cada=2.0, maximo=180)
                res("https", "HTTP/2 200  ·  TLS ✓")
            fila("https", https)

            # ---- Fase 2: la IA crea la página (streaming) ----
            self.sse("step", {"n": "ia"})
            _M = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto",
                  "septiembre","octubre","noviembre","diciembre"]
            _n = time.localtime()
            fecha = "%d de %s de %d, %02d:%02d" % (_n.tm_mday, _M[_n.tm_mon-1], _n.tm_year, _n.tm_hour, _n.tm_min)
            sys_full = SYS + ("\n\n[Contexto en vivo] La fecha y hora actuales son: %s. "
                              "Si muestras fecha, año o ©, usa ESTE año/fecha; nunca 2024 ni un año inventado." % fecha)
            body = {"anthropic_version": "bedrock-2023-05-31", "max_tokens": int(C.get("MAX_TOKENS", "8000")),
                    "system": sys_full, "messages": [{"role": "user", "content": prompt}]}
            # "Diseñando tu página": se muestra el pedido real que va a Bedrock antes de invocarlo
            self.sse("brief", {"prompt": prompt, "model": C["MODEL_ID"], "max_tokens": body["max_tokens"],
                               "cmd": "aws bedrock-runtime invoke-model-with-response-stream --model-id %s" % C["MODEL_ID"]})
            time.sleep(BRIEF_PAUSE)
            self.sse("invoke", {})
            br = SESSION.client("bedrock-runtime")
            resp = br.invoke_model_with_response_stream(modelId=C["MODEL_ID"], body=json.dumps(body))
            parts = []
            for ev in resp["body"]:
                ch = json.loads(ev["chunk"]["bytes"])
                if ch.get("type") == "content_block_delta":
                    piece = ch["delta"].get("text", ""); parts.append(piece); self.sse("delta", {"t": piece})
            html = re.sub(r"\s*```$", "", re.sub(r"^```(?:html)?\s*", "", "".join(parts).strip()))
            # sello de "creado en vivo" con fecha Y hora exactas — garantizado en toda página
            sello = ('<div style="position:fixed;left:50%;bottom:12px;transform:translateX(-50%);'
                     'font:600 12px/1 system-ui,-apple-system,Segoe UI,sans-serif;padding:7px 15px;border-radius:999px;'
                     'background:rgba(15,20,28,.85);color:#fff;z-index:2147483647;box-shadow:0 6px 20px rgba(0,0,0,.4);'
                     'white-space:nowrap">⚡ Creado en vivo con IA en AWS · ' + fecha + '</div>')
            html = html.replace("</body>", sello + "</body>", 1) if "</body>" in html else (html + sello)
            self.sse("generated", {"bytes": len(html)})

            # ---- Fase 3: desplegar. Igual que la fase 1: cada paso es real, se confirma
            # con AWS y queda >= DEPLOY_PAUSE s en pantalla, sincronizado con el diagrama
            # (tu página → S3 → CloudFront → puntos de presencia → HTTPS).
            self.sse("step", {"n": "deploy"})
            url = "https://%s/" % st["domain"]
            def paso(n, fn):
                self.sse("deploy", {"n": n, "status": "creating"})
                t = time.time()
                def progreso(txt):
                    self.sse("deploy", {"n": n, "status": "creating", "detail": "%s · %ds" % (txt, int(time.time() - t))})
                det = fn(progreso)
                time.sleep(max(0, DEPLOY_PAUSE - (time.time() - t)))
                self.sse("deploy", {"n": n, "status": "done", "detail": det or ""})

            cuerpo = html.encode()
            def empaquetar(progreso):
                return "%.1f KB" % (len(cuerpo) / 1024)
            paso("pack", empaquetar)

            def subir(progreso):
                s3.put_object(Bucket=bucket, Key="index.html", Body=cuerpo,
                    ContentType="text/html; charset=utf-8", CacheControl="no-cache")
                progreso("confirmando en S3")
                s3.get_waiter("object_exists").wait(Bucket=bucket, Key="index.html", WaiterConfig={"Delay": 1, "MaxAttempts": 30})
                return "confirmado"
            paso("s3", subir)

            pop = {"v": ""}
            def desde_cloudfront(progreso):
                # "Está vivo" solo cuando CloudFront entrega ESTA página (no la anterior).
                def trae_la_nueva():
                    try:
                        req = urllib.request.Request(url, headers={"Cache-Control": "no-cache"})
                        r = urllib.request.urlopen(req, timeout=8)
                        pop["v"] = r.headers.get("x-amz-cf-pop", "")
                        return r.read() == cuerpo
                    except Exception: return False
                esperar(trae_la_nueva, progreso, "CloudFront leyendo el origen", cada=2.0, maximo=120)
                return "página nueva ✓"
            paso("cf", desde_cloudfront)

            def borde(progreso):
                # x-amz-cf-pop es el punto de presencia real que atendió la petición.
                return ("punto de presencia " + pop["v"]) if pop["v"] else "600+ puntos"
            paso("edge", borde)

            def https(progreso):
                r = urllib.request.urlopen(url, timeout=8)
                return "HTTPS %d" % r.status
            paso("https", https)

            qr = segno.make(url, error="h").svg_data_uri(scale=4, border=2, dark="#151D25", light="#ffffff")
            self.sse("live", {"url": url, "qr": qr, "secs": round(time.time() - t0)})
        except Exception as e:
            self.sse("failed", {"error": str(e)})

if __name__ == "__main__":
    print("Presentación + demo en:  http://localhost:8777/slides.html")
    print("(Ctrl+C para detener)")
    ThreadingHTTPServer(("127.0.0.1", 8777), H).serve_forever()
