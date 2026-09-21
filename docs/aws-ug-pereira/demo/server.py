#!/usr/bin/env python3
"""Sirve la presentación Y ejecuta el demo REAL:
verifica/aplica la infraestructura en AWS en vivo (bucket S3, política, CloudFront
pre-creado por provision.sh, Bedrock), genera con Bedrock, despliega y sirve por HTTPS
desde CloudFront. Cada paso se envía a la diapositiva por SSE.
Correr: ./presentar.sh   →   http://localhost:8777/slides.html"""
import os, json, re, time, urllib.parse, boto3, segno
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)              # docs/aws-ug-pereira (la presentación)
PAUSE = 2.2                                 # segundos mínimos por fila del panel "Aprovisionando"

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

            # ---- Fase 1: la infra en AWS, en vivo. Cada llamada es real e idempotente
            # (volver a crear el bucket que ya es tuyo en us-east-1 responde 200; la
            # política se reaplica; CloudFront se consulta de verdad). La distribución
            # NO se crea aquí: tarda 5-15 min en propagarse y por eso la crea
            # provision.sh antes. Cada fila queda >= PAUSE s en pantalla: en tarima,
            # lo que pasa en 300 ms no se ve.
            def fila(r, fn):
                self.sse("prov", {"r": r, "status": "creating"})
                t = time.time(); fn()
                time.sleep(max(0, PAUSE - (time.time() - t)))
                self.sse("prov", {"r": r, "status": "done"})

            def crear_bucket():
                try: s3.create_bucket(Bucket=bucket)   # us-east-1: sin LocationConstraint
                except s3.exceptions.BucketAlreadyOwnedByYou: pass
            fila("s3", crear_bucket)

            def politica():
                s3.put_public_access_block(Bucket=bucket, PublicAccessBlockConfiguration={
                    "BlockPublicAcls": False, "IgnorePublicAcls": False,
                    "BlockPublicPolicy": False, "RestrictPublicBuckets": False})
                s3.put_bucket_policy(Bucket=bucket, Policy=json.dumps({
                    "Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Principal": "*",
                    "Action": "s3:GetObject", "Resource": "arn:aws:s3:::%s/*" % bucket}]}))
            fila("policy", politica)

            cf_ok = {"v": False}
            def cloudfront():
                if not dist_id: return
                try:
                    d = SESSION.client("cloudfront").get_distribution(Id=dist_id)["Distribution"]
                    cf_ok["v"] = d["Status"] == "Deployed" and d["DistributionConfig"]["Enabled"]
                    if not cf_ok["v"]: print("[cloudfront] %s aún no está Deployed: la URL viva será la de S3" % dist_id)
                except Exception as e:
                    print("[cloudfront] no se pudo consultar:", e)   # la demo sigue por S3
            fila("cloudfront", cloudfront)

            def bedrock():   # se confirma el acceso al modelo antes de pedirle la página
                SESSION.client("bedrock").list_inference_profiles(maxResults=1)
            fila("bedrock", bedrock)

            fila("https", lambda: None)   # CloudFront (o el endpoint de S3) ya sirven por HTTPS

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

            # ---- Fase 3: desplegar (subir la página al bucket que sirve CloudFront) ----
            # La distribución usa la política de caché "CachingDisabled" (provision.sh):
            # cada visita va al origen, así que la página nueva se ve al instante sin
            # invalidaciones. `no-cache` evita que el navegador del público guarde la
            # corrida anterior.
            self.sse("step", {"n": "deploy"})
            s3.put_object(Bucket=bucket, Key="index.html", Body=html.encode(),
                ContentType="text/html; charset=utf-8", CacheControl="no-cache")
            if cf_ok["v"] and cf_domain:
                url = "https://%s/" % cf_domain
            else:
                url = "https://%s.s3.%s.amazonaws.com/index.html" % (bucket, REGION)
            qr = segno.make(url, error="h").svg_data_uri(scale=4, border=2, dark="#151D25", light="#ffffff")

            self.sse("live", {"url": url, "qr": qr, "secs": round(time.time() - t0), "cdn": cf_ok["v"]})
        except Exception as e:
            self.sse("failed", {"error": str(e)})

if __name__ == "__main__":
    print("Presentación + demo en:  http://localhost:8777/slides.html")
    print("(Ctrl+C para detener)")
    ThreadingHTTPServer(("127.0.0.1", 8777), H).serve_forever()
