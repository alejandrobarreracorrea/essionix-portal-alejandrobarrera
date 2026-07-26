# Cadena de producción de contenido con IA — herramientas y flujos

**Doc:** 2026-07-26 · complementa `sistema-contenido.md` (cadencia) y `estrategia.md` (plan)
**Principio de diseño:** tu tiempo (3–5 h/sem) se gasta SOLO en lo que exige tu criterio y tu cara.
Todo lo demás lo ejecutan agentes — igual que tu nube. **La fábrica es una demo viva de IAOps.**

## Arquitectura (5 etapas)

```
CAPTURA → IDEACIÓN → PRODUCCIÓN → PUBLICACIÓN → MEDICIÓN
(agentes)  (agentes)  (tú + agentes)  (programado)   (agentes)
                         ↑ tu criterio y tu cara viven aquí
```

## Stack por fase (consciente de costos)

| Fase | Herramienta | Para qué | Costo |
|---|---|---|---|
| **F1 Texto (ago)** | **Claude Code** (ya lo tienes, Max) | Redacción, calendario, revisión, news-watch | $0 extra |
| | **Repo como CMS** (`docs/iaops/`) | Posts, calendario, capturas, métricas versionadas | $0 |
| | **Programador nativo de LinkedIn** | Agendar los 4 posts del lunes en 15 min | $0 |
| **F2 Demos (sep)** | **OBS Studio** o QuickTime | Grabar pantalla (guiones ya listos en `demos/`) | $0 |
| | **CapCut** (desktop) | Cortes + subtítulos automáticos es-CO | $0 |
| | (Opcional) Screen Studio | Zooms/polish automático de screen recordings (macOS) | ~USD 89 única vez |
| **F3 Clips + cara (oct)** | **Metricool** | Programar multi-red (LinkedIn/TikTok/IG/YT) desde un panel | Free → ~USD 22/mes si hace falta |
| | **OpusClip** o CapCut manual | 1 demo larga → 3 clips verticales con captions | Free tier → USD 15/mes |
| **F4 Lives (nov)** | **YouTube Live + StreamYard** | Webinar y lives del programa | $0 |
| **Lead magnet** | **beehiiv** | Newsletter (gratis hasta 2.500 suscriptores) | $0 |

Regla: no pagar NADA hasta que la fase lo exija. Presupuesto total del semestre: USD 0–130.

## Los 5 flujos

### Flujo 1 — Posts semanales (semi-automatizado, tu parte: 30 min/domingo)
El corazón. Patrón `essionix-jobfinder` aplicado a contenido:

```
GitHub Action (cron domingo 6 a.m.)
 └─ Agente Claude (Agent SDK, suscripción Max):
     lee → capturas de la semana (capture/), calendario editorial,
           posts ya publicados (histórico), guía de voz (voz.md)
     produce → 4 borradores de posts como PULL REQUEST
 └─ Tú (domingo, 30 min): revisas el PR, ajustas tu voz, merge
 └─ Lunes 15 min: pegas los 4 en el programador de LinkedIn (Lun/Mié/Jue/Vie)
```
- El PR es tu "firma": el agente propone, tú apruebas. IAOps puro.
- Requiere: `capture/` (notas sueltas, aprendizajes, comentarios buenos), `voz.md`
  (guía de tu tono, extraída de los 13 posts ya escritos), `calendario.md`.

### Flujo 2 — News-jacking automático (0 min hasta que suena)
```
GitHub Action (cron diario)
 └─ Agente lee RSS: AWS News Blog, Azure Updates, blog Datadog, HN (query "AI SRE")
 └─ Filtra: ¿lanzamiento/noticia relevante para IAOps?
 └─ Si hay señal → crea un Issue con resumen + borrador de post de reacción + email de aviso
```
Tú decides en minutos si publicas — llegar primero en español es tu ventaja competitiva.

### Flujo 3 — Demo quincenal (tu parte: 45 min de grabación)
```
Guion listo en demos/ (lo escribo yo) → grabas con OBS (45 min)
 → CapCut: subtítulos automáticos + cortes (30 min o delegable a futuro editor)
 → Agente genera: post de acompañamiento + primer comentario (runbook) + repo companion en GitHub
 → Publicar video nativo en LinkedIn + repo enlazado
```
Patrón NetworkChuck: cada demo deja un repo público (SEO + stars + lead magnet).

### Flujo 4 — Repurposing (F3+, tu parte: 0–15 min)
```
Demo larga → OpusClip/CapCut: 3 clips verticales (60-90s) con captions
 → Agente escribe caption por plataforma (TikTok/Reels/Shorts ≠ LinkedIn)
 → Metricool: programar la semana de clips en una sesión
Post LinkedIn top de la semana → agente lo adapta a X + edición newsletter (beehiiv)
```
Regla de oro: 1 pieza pilar/semana → 5-8 derivados. Nunca crear para cada red desde cero.

### Flujo 5 — Métricas (viernes, 10 min)
```
Tú: pegas números de LinkedIn (impresiones/seguidores/clicks) en metricas.md o al chat
 └─ Agente: actualiza histórico, detecta qué hooks/pilares funcionan,
    propone el énfasis de la semana siguiente (se lo pasa al Flujo 1)
```
El loop se cierra: la fábrica aprende de sus propios resultados.

## Qué NO automatizar (frontera de delegación — coherencia con tu marca)

- **Comentarios y DMs**: SIEMPRE tú. La autenticidad es el producto; además la automatización
  de engagement viola los ToS de LinkedIn y los lectores la huelen.
- **La aprobación final de cada post** (el merge del PR es tu firma).
- **Tu cara y tu voz en video** — irremplazables por diseño.

## Estructura en el repo

```
docs/iaops/
  cadena-produccion.md   ← este doc
  voz.md                 ← guía de voz para el agente (por crear)
  calendario.md          ← calendario editorial vivo (por crear)
  capture/               ← inbox de materia prima (notas, ideas, aprendizajes)
  posts/                 ← borradores y publicados (histórico del agente)
  demos/                 ← guiones
  metricas.md            ← histórico semanal (por crear)
.github/workflows/
  content-drafts.yml     ← Flujo 1 (cron domingo → PR)   [por construir]
  news-watch.yml         ← Flujo 2 (cron diario → Issue)  [por construir]
```
Nota: el `deploy.yml` del sitio debe ignorar `docs/**` (paths-ignore) para que la fábrica
no dispare despliegues del sitio.

## Orden de implementación

1. **Ya** (manual asistido, $0): `voz.md` + `calendario.md` + `capture/` — y el Flujo 1 se hace
   en sesión conmigo cada domingo (sin cron todavía). El Flujo 5 igual.
2. **Semana 2-3 de agosto**: automatizar Flujo 1 y 2 con GitHub Actions + Agent SDK
   (mismo esquema de secretos que jobfinder). El PR dominical llega solo.
3. **Septiembre** (F2): flujo de demos + repos companion.
4. **Octubre** (F3): repurposing + Metricool.

## Meta-jugada de contenido

La fábrica misma es material: *"Mi contenido de LinkedIn lo produce una cadena de agentes —
y yo solo firmo el PR"* es un post/demo perfecto para la semana 5-6. Documentar su construcción.
