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

# Lo que dejó la demo de la diapositiva (server.py): bucket + distribución de la
# última corrida. Las distribuciones de corridas anteriores ya quedaron
# deshabilitadas por el propio server; se borran con finish_delete.sh.
if [ -f .last_cf ]; then
  D=$(cat .last_cf)
  echo "== Deshabilitando CloudFront de la última corrida ($D) =="
  ETAG=$(aws cloudfront get-distribution-config --profile "$PROFILE" --id "$D" --query ETag --output text 2>/dev/null) && {
    aws cloudfront get-distribution-config --profile "$PROFILE" --id "$D" --query DistributionConfig > /tmp/cf_last.json
    python3 -c 'import json;d=json.load(open("/tmp/cf_last.json"));d["Enabled"]=False;json.dump(d,open("/tmp/cf_last.json","w"))'
    aws cloudfront update-distribution --profile "$PROFILE" --id "$D" --distribution-config file:///tmp/cf_last.json --if-match "$ETAG" >/dev/null
    echo "  Deshabilitada. Para borrar todas las de la demo: ./finish_delete.sh \$(aws cloudfront list-distributions --profile $PROFILE --query \"DistributionList.Items[?starts_with(Comment,'encender ')].Id\" --output text)"
  }
fi
if [ -f .last_bucket ]; then
  B=$(cat .last_bucket)
  echo "== Vaciando y borrando bucket de la última corrida ($B) =="
  aws s3 rm "s3://$B" --recursive --profile "$PROFILE" 2>/dev/null || true
  aws s3api delete-bucket --bucket "$B" --profile "$PROFILE" --region "$REGION" 2>/dev/null || true
fi

echo "== Vaciando y borrando bucket $BUCKET =="
aws s3 rm "s3://$BUCKET" --recursive --profile "$PROFILE" 2>/dev/null || true
aws s3api delete-bucket --bucket "$BUCKET" --profile "$PROFILE" --region "$REGION" 2>/dev/null || true
echo "  Listo."
