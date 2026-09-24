#!/usr/bin/env bash
# Borra los recursos actuales y MIDE un despliegue desde cero (bucket + CloudFront
# hasta servir por HTTPS). Luego deshabilita/borra lo de la medición.
# Corre en segundo plano; el resultado queda en /tmp/cold_measure.log
set -uo pipefail
cd "$(dirname "$0")"
source config.env

cfconfig () {  # $1 = website endpoint
  cat <<JSON
{"CallerReference":"cold-$(date +%s%N)","Comment":"cold measure","Enabled":true,"DefaultRootObject":"index.html",
"Origins":{"Quantity":1,"Items":[{"Id":"s3site","DomainName":"$1","CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":"http-only","OriginSslProtocols":{"Quantity":1,"Items":["TLSv1.2"]}}}]},
"DefaultCacheBehavior":{"TargetOriginId":"s3site","ViewerProtocolPolicy":"redirect-to-https","AllowedMethods":{"Quantity":2,"Items":["GET","HEAD"]},"Compress":true,"CachePolicyId":"4135ea2d-6df8-44a3-9df3-4b5a84be39ad"}}
JSON
}
disable_cf () {  # $1 = dist id
  local etag; etag=$(aws cloudfront get-distribution-config --profile "$PROFILE" --id "$1" --query ETag --output text)
  aws cloudfront get-distribution-config --profile "$PROFILE" --id "$1" --query DistributionConfig > /tmp/cf_$1.json
  python3 -c "import json;d=json.load(open('/tmp/cf_$1.json'));d['Enabled']=False;json.dump(d,open('/tmp/cf_$1.json','w'))"
  aws cloudfront update-distribution --profile "$PROFILE" --id "$1" --distribution-config "file:///tmp/cf_$1.json" --if-match "$etag" >/dev/null
}

echo "=== [$(date +%H:%M:%S)] TEARDOWN de recursos actuales ==="
aws s3 rm "s3://$BUCKET" --recursive --profile "$PROFILE" 2>/dev/null || true
aws s3api delete-bucket --bucket "$BUCKET" --profile "$PROFILE" --region "$REGION" 2>/dev/null && echo "  bucket $BUCKET borrado" || echo "  bucket ya no existe"
if [ -n "${DISTRIBUTION_ID:-}" ]; then disable_cf "$DISTRIBUTION_ID" && echo "  CloudFront actual $DISTRIBUTION_ID deshabilitado"; fi

echo "=== [$(date +%H:%M:%S)] MEDICIÓN COLD START (desde cero) ==="
NB="cold-measure-$(date +%s)"
T0=$(date +%s)
aws s3api create-bucket --bucket "$NB" --profile "$PROFILE" --region "$REGION" >/dev/null
aws s3api put-public-access-block --bucket "$NB" --profile "$PROFILE" --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false
aws s3api put-bucket-policy --bucket "$NB" --profile "$PROFILE" --policy "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":\"*\",\"Action\":\"s3:GetObject\",\"Resource\":\"arn:aws:s3:::$NB/*\"}]}"
aws s3 website "s3://$NB/" --profile "$PROFILE" --index-document index.html
printf '<!doctype html><meta charset=utf-8><title>cold</title><h1>cold start</h1>' > /tmp/cold.html
aws s3 cp /tmp/cold.html "s3://$NB/index.html" --profile "$PROFILE" --content-type "text/html" >/dev/null
T_S3=$(date +%s); echo "  [$(date +%H:%M:%S)] bucket + web estática listos: $((T_S3-T0))s"

WEB="$NB.s3-website-$REGION.amazonaws.com"
OUT=$(aws cloudfront create-distribution --profile "$PROFILE" --distribution-config "$(cfconfig "$WEB")")
NDIST=$(echo "$OUT" | python3 -c 'import json,sys;print(json.load(sys.stdin)["Distribution"]["Id"])')
NDOM=$(echo "$OUT" | python3 -c 'import json,sys;print(json.load(sys.stdin)["Distribution"]["DomainName"])')
echo "  [$(date +%H:%M:%S)] CloudFront $NDIST creado; esperando estado Deployed…"
while [ "$(aws cloudfront get-distribution --profile "$PROFILE" --id "$NDIST" --query 'Distribution.Status' --output text)" != "Deployed" ]; do sleep 20; done
T_CF=$(date +%s); echo "  [$(date +%H:%M:%S)] CloudFront Deployed: $((T_CF-T0))s ($(( (T_CF-T0)/60 ))m $(( (T_CF-T0)%60 ))s)"

echo "  esperando primer 200 por HTTPS…"
until [ "$(curl -s -o /dev/null -w '%{http_code}' "https://$NDOM")" = "200" ]; do sleep 5; done
T_LIVE=$(date +%s)

echo
echo "  ============================================================"
echo "   COLD START TOTAL (desde cero → HTTPS vivo): $((T_LIVE-T0))s = $(( (T_LIVE-T0)/60 )) min $(( (T_LIVE-T0)%60 )) s"
echo "     · S3 + web estática:        $((T_S3-T0))s"
echo "     · CloudFront create→Deployed+HTTPS: $((T_LIVE-T_S3))s  <-- el cuello de botella"
echo "  ============================================================"

echo "=== [$(date +%H:%M:%S)] BORRANDO recursos de la medición ==="
aws s3 rm "s3://$NB" --recursive --profile "$PROFILE" >/dev/null 2>&1 || true
aws s3api delete-bucket --bucket "$NB" --profile "$PROFILE" --region "$REGION" 2>/dev/null && echo "  bucket $NB borrado"
disable_cf "$NDIST" && echo "  CloudFront medición $NDIST deshabilitado"

echo
echo "NOTA: CloudFront no se puede BORRAR hasta ~15 min después de deshabilitar."
echo "  Distribuciones deshabilitadas (a borrar luego con finish_delete.sh): ${DISTRIBUTION_ID:-} $NDIST"
echo "DONE $(date +%H:%M:%S)"
