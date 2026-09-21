#!/usr/bin/env python3
"""Sirve la presentación Y ejecuta el demo REAL:
verifica/aplica la infraestructura en AWS en vivo (bucket S3, política, CloudFront
pre-creado por provision.sh, Bedrock), genera con Bedrock, despliega y sirve por HTTPS
desde CloudFront. Cada paso se envía a la diapositiva por SSE.
Correr: ./presentar.sh   →   http://localhost:8777/slides.html"""
import os, json, re, time, urllib.parse, urllib.request, boto3, segno
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)              # docs/aws-ug-pereira (la presentación)
DEPLOY_PAUSE = 8.0                          # segundos mínimos por paso del despliegue (5 pasos ≈ 40 s)
PAUSE = 4.0                                 # segundos mínimos por fila del panel "Aprovisionando" (5 filas ≈ 20 s)

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

            def esperar(cond, progreso, txt, cada=2.0, maximo=None):
                """Poll hasta que cond() sea True; informa progreso; maximo=None espera sin tope."""
                t = time.time()
                while not cond():
                    if maximo is not None and time.time() - t > maximo: raise RuntimeError("tiempo agotado: " + txt)
                    progreso(txt); time.sleep(cada)

            def crear_bucket(progreso):
                try: s3.create_bucket(Bucket=bucket)   # us-east-1: sin LocationConstraint
                except s3.exceptions.BucketAlreadyOwnedByYou: pass
                progreso("esperando al bucket")
                s3.get_waiter("bucket_exists").wait(Bucket=bucket, WaiterConfig={"Delay": 2, "MaxAttempts": 30})
            fila("s3", crear_bucket)

            def politica(progreso):
                s3.put_public_access_block(Bucket=bucket, PublicAccessBlockConfiguration={
                    "BlockPublicAcls": False, "IgnorePublicAcls": False,
                    "BlockPublicPolicy": False, "RestrictPublicBuckets": False})
                s3.put_bucket_policy(Bucket=bucket, Policy=json.dumps({
                    "Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Principal": "*",
                    "Action": "s3:GetObject", "Resource": "arn:aws:s3:::%s/*" % bucket}]}))
                def publico():
                    try: return s3.get_bucket_policy_status(Bucket=bucket)["PolicyStatus"]["IsPublic"]
                    except Exception: return False
                esperar(publico, progreso, "aplicando política", cada=1.0, maximo=60)
            fila("policy", politica)

            # CloudFront es un prerrequisito lento (5-15 min en propagarse). Si ya existe
            # (provision.sh) solo se espera a que esté Deployed; si no existe, se crea
            # aquí y la animación espera lo que haga falta, mostrando el tiempo real.
            cf = SESSION.client("cloudfront")
            st = {"dist_id": dist_id, "domain": cf_domain}
            def cloudfront(progreso):
                if not st["dist_id"]:
                    progreso("creando distribución")
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
                def desplegada():
                    d = cf.get_distribution(Id=st["dist_id"])["Distribution"]
                    return d["Status"] == "Deployed" and d["DistributionConfig"]["Enabled"]
                esperar(desplegada, progreso, "propagando a 600+ puntos", cada=5.0)
            fila("cloudfront", cloudfront)

            def bedrock(progreso):   # se confirma el acceso al modelo antes de pedirle la página
                progreso("verificando acceso al modelo")
                SESSION.client("bedrock").list_inference_profiles(maxResults=1)
            fila("bedrock", bedrock)

            def https(progreso):     # se comprueba de verdad que CloudFront responde 200 por HTTPS
                def responde():
                    try: return urllib.request.urlopen("https://%s/" % st["domain"], timeout=8).status == 200
                    except Exception: return False
                esperar(responde, progreso, "probando https", cada=2.0, maximo=180)
            fila("https", https)

            # ---- Fase 2: la IA crea la página (streaming) ----
            self.sse("step", {"n": "ia"})
            body = {"anthropic_version": "bedrock-2023-05-31", "max_tokens": int(C.get("MAX_TOKENS", "8000")),
                    "system": SYS, "messages": [{"role": "user", "content": prompt}]}
            br = SESSION.client("bedrock-runtime")
            resp = br.invoke_model_with_response_stream(modelId=C["MODEL_ID"], body=json.dumps(body))
            parts = []
            for ev in resp["body"]:
                ch = json.loads(ev["chunk"]["bytes"])
                if ch.get("type") == "content_block_delta":
                    piece = ch["delta"].get("text", ""); parts.append(piece); self.sse("delta", {"t": piece})
            html = re.sub(r"\s*```$", "", re.sub(r"^```(?:html)?\s*", "", "".join(parts).strip()))
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
