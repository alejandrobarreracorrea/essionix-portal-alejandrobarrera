# Bitácora — Sistema de asistencia, decks por grupo y política EC2 (2026-09)

Resumen de lo construido para el curso Esumer "Cloud, Redes y Ciberseguridad" (Estud-IA).
Grupos: **RED-01** (Mar/Jue) y **RED-02** (Mié/Vie).

## 1. Ticket de salida = asistencia
- **Un solo Google Form** para todo el curso (título visible "🎟️ Ticket de salida…"; archivo Drive
  "Formulario de asistencia · Cloud, Redes y Ciberseguridad"). Link corto: `forms.gle/AvqQfVTjUNf2FFXd9`.
- 5 preguntas **obligatorias**: Grupo (RED-01/RED-02), Nombre, Correo, N° de clase (1–40), y
  "¿De qué trató la clase de hoy…?" (párrafo).
- Se entrega **al cierre** de la clase (QR en el último slide). Es prueba de presencia.
- **Anti-falsificación (sin ser restrictivo):** marca temporal automática (quien lo llene fuera de la
  franja de clase queda delatado) + la pregunta del tema (hay que haber estado para responderla).
- **QR prellenado por grupo y clase:** cada deck lleva un QR con `Grupo` y `N° de clase` ya puestos
  (campos `entry.66938881` = grupo, `entry.514240794` = clase). El estudiante solo escribe nombre,
  correo y tema. Todo cae en la **misma hoja de respuestas**.
- **Hoja de respuestas** (ver todo, filtrar por grupo + clase + marca temporal): vinculada al form.
  ⚠️ No confundir con la hoja del formulario **diagnóstico** de la sesión 1 (otro form).

## 2. Generador de decks por grupo — `scripts/build-decks.py`
- Cada lección tiene un `slides.html` **canónico** (fuente de verdad) con placeholders
  `{{G_NUM}}`, `{{G_ID}}`, `{{QR_TICKET}}` y una meta `<!-- deck-meta: clase=N -->`.
- Correr `python scripts/build-decks.py` genera `slides-g1.html` y `slides-g2.html`
  (RED-01 / RED-02). **No editar los `slides-gN.html` a mano** — se sobrescriben.
- Requiere `pip install segno` (genera los QR SVG inline: navy `#0e2841`, quiet zone, verificados con OpenCV).
- Sesión 1 quedó con sus g1/g2 hechos a mano (congelada). Para sumar una lección al generador:
  ponerle la meta `deck-meta` a su `slides.html`.
- **Ver los decks** (no hay hosting; `docs/**` está excluido del deploy): repo público → githack, p. ej.
  `https://raw.githack.com/alejandrobarreracorrea/essionix-portal-alejandrobarrera/main/docs/esumer/lecciones/sesion-02/slides-g2.html`
  (la de `/main/` cachea ~10 min; usar `/<sha>/` para verla al instante).

## 3. Política EC2-only (todos con AWS)
- El Linux real se hace **solo en EC2** (Instance Connect, sin llaves .pem). Se quitó **Killercoda** y
  **WSL** de todo (decks + guías `ritmo.md` y `lab-terminal.md`).
- **Todos deben tener cuenta AWS activa** (prerequisito). Contingencia si una cuenta nueva no verifica
  a tiempo: trabajar en pareja sobre la instancia de un compañero (sigue en EC2), sin entorno alterno.
- Instalación de herramientas por **winget** en Windows (ej. `winget install Hashicorp.Terraform`, que
  quedó como acción principal del slide de Terraform).

## 4. Modalidad según cronograma oficial
- Corregido en deck + guías: **la próxima clase (redes) es VIRTUAL**, no presencial.
- Regla (cronograma `Plan de trabajo`, hoja "Inf TI"): en septiembre las sesiones regulares son
  **virtuales**; solo las **MasterClass** (Nivelación, Recapitulación) y los **Bootcamp** son presenciales.
- Al armar/editar cualquier deck, poner la modalidad correcta según ese cronograma.

## 5. Cierre de los decks — QR de contacto
El último slide (sesión 2, g1/g2) cierra con 4 QR: **Ticket de salida** (prellenado, el grande) +
**LinkedIn** (`/in/alejobarrera`) + **Web** (`alejandrobarrera.net`) + **Comunidad** (`iaopslatam.com`).

## 6. Distribución de grabaciones
Cada clase se comparte por WhatsApp con el enlace de Drive de la grabación (uno por grupo) + la misión
(subir cheat-sheet con push, apagar EC2) + recordatorio de la próxima clase. Los correos para compartir
el Drive se generan desde los rosters (no se guardan en el repo).

## Registros de asistencia
- `docs/esumer/asistencia/RED-01_clase-01.md` — 38 presentes / 5 ausentes.
- `docs/esumer/asistencia/RED-02_clase-02.md` — 17 presentes / 7 ausentes (+1 externa: Beatriz).

## Nota de privacidad
El repo es **público**. Los registros de asistencia usan **# de roster** y, para ausentes, nombre —
**sin correos**. Los correos de estudiantes no van al repo (solo se usan puntualmente para compartir Drive).
