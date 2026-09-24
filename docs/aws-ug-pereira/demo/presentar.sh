#!/usr/bin/env bash
# Lanza la presentación CON el demo integrado. Abre http://localhost:8777/slides.html
set -euo pipefail
cd "$(dirname "$0")"
pkill -f "http.server 8777" 2>/dev/null || true
pkill -f "[s]erver.py" 2>/dev/null || true
sleep 0.4
exec .venv/bin/python server.py
