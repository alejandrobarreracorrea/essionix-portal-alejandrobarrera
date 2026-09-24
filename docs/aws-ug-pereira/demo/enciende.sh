#!/usr/bin/env bash
# EL COMANDO EN VIVO. Uso: ./enciende.sh "una landing para mi panadería artesanal"
# 1) La IA (Bedrock) genera la web EN STREAMING (se ve escribiéndose).
# 2) La despliega en AWS. Imprime la URL y cuánto tardó.
set -euo pipefail
cd "$(dirname "$0")"
source config.env
export PROFILE REGION MODEL_ID MAX_TOKENS

PROMPT="${*:-una landing moderna para una idea de negocio}"
t0=$(date +%s)

# --- 1) Generación en vivo con Bedrock (streaming) ---
.venv/bin/python stream_generate.py "$PROMPT"
t1=$(date +%s)

# --- 2) Deploy en AWS ---
echo; echo "🚀 Desplegando en AWS…"
aws s3 cp site/index.html "s3://$BUCKET/index.html" \
  --profile "$PROFILE" --region "$REGION" \
  --content-type "text/html; charset=utf-8" --cache-control "no-cache" >/dev/null

if [ -n "${DISTRIBUTION_ID:-}" ]; then
  aws cloudfront create-invalidation --profile "$PROFILE" \
    --distribution-id "$DISTRIBUTION_ID" --paths "/*" >/dev/null
  URL="https://$CF_DOMAIN"
else
  URL="http://$BUCKET.s3-website-$REGION.amazonaws.com"
fi
t2=$(date +%s)

echo
echo "  ✅ VIVO: $URL"
echo "  ⏱  IA: $((t1-t0))s · deploy: $((t2-t1))s · total: $((t2-t0))s"
