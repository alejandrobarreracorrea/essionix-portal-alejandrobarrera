#!/usr/bin/env python3
"""Sirve la presentación Y ejecuta el demo REAL:
crea la infraestructura en AWS (bucket S3) en vivo, genera con Bedrock, despliega
y sirve por HTTPS. Cada paso se envía a la diapositiva por SSE.
Correr: ./presentar.sh   →   http://localhost:8777/slides.html"""
import os, json, re, time, urllib.parse, boto3, segno
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)              # docs/aws-ug-pereira (la presentación)
STATE = os.path.join(HERE, ".last_bucket")
STATE_CF = os.path.join(HERE, ".last_cf")   # distribución CloudFront de la última corrida
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
            bucket = "encender-%d" % int(time.time())

            # ---- Fase 1: crear la infra REAL en AWS (con pausas para que se vea) ----
            # Cada fila queda >= PAUSE s en "creando" aunque la llamada tarde menos:
            # en tarima, lo que pasa en 300 ms no se ve.
            def fila(r, fn):
                self.sse("prov", {"r": r, "status": "creating"})
                t = time.time(); fn()
                time.sleep(max(0, PAUSE - (time.time() - t)))
                self.sse("prov", {"r": r, "status": "done"})

            fila("s3", lambda: s3.create_bucket(Bucket=bucket))   # us-east-1: sin LocationConstraint

            def politica():
                s3.put_public_access_block(Bucket=bucket, PublicAccessBlockConfiguration={
                    "BlockPublicAcls": False, "IgnorePublicAcls": False,
                    "BlockPublicPolicy": False, "RestrictPublicBuckets": False})
                s3.put_bucket_policy(Bucket=bucket, Policy=json.dumps({
                    "Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Principal": "*",
                    "Action": "s3:GetObject", "Resource": "arn:aws:s3:::%s/*" % bucket}]}))
            fila("policy", politica)

            # CloudFront: la distribución se crea DE VERDAD (la llamada vuelve en ~1 s),
            # pero tarda minutos en propagarse a los puntos de presencia; por eso la
            # URL viva de esta corrida sigue siendo la de S3. La de la corrida anterior
            # se deshabilita más abajo para no acumular.
            cf = SESSION.client("cloudfront"); dist = {}
            def cloudfront():
                try:
                    out = cf.create_distribution(DistributionConfig={
                        "CallerReference": bucket, "Comment": "encender " + bucket, "Enabled": True,
                        "DefaultRootObject": "index.html",
                        "Origins": {"Quantity": 1, "Items": [{"Id": "s3", "DomainName": "%s.s3.%s.amazonaws.com" % (bucket, REGION),
                            "CustomOriginConfig": {"HTTPPort": 80, "HTTPSPort": 443, "OriginProtocolPolicy": "https-only",
                                "OriginSslProtocols": {"Quantity": 1, "Items": ["TLSv1.2"]}}}]},
                        "DefaultCacheBehavior": {"TargetOriginId": "s3", "ViewerProtocolPolicy": "redirect-to-https",
                            "AllowedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"]}, "Compress": True,
                            "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"}})
                    dist["id"] = out["Distribution"]["Id"]; dist["domain"] = out["Distribution"]["DomainName"]
                except Exception as e:
                    print("[cloudfront] no se pudo crear:", e)   # la demo sigue: la página vive en S3
            fila("cloudfront", cloudfront)

            # Bedrock: se confirma el acceso al modelo antes de pedirle la página.
            def bedrock():
                SESSION.client("bedrock").list_inference_profiles(maxResults=1)
            fila("bedrock", bedrock)

            fila("https", lambda: None)   # el endpoint de S3 ya sirve por HTTPS

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

            # ---- Fase 3: desplegar (subir la página) ----
            self.sse("step", {"n": "deploy"})
            s3.put_object(Bucket=bucket, Key="index.html", Body=html.encode(),
                ContentType="text/html; charset=utf-8", CacheControl="no-cache")
            url = "https://%s.s3.%s.amazonaws.com/index.html" % (bucket, REGION)
            qr = segno.make(url, error="h").svg_data_uri(scale=4, border=2, dark="#151D25", light="#ffffff")

            # borrar el bucket y deshabilitar la distribución de la corrida anterior
            # (no acumular recursos; CloudFront no se puede borrar hasta ~15 min
            # después de deshabilitar: eso lo hace finish_delete.sh)
            try:
                if os.path.exists(STATE):
                    prev = open(STATE).read().strip()
                    if prev and prev != bucket:
                        for o in s3.list_objects_v2(Bucket=prev).get("Contents", []):
                            s3.delete_object(Bucket=prev, Key=o["Key"])
                        s3.delete_bucket(Bucket=prev)
            except Exception:
                pass
            open(STATE, "w").write(bucket)
            try:
                if os.path.exists(STATE_CF):
                    prev_cf = open(STATE_CF).read().strip()
                    if prev_cf and prev_cf != dist.get("id"):
                        cfg = cf.get_distribution_config(Id=prev_cf)
                        if cfg["DistributionConfig"]["Enabled"]:
                            cfg["DistributionConfig"]["Enabled"] = False
                            cf.update_distribution(Id=prev_cf, DistributionConfig=cfg["DistributionConfig"], IfMatch=cfg["ETag"])
            except Exception as e:
                print("[cloudfront] no se pudo deshabilitar la anterior:", e)
            if dist.get("id"):
                open(STATE_CF, "w").write(dist["id"])

            self.sse("live", {"url": url, "qr": qr, "secs": round(time.time() - t0)})
        except Exception as e:
            self.sse("failed", {"error": str(e)})

if __name__ == "__main__":
    print("Presentación + demo en:  http://localhost:8777/slides.html")
    print("(Ctrl+C para detener)")
    ThreadingHTTPServer(("127.0.0.1", 8777), H).serve_forever()
