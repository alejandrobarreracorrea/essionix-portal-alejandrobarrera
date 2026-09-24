#!/usr/bin/env bash
# Verifica acceso a Bedrock y modelos disponibles. Correr UNA VEZ, tras activar el perfil.
set -euo pipefail
cd "$(dirname "$0")"
source config.env

echo "== Identidad =="
aws sts get-caller-identity --profile "$PROFILE" --region "$REGION"

echo; echo "== Perfiles de inferencia Claude/Nova (los que puedes invocar on-demand) =="
aws bedrock list-inference-profiles --profile "$PROFILE" --region "$REGION" \
  --query "inferenceProfileSummaries[].inferenceProfileId" --output text 2>/dev/null | tr '\t' '\n' \
  | grep -Ei 'claude|nova' || echo "  (ninguno; habilita acceso a modelos en la consola de Bedrock → Model access)"

echo; echo "== Prueba real de invocación con MODEL_ID=$MODEL_ID =="
BODY='{"anthropic_version":"bedrock-2023-05-31","max_tokens":20,"messages":[{"role":"user","content":"Responde solo: OK"}]}'
if aws bedrock-runtime invoke-model \
    --profile "$PROFILE" --region "$REGION" \
    --model-id "$MODEL_ID" \
    --content-type application/json --accept application/json \
    --cli-binary-format raw-in-base64-out \
    --body "$BODY" /tmp/bedrock_check.json >/dev/null 2>&1; then
  echo "  ✅ Invocación OK →" "$(python3 -c 'import json;print(json.load(open("/tmp/bedrock_check.json"))["content"][0]["text"])')"
else
  echo "  ❌ Falló. Revisa: (1) acceso al modelo habilitado en Bedrock, (2) MODEL_ID correcto (¿necesita prefijo us.?), (3) región."
fi
