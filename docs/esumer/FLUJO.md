# Flujo de trabajo — cada sesión Esumer

Checklist que se ejecuta **en cada interacción sobre el curso Esumer** (Cloud, Redes y
Ciberseguridad · Estud-IA). Grupos: **RED-01** (Mar/Jue) · **RED-02** (Mié/Vie).
⚠️ Los grupos **divergen** en numeración de sesión/clase (RED-01 va corrido +1 desde la
clase de Linux). Confirmar siempre grupo + N° de sesión/clase de hoy antes de arrancar.

## 0. Ubicar la sesión
- ¿Qué grupo tiene clase hoy? ¿Qué **N° de sesión/clase** es para ESE grupo?
- Registrar la fecha (absoluta) y la modalidad según el cronograma
  ([[reference_esumer_cronograma_modalidad]]; sept = virtual).

## 1. Cerrar la asistencia de la sesión anterior
(la del grupo que acaba de tener clase, casi siempre el otro grupo)
1. Leer respuestas del **ticket de salida** desde la hoja, por navegador ya logueado,
   con un `fetch` al endpoint gviz CSV (evita leer el canvas y evita descargas):
   `…/gviz/tq?tqx=out:csv&gid=<gid>&headers=1`
   (el conector de Google Drive por MCP **no** ve estas hojas — son de otra cuenta).
2. Leer la **lista de participantes del Meet** (la pega Alejandro). **El Meet cuenta como
   presencia.**
3. Cruzar ambas fuentes contra el **roster oficial** por *nombre + apellido* (evita
   colisiones de nombres comunes). Rosters: `~/Downloads/estudiantes_RED-0N_…xlsx`
   (RED-01 = 43 · RED-02 = 24).
4. Guardar en `asistencia/RED-0N/clase-0M.md` (fecha, tema, fuente, presentes por #,
   ausentes por #+nombre — **sin correos**, repo público; notas de externos/sin
   identificar) y actualizar el índice `asistencia/README.md`.

## 2. Alistar los insumos de la clase de hoy
1. **Deck** (LINEAMIENTO: carpeta por grupo): crear/editar el canónico en
   `docs/esumer/lecciones/<GRUPO>/sesion-0N/slides.html` (deck-meta
   `grupo=RED-0N sesion=N clase=N`) y regenerar con
   `python scripts/build-decks.py docs/esumer/lecciones/<GRUPO>/sesion-0N/slides.html`
   (venv con `segno`). Para una sesión con el MISMO contenido que otro grupo, copiar su
   `slides.html`, cambiar el `deck-meta` (grupo/sesion/clase) y **ajustar las rutas de
   assets** (`../../assets/` → `../../../assets/` por la profundidad). Verificar: 0
   placeholders `{{`, QR con la clase correcta, label “Sesión N” y portada acorde al tema.
2. **Mensaje de WhatsApp de anuncio**: Meet link del grupo + plan del día + frase de
   motivación. **Copiar al portapapeles (`pbcopy`) Y guardarlo** en `mensajes/RED-0N/`.

## 3. Después de la clase
1. **Mensaje de recap** con el enlace de la **grabación** (Drive) + invitación a repasar
   + frase motivacional. Copiar al portapapeles **y guardar** en `mensajes/RED-0N/`.
2. En la siguiente interacción, cerrar la asistencia de esta clase (paso 1).

## 4. Siempre
- Todo cambio va a un **commit + push a main** (githack sirve los decks desde ahí).
- Verificar en vivo lo que se afirme (render del deck, decode del QR, conteos).
- Mantener sincronizados canónico + g1 + g2 + guías; nunca editar los `slides-gN.html`
  a mano.

## Enlaces (Meet por grupo)
- RED-01: https://meet.google.com/pqy-nzti-dqg
- RED-02: https://meet.google.com/dzm-ohyv-wez

## Estructura de carpetas
**LINEAMIENTO: cada sesión tiene su propia carpeta, POR GRUPO** — `lecciones/<GRUPO>/sesion-0N/`.
No se comparten carpetas entre grupos (van desfasados: el mismo contenido es sesión 3 para
RED-02 y sesión 4 para RED-01, y a futuro el nº de sesión colisiona). Cada carpeta = un deck
autocontenido de UN grupo.
```
docs/esumer/
  FLUJO.md                          ← este archivo
  lecciones/
    RED-01/sesion-0N/               ← deck de RED-01 para esa sesión
    RED-02/sesion-0N/               ← deck de RED-02 para esa sesión
      slides.html                   (canónico: placeholders + deck-meta grupo/sesion/clase)
      slides-gN.html                (GENERADO — es el que se abre/enlaza; no editar a mano)
    sesion-01/ · sesion-02/         (legacy plano, previas al lineamiento)
  asistencia/RED-0N/clase-0M.md     ← asistencia por grupo+clase (+ README índice)
  mensajes/RED-0N/                  ← mensajes de WhatsApp enviados (anuncios + recaps)
  bitacora/                         ← bitácoras técnicas
```
El deck-meta de un canónico por grupo es: `<!-- deck-meta: grupo=RED-01 sesion=4 clase=4 -->`
(genera solo el `slides-gN.html` de ese grupo). Descubrimiento recursivo:
`python scripts/build-decks.py` (o pasar la ruta del `slides.html`).
