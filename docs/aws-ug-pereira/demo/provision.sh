#!/usr/bin/env bash
# UNA sola vez, ANTES de la charla. Crea el bucket S3 PRIVADO + CloudFront (HTTPS) con origen S3.
# Después, asegurar-oac.py conecta el OAC: nadie entra directo al bucket, solo CloudFront.
# CloudFront tarda ~5-15 min en desplegarse: por eso NO se hace en vivo.
set -euo pipefail
cd "$(dirname "$0")"
source config.env

echo "== 1) Crear bucket $BUCKET =="
if [ "$REGION" = "us-east-1" ]; then
  aws s3api create-bucket --bucket "$BUCKET" --profile "$PROFILE" --region "$REGION" 2>/dev/null || echo "  (ya existe)"
else
  aws s3api create-bucket --bucket "$BUCKET" --profile "$PROFILE" --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" 2>/dev/null || echo "  (ya existe)"
fi

echo "== 2) Bucket PRIVADO: Block Public Access encendido (CloudFront leerá con OAC) =="
aws s3api put-public-access-block --bucket "$BUCKET" --profile "$PROFILE" \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

echo "== 4) index.html de arranque =="
printf '<!doctype html><meta charset=utf-8><title>Listo</title><body style="font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0;background:#151D25;color:#fff"><h1>Aquí se encenderá tu idea ⚡</h1></body>' > /tmp/index.html
aws s3 cp /tmp/index.html "s3://$BUCKET/index.html" --profile "$PROFILE" --content-type "text/html; charset=utf-8" --cache-control "no-cache"

ORIGIN="$BUCKET.s3.$REGION.amazonaws.com"
echo "== 5) Crear CloudFront (origen = bucket S3 privado; OAC en asegurar-oac.py) =="
CALLER="demo-$(date +%s)"
CONFIG=$(cat <<JSON
{"CallerReference":"$CALLER","Comment":"demo encender tu idea","Enabled":true,"DefaultRootObject":"index.html",
"Origins":{"Quantity":1,"Items":[{"Id":"s3site","DomainName":"$ORIGIN","S3OriginConfig":{"OriginAccessIdentity":""}}]},
"DefaultCacheBehavior":{"TargetOriginId":"s3site","ViewerProtocolPolicy":"redirect-to-https","AllowedMethods":{"Quantity":2,"Items":["GET","HEAD"]},"Compress":true,"CachePolicyId":"4135ea2d-6df8-44a3-9df3-4b5a84be39ad"}}
JSON
)
OUT=$(aws cloudfront create-distribution --profile "$PROFILE" --distribution-config "$CONFIG")
DIST_ID=$(echo "$OUT" | python3 -c 'import json,sys;print(json.load(sys.stdin)["Distribution"]["Id"])')
DOMAIN=$(echo "$OUT" | python3 -c 'import json,sys;print(json.load(sys.stdin)["Distribution"]["DomainName"])')

echo
echo "  ✅ CloudFront (HTTPS, ~10min): https://$DOMAIN"
echo
echo ">> Pega esto en config.env:"
echo "   DISTRIBUTION_ID=$DIST_ID"
echo "   CF_DOMAIN=$DOMAIN"
echo
echo ">> Luego corre:  .venv/bin/python asegurar-oac.py   (OAC + política: solo CloudFront lee el bucket)"
echo ">> Y genera el QR apuntando a https://$DOMAIN (para el slide del QR)."
