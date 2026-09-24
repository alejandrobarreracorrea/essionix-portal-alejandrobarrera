#!/usr/bin/env bash
# UNA sola vez, ANTES de la charla. Crea el bucket S3 (web estática) + CloudFront (HTTPS).
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

echo "== 2) Permitir acceso público (bucket desechable de demo) =="
aws s3api put-public-access-block --bucket "$BUCKET" --profile "$PROFILE" \
  --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false
aws s3api put-bucket-policy --bucket "$BUCKET" --profile "$PROFILE" --policy "$(cat <<JSON
{"Version":"2012-10-17","Statement":[{"Sid":"PublicRead","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::$BUCKET/*"}]}
JSON
)"

echo "== 3) Habilitar hosting de web estática =="
aws s3 website "s3://$BUCKET/" --profile "$PROFILE" --index-document index.html --error-document index.html

echo "== 4) index.html de arranque =="
printf '<!doctype html><meta charset=utf-8><title>Listo</title><body style="font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0;background:#151D25;color:#fff"><h1>Aquí se encenderá tu idea ⚡</h1></body>' > /tmp/index.html
aws s3 cp /tmp/index.html "s3://$BUCKET/index.html" --profile "$PROFILE" --content-type "text/html; charset=utf-8" --cache-control "no-cache"

WEBSITE="$BUCKET.s3-website-$REGION.amazonaws.com"
echo "== 5) Crear CloudFront (origen = web estática S3) =="
CALLER="demo-$(date +%s)"
CONFIG=$(cat <<JSON
{"CallerReference":"$CALLER","Comment":"demo encender tu idea","Enabled":true,"DefaultRootObject":"index.html",
"Origins":{"Quantity":1,"Items":[{"Id":"s3site","DomainName":"$WEBSITE","CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":"http-only","OriginSslProtocols":{"Quantity":1,"Items":["TLSv1.2"]}}}]},
"DefaultCacheBehavior":{"TargetOriginId":"s3site","ViewerProtocolPolicy":"redirect-to-https","AllowedMethods":{"Quantity":2,"Items":["GET","HEAD"]},"Compress":true,"CachePolicyId":"4135ea2d-6df8-44a3-9df3-4b5a84be39ad"}}
JSON
)
OUT=$(aws cloudfront create-distribution --profile "$PROFILE" --distribution-config "$CONFIG")
DIST_ID=$(echo "$OUT" | python3 -c 'import json,sys;print(json.load(sys.stdin)["Distribution"]["Id"])')
DOMAIN=$(echo "$OUT" | python3 -c 'import json,sys;print(json.load(sys.stdin)["Distribution"]["DomainName"])')

echo
echo "  ✅ S3 website (HTTP, ya):   http://$WEBSITE"
echo "  ✅ CloudFront (HTTPS, ~10min): https://$DOMAIN"
echo
echo ">> Pega esto en config.env:"
echo "   DISTRIBUTION_ID=$DIST_ID"
echo "   CF_DOMAIN=$DOMAIN"
echo
echo ">> Y genera el QR apuntando a https://$DOMAIN (para el slide del QR)."
