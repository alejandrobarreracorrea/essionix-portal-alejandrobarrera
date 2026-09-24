#!/usr/bin/env bash
# Borra por completo las distribuciones CloudFront ya deshabilitadas.
# Uso: ./finish_delete.sh <DIST_ID> [DIST_ID2 ...]
set -uo pipefail
cd "$(dirname "$0")"
source config.env
for D in "$@"; do
  [ -z "$D" ] && continue
  echo "== $D: esperando Deployed (deshabilitado)…"
  while [ "$(aws cloudfront get-distribution --profile "$PROFILE" --id "$D" --query 'Distribution.Status' --output text 2>/dev/null)" != "Deployed" ]; do sleep 20; done
  ETAG=$(aws cloudfront get-distribution --profile "$PROFILE" --id "$D" --query ETag --output text)
  aws cloudfront delete-distribution --profile "$PROFILE" --id "$D" --if-match "$ETAG" && echo "  ✅ $D BORRADA" || echo "  ❌ no se pudo borrar $D"
done
echo "Listo. Recursos CloudFront eliminados."
