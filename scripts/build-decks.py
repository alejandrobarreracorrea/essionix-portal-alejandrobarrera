#!/usr/bin/env python3
"""
Genera los decks por grupo (slides-g1.html, slides-g2.html) a partir de un
slides.html canónico con placeholders.

Fuente de verdad = slides.html. NO edites los slides-gN.html a mano: se
sobrescriben. Edita el canónico y vuelve a correr este script.

Un deck se considera "canónico" (y se genera) solo si su slides.html contiene
el marcador:  <!-- deck-meta: clase=N -->

Placeholders que se sustituyen en el canónico:
  {{G_NUM}}     -> "1" | "2"           (número de grupo)
  {{G_ID}}      -> "RED-01" | "RED-02" (identificador del grupo)
  {{QR_TICKET}} -> <svg…> del QR del ticket de salida, PRELLENADO con el grupo
                   y el número de clase de esa sesión (todo cae en el mismo
                   formulario / la misma hoja de respuestas).

Uso:
  python scripts/build-decks.py                 # descubre y genera todos
  python scripts/build-decks.py docs/.../slides.html   # solo esos

Requiere: pip install segno
"""
import io
import re
import sys
import glob
import os
from urllib.parse import quote

try:
    import segno
except ImportError:
    sys.exit("Falta 'segno'. Instala con:  pip install segno")

# --- Formulario "Ticket de salida" (un solo form para todo el curso) ---------
FORM_E_ID = "1FAIpQLSfvX5ly3yhgxsoGhi-pmuEJ5hXYaIeSswE5KzhHByHTi4s6Eg"
ENTRY_GRUPO = "66938881"   # pregunta "Grupo" (radio)
ENTRY_CLASE = "514240794"  # pregunta "¿Qué número de clase fue hoy?"
VIEWFORM = f"https://docs.google.com/forms/d/e/{FORM_E_ID}/viewform"

QR_DARK = "#0e2841"  # navy — mismo color escaneable que los demás QR del deck

# --- Grupos ------------------------------------------------------------------
GROUPS = [
    {"num": "1", "id": "RED-01", "grupo_value": "RED-01 (Mar/Jue)"},
    {"num": "2", "id": "RED-02", "grupo_value": "RED-02 (Mié/Vie)"},
]

BANNER = ("<!-- GENERADO por scripts/build-decks.py desde slides.html — "
          "no editar a mano: edita el canónico y regenera. -->")


def prefill_url(grupo_value: str, clase: str) -> str:
    """Link del formulario con Grupo y número de clase ya rellenos."""
    return (f"{VIEWFORM}?usp=pp_url"
            f"&entry.{ENTRY_GRUPO}={quote(grupo_value)}"
            f"&entry.{ENTRY_CLASE}={clase}")


def qr_svg(url: str) -> str:
    """QR como SVG inline en el formato del deck (fondo blanco + quiet zone)."""
    qr = segno.make(url, error="m")
    n = qr.symbol_size(scale=1, border=2)[0]  # módulos incluyendo quiet zone
    buf = io.BytesIO()
    qr.save(buf, kind="svg", scale=1, border=2, xmldecl=False, svgns=False,
            nl=False, omitsize=True, dark=QR_DARK, light=None)
    d = re.search(r'<path[^>]*d="([^"]+)"', buf.getvalue().decode("utf-8")).group(1)
    w = n * 4
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{w}" '
            f'class="segno"><g transform="scale(4)">'
            f'<path fill="#fff" d="M0 0h{n}v{n}h-{n}z"/>'
            f'<path class="qrline" stroke="{QR_DARK}" d="{d}"/></g></svg>')


def build(path: str) -> bool:
    src = open(path, encoding="utf-8").read()
    m = re.search(r"deck-meta:\s*clase=(\d+)", src)
    if not m:
        return False  # no es un deck canónico templado
    clase = m.group(1)
    for g in GROUPS:
        html = src
        html = html.replace(f"<!-- deck-meta: clase={clase} -->", BANNER)
        html = html.replace("{{QR_TICKET}}", qr_svg(prefill_url(g["grupo_value"], clase)))
        html = html.replace("{{G_NUM}}", g["num"])
        html = html.replace("{{G_ID}}", g["id"])
        out = re.sub(r"slides\.html$", f"slides-g{g['num']}.html", path)
        with open(out, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  -> {out}  (clase {clase}, {g['id']})")
    return True


def main(argv):
    if argv:
        paths = argv
    else:
        paths = glob.glob("docs/esumer/lecciones/*/slides.html")
    built = 0
    for p in sorted(paths):
        if os.path.basename(p) != "slides.html":
            continue
        print(p)
        if build(p):
            built += 1
        else:
            print("  (sin deck-meta: se omite)")
    print(f"\nListo: {built} lección(es) generada(s).")


if __name__ == "__main__":
    main(sys.argv[1:])
