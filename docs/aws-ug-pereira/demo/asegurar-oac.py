#!/usr/bin/env python3
"""UNA sola vez, ANTES de la charla: deja el origen como manda la buena práctica.
Bucket S3 PRIVADO (Block Public Access encendido) y CloudFront leyendo con
Origin Access Control (OAC) firmado con SigV4. Nadie entra directo al bucket; solo
esta distribución. Idempotente: se puede correr varias veces.
Correr:  .venv/bin/python asegurar-oac.py"""
import json, os, time, urllib.request, urllib.error, boto3

HERE = os.path.dirname(os.path.abspath(__file__))
C = dict(l.strip().split("=", 1) for l in open(os.path.join(HERE, "config.env")) if "=" in l and not l.startswith("#"))
S = boto3.Session(profile_name=C["PROFILE"], region_name=C["REGION"])
s3, cf = S.client("s3"), S.client("cloudfront")
B, DIST, REGION = C["BUCKET"], C["DISTRIBUTION_ID"], C["REGION"]
ACCT = S.client("sts").get_caller_identity()["Account"]

# 1) OAC (una por bucket)
nombre = ("oac-" + B)[:64]
oac = next((o for o in cf.list_origin_access_controls().get("OriginAccessControlList", {}).get("Items", []) if o["Name"] == nombre), None)
oac_id = oac["Id"] if oac else cf.create_origin_access_control(OriginAccessControlConfig={
    "Name": nombre, "Description": "demo encender tu idea: bucket privado",
    "SigningProtocol": "sigv4", "SigningBehavior": "always", "OriginAccessControlOriginType": "s3"})["OriginAccessControl"]["Id"]
print("OAC:", oac_id)

# 2) CloudFront: origen = endpoint REST del bucket + OAC (ya no el website público)
r = cf.get_distribution_config(Id=DIST); cfg, etag = r["DistributionConfig"], r["ETag"]
o = cfg["Origins"]["Items"][0]
rest = "%s.s3.%s.amazonaws.com" % (B, REGION)
if o["DomainName"] != rest or o.get("OriginAccessControlId") != oac_id:
    o["DomainName"] = rest
    o.pop("CustomOriginConfig", None)
    o["S3OriginConfig"] = {"OriginAccessIdentity": ""}
    o["OriginAccessControlId"] = oac_id
    cf.update_distribution(Id=DIST, IfMatch=etag, DistributionConfig=cfg)
    print("CloudFront actualizado; esperando a que quede Deployed (5-15 min)…")
    cf.get_waiter("distribution_deployed").wait(Id=DIST, WaiterConfig={"Delay": 20, "MaxAttempts": 60})
print("CloudFront: origen privado con OAC ✓")

# 3) Bucket privado: solo esta distribución puede leer
s3.put_public_access_block(Bucket=B, PublicAccessBlockConfiguration={
    "BlockPublicAcls": True, "IgnorePublicAcls": True, "BlockPublicPolicy": True, "RestrictPublicBuckets": True})
s3.put_bucket_policy(Bucket=B, Policy=json.dumps({"Version": "2012-10-17", "Statement": [{
    "Sid": "SoloCloudFrontOAC", "Effect": "Allow", "Principal": {"Service": "cloudfront.amazonaws.com"},
    "Action": "s3:GetObject", "Resource": "arn:aws:s3:::%s/*" % B,
    "Condition": {"StringEquals": {"AWS:SourceArn": "arn:aws:cloudfront::%s:distribution/%s" % (ACCT, DIST)}}}]}))
try: s3.delete_bucket_website(Bucket=B)
except Exception: pass
print("Bucket privado ✓ (Block Public Access encendido, sin website)")

# 4) Verificación: directo al bucket = 403; por CloudFront = 200
def codigo(url):
    try: return urllib.request.urlopen(url, timeout=10).status
    except urllib.error.HTTPError as e: return e.code
time.sleep(3)
print("directo a S3  →", codigo("https://%s/index.html" % rest), "(esperado 403)")
print("por CloudFront →", codigo("https://%s/" % C["CF_DOMAIN"]), "(esperado 200)")
