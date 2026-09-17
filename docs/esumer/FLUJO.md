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
1. **Deck**: editar el `slides.html` canónico y regenerar con
   `python scripts/build-decks.py docs/esumer/lecciones/sesion-0N/slides.html`
   (venv con `segno`). Verificar: 0 placeholders `{{`, QR de asistencia con la clase
   correcta por grupo, label “Sesión N” correcto por grupo, portada acorde al tema.
   El deck-meta soporta números por grupo: `<!-- deck-meta: clase=3 clase-g1=4 -->`
   (y `sesion-g1=4` si el nº de Sesión difiere del de clase).
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
```
docs/esumer/
  FLUJO.md                       ← este archivo
  lecciones/sesion-0N/           ← decks (canónico + g1/g2 generados)
  asistencia/RED-0N/clase-0M.md  ← asistencia por grupo+clase (+ README índice)
  mensajes/RED-0N/               ← mensajes de WhatsApp enviados (anuncios + recaps)
  bitacora/                      ← bitácoras técnicas
```
