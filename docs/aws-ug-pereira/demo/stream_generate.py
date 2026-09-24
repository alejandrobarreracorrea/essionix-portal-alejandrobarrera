#!/usr/bin/env python3
"""Genera HTML con Bedrock en STREAMING: se ve escribirse en vivo. Escribe site/index.html."""
import os, sys, json, re, time, boto3

PROFILE   = os.environ["PROFILE"]
REGION    = os.environ["REGION"]
MODEL_ID  = os.environ["MODEL_ID"]
MAX_TOK   = int(os.environ.get("MAX_TOKENS", "8000"))
prompt    = sys.argv[1] if len(sys.argv) > 1 else "una landing para una idea de negocio"
system    = open(os.path.join(os.path.dirname(__file__), "system-prompt.txt")).read()

# colores ANSI para que se vea "de código"
DIM, ORANGE, GREEN, RESET = "\033[2m", "\033[38;5;208m", "\033[32m", "\033[0m"

client = boto3.Session(profile_name=PROFILE, region_name=REGION).client("bedrock-runtime")
body = {"anthropic_version": "bedrock-2023-05-31", "max_tokens": MAX_TOK,
        "system": system, "messages": [{"role": "user", "content": prompt}]}

print(f"{ORANGE}⚡ Bedrock está creando tu página, en vivo:{RESET}\n{DIM}", end="", flush=True)
t0 = time.time()
resp = client.invoke_model_with_response_stream(modelId=MODEL_ID, body=json.dumps(body))
parts = []
for ev in resp["body"]:
    chunk = json.loads(ev["chunk"]["bytes"])
    if chunk.get("type") == "content_block_delta":
        piece = chunk["delta"].get("text", "")
        sys.stdout.write(piece); sys.stdout.flush()   # <- se ve escribiéndose
        parts.append(piece)
print(RESET)
secs = time.time() - t0

html = "".join(parts).strip()
html = re.sub(r"^```(?:html)?\s*", "", html)
html = re.sub(r"\s*```$", "", html)
os.makedirs(os.path.join(os.path.dirname(__file__), "site"), exist_ok=True)
open(os.path.join(os.path.dirname(__file__), "site", "index.html"), "w").write(html)
print(f"\n{GREEN}✓ {len(html)} bytes generados por la IA en {secs:.0f}s{RESET}")
