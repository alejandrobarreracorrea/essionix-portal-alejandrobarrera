#!/usr/bin/env bash
# Borra TODO lo del demo (bucket + CloudFront) para no dejar nada corriendo.
set -euo pipefail
cd "$(dirname "$0")"
source config.env

if [ -n "${DISTRIBUTION_ID:-}" ]; then
  echo "== Deshabilitando y borrando CloudFront $DISTRIBUTION_ID =="
  ETAG=$(aws cloudfront get-distribution-config --profile "$PROFILE" --id "$DISTRIBUTION_ID" --query ETag --output text)
  aws cloudfront get-distribution-config --profile "$PROFILE" --id "$DISTRIBUTION_ID" \
    --query DistributionConfig > /tmp/cf.json
  python3 -c 'import json;d=json.load(open("/tmp/cf.json"));d["Enabled"]=False;json.dump(d,open("/tmp/cf.json","w"))'
  aws cloudfront update-distribution --profile "$PROFILE" --id "$DISTRIBUTION_ID" \
    --distribution-config file:///tmp/cf.json --if-match "$ETAG" >/dev/null
  echo "  Deshabilitada. Espera a 'Deployed' y corre de nuevo para borrar (o bórrala en consola)."
fi

echo "== Vaciando y borrando bucket $BUCKET =="
aws s3 rm "s3://$BUCKET" --recursive --profile "$PROFILE" 2>/dev/null || true
aws s3api delete-bucket --bucket "$BUCKET" --profile "$PROFILE" --region "$REGION" 2>/dev/null || true
echo "  Listo."
