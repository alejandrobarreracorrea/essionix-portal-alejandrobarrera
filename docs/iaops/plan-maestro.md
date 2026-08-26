# PLAN MAESTRO IAOps — Ago–Dic 2026

**El documento rector.** Todo lo demás (`estrategia`, `programa`, `cadena-produccion`,
`multimedia`, `benchmarking`) cuelga de aquí. Actualizado: 2026-07-27.

---

# ⚠️ REPRIORIZACIÓN — 2026-08-26

**Cambió el terreno:**
1. **Terremoto 7.4 (10-ago)** devastó Pereira (~95 muertos, desastre nacional) → Pereira Tech
   Day del 22-ago no se realizó; charla queda pendiente de nueva fecha (confirmar con Sebastián).
2. **Alejandro dictará cursos desde septiembre** (con Augusto Salazar): "Cloud Computing,
   Redes y Ciberseguridad Esencial" — Mar/Jue 6:30–9:30 p.m. Y Mié/Vie 6:30–9:30 p.m.
   = **12 h/semana de docencia nocturna**. Los estudiantes son el nuevo embudo principal.
3. Nuevo objetivo: **meetup en su grupo de Pereira** — charla "IAOps como camino de carrera"
   + donación de vouchers de certificación (solidaridad post-terremoto, cero venta).

**Consecuencias sobre el plan original:**
- ❌ **Cohorte propia de octubre: DIFERIDA a 2027** (imposible con 12 h/sem de docencia).
  Los cursos del instituto SON la enseñanza de este semestre; el embudo cambia:
  `estudiantes de cursos → web/LinkedIn → comunidad gratuita → mentoría 1:1 → (2027) cohorte propia`.
- ⬇️ Cadencia LinkedIn: de 4 → **3 posts/semana** (los 13 listos duran ~4.5 semanas).
- ⏫ **La automatización de la fábrica sube de prioridad** (con 12 h/sem menos, el PR dominical
  automático deja de ser opcional).
- ⏫ **Comunidad gratuita AHORA** (destino de los estudiantes): WhatsApp Comunidad "IAOps LATAM"
  ($0, fricción cero en LatAm) → migrar a Skool cuando haya masa/monetización.
- El webinar de sep se reemplaza por el **meetup** (ver `meetup-pereira.md`).

## Nueva prioridad de ataque (P0 → P3)

| P | Qué | Cuándo | Dueño |
|---|---|---|---|
| **P0** | Perfil LinkedIn terminado (about/titular ya entregados) + foto + banner + destacados | Esta semana | Alejandro |
| **P0** | **Web al día para recibir estudiantes**: sección "Formación" (cursos, mentoría, comunidad, charlas) + QR/link corto para dictar en clase | Esta semana | Claude |
| **P0** | **Arrancar publicación**: 3 posts/sem con el banco de 13 listos (programar lunes) | Lun 31-ago | Alejandro (15 min) |
| **P1** | Comunidad WhatsApp "IAOps LATAM" creada y enlazada en web + clases | Sem 1 sep | Ambos |
| **P1** | **Meetup Pereira**: logística (fecha, lugar/virtual, vouchers), charla adaptada "IAOps como camino" | Sep | Ambos |
| **P1** | Redes sociales base: YouTube + Instagram/TikTok con marca (banners/bios desde plantillas) | Sem 1-2 sep | Claude genera, Alejandro crea cuentas |
| **P2** | Automatizar fábrica (`content-drafts.yml` + `news-watch.yml`) | Sem 2 sep | Claude |
| **P2** | Charla Tech Day: guion + deck listos para la nueva fecha | Cuando se confirme | Claude + ensayos |
| **P3** | Demos en video (cuando el ritmo docente se estabilice, ~oct) | Oct | Alejandro |

**Regla de supervivencia:** los cursos + el empleo son innegociables; todo lo demás se ejecuta
con la fábrica o no se ejecuta. Una mala semana = 2 posts, nunca cero.

## La tesis (norte de todo)

> **IAOps: la IA ejecuta la operación cloud. Tú diriges.**
> En US es "AI SRE" (Azure SRE Agent, AWS DevOps Agent GA 2026, Resolve.ai unicornio).
> En español, nadie es dueño del tema. La ventana es AHORA.

**El embudo completo:**
```
LinkedIn (contenido diario) → web alejandrobarrera.net (rutas) → mentoría Cal.com (USD 50/80/140)
        ↓ (sep)                                                        ↓ (oct)
   lista de espera  →  webinar gratis  →  Programa IAOps (cohorte, USD 197 → 297+)  →  formación equipos
```

**División del trabajo permanente:**
- **Tú** (lo indelegable): cara, voz, criterio, grabación, engagement (comentarios/DMs), la firma final de cada pieza.
- **Claude/agentes** (todo lo demás): borradores, guiones, plantillas, imágenes de marca, análisis, métricas, construcción técnica, automatización.

## ✅ Ya construido (inventario)

| Activo | Estado |
|---|---|
| Web de oferta IAOps (alejandrobarrera.net) | EN VIVO |
| Mentoría con precios (Cal.com 30/50/90 min) | Página lista; falta configurar cobro |
| Kit LinkedIn (titular, acerca de, checklist) | Escrito; falta aplicar |
| Banner LinkedIn (media/exports/banner-linkedin.png) | Renderizado, listo para subir |
| 13 posts + guion demo #1 | Listos |
| Programa IAOps (currículo 6 sem, precios, Skool) | Diseñado |
| Benchmarking US (AI SRE) | Hecho — término integrado |
| Fábrica de contenido (5 flujos, voz.md, calendario, capture/) | Diseñada; opera manual |
| Multimedia (plantillas carrusel/banner, shot list fotos) | Listas |

---

# EL ORDEN DE EJECUCIÓN

## ⚡ FASE 0 — Esta semana (preparación, ~4 h, TODO tuyo)

**Día 1 (60–90 min) — Perfil LinkedIn completo:**
1. Foto puente (la B/N de Cal.com) → luego la de la sesión.
2. Banner nuevo (está en `media/exports/banner-linkedin.png`).
3. Titular + Acerca de (kit en `estrategia.md`, versión educativa).
4. Quitar "En busca de empleo" (o solo-reclutadores).
5. Subir cert **AWS AI Practitioner**.
6. Modo creador ON · Destacados: alejandrobarrera.net + Cal.com.

**Día 2 (45 min) — Activar el cobro:**
7. Cal.com: renombrar/crear event types → Sesión exprés 30 min / Mentoría 1:1 50 min / Architecture review 90 min, con precios 50/80/140 USD.
8. Conectar PayPal (developer.paypal.com → app Live → Client ID + Secret → Cal.com Apps → PayPal).
9. Reserva de prueba: verificar que pida pago.

**Día 3 (30 min) — Materia prima:**
10. Agendar la **sesión de fotos** (shot list en `multimedia.md`).
11. Leer y ajustar a tu voz los 4 posts de `posts/semana-01.md`.
12. Programarlos en LinkedIn (Lun/Mié/Jue/Vie 7:30 a.m.).

> **Criterio de salida de Fase 0:** perfil completo + cobro funcionando + 4 posts programados.
> Sin esto NO se publica nada — el tráfico del primer post debe aterrizar en un perfil listo.

## 🚀 AGOSTO — F1: Texto + ritmo (4–5 h/sem)

**Ritmo semanal fijo (se mantiene todo el semestre):**
| Día | Qué | Tiempo |
|---|---|---|
| Lun–Vie | Post del día ya programado + responder TODOS los comentarios 1ª hora | 20 min/día |
| Mar–Vie | Comentar con criterio en 5 cuentas del nicho | 15 min/día |
| Viernes | Métricas → sesión con Claude (Flujo 5): qué funcionó, ajuste | 10 min |
| Domingo | Revisar borradores de la semana siguiente (con Claude, Flujo 1 manual) + tirar notas a `capture/` | 30–45 min |

- **S1:** posts 1–4 (fundación). **S2:** posts 5–8. **S3:** posts 9–12 (cierra con CTA mentoría).
- **S2:** sesión de fotos ejecutada → actualizar foto de perfil y guardar assets en `media/fotos/`.
- **S3:** Claude construye la **lista de espera del Programa** en la web (sección + beehiiv/form) → CTA suave desde posts.
- **S4:** post 13 (puente AI SRE) + 3 nuevos (primer ciclo del Flujo 1 con Claude). Primer **carrusel** (plantilla lista).
- **Decisión fin de ago:** si el ritmo se sostuvo 3+ semanas → Claude automatiza `content-drafts.yml` + `news-watch.yml` (el PR dominical llega solo).

**Checkpoint 31-ago:** 16 posts publicados · ritmo sostenido · lista de espera abierta · primeras conversaciones en comentarios.

## 🎬 SEPTIEMBRE — F2: Video demos + preventa (5–6 h/sem)

- **S1:** grabar **Demo #1** ("Claude decomisionó mi legacy", guion listo) → OBS + CapCut → publicar con repo companion (patrón NetworkChuck). Posts siguen (Flujo 1).
- **S2:** posts + reaccionar a noticias AI SRE (news-watch). Empujar lista de espera en cada pieza.
- **S3:** **Demo #2: "Probé el AWS DevOps Agent en mi nube"** (first-mover en español — pieza de posicionamiento).
- **S4:** **Webinar gratuito** "Opera tu nube con IA: demo en vivo" (YouTube Live/StreamYard) → al final: **preventa cohorte fundadora** (USD 197, 10–15 cupos, bonus 1 mentoría).

**Checkpoint 30-sep:** lista de espera ≥40 · webinar ≥25 en vivo · **≥5 cupos vendidos → se activa Skool**. Si <5: cohorte alfa gratuita con 5 personas por testimonios, relanzar en nov.

## 🎓 OCTUBRE — F3: Cohorte 1 + cara + clips (6–8 h/sem — pico)

- Montar **Skool**: community gratuita "IAOps LATAM" (lead magnet permanente) + grupo pago con classroom (módulos del programa).
- **Cohorte 1 arranca**: 1 live/semana (90 min) + revisión de misiones. Los lives = materia prima de contenido (clips, lecciones, preguntas → posts).
- Video a cámara 1/semana (kit: celular + lavalier + luz) + **clips verticales** (OpusClip/CapCut) programados con Metricool → TikTok/Reels/Shorts.
- **Demo #3:** "Claude Code vs AWS DevOps Agent vs Azure SRE Agent".

**Checkpoint 31-oct:** cohorte corriendo · ≥1.500 seguidores · mentorías fluyendo del contenido.

## 🏆 NOVIEMBRE — F4: Prueba social + escala

- **Demo Day cohorte 1** → posts de testimonios y resultados (tu mejor marketing del año).
- **Preventa cohorte 2** a precio pleno (USD 297–397).
- Live mensual en YouTube (se vuelve ritual).
- Post meta: *"Mi contenido lo produce una cadena de agentes — yo solo firmo el PR"* (+ demo de la fábrica).
- Evaluar newsletter beehiiv como activo propio (si lista ≥100).

## 🎄 DICIEMBRE — Cosecha y 2027

- Cohorte 2 (si hay energía y ventas) o descanso estratégico.
- Recap del año en público (transparencia radical: números reales).
- Plan 2027: ¿YouTube como segundo pilar? ¿Programa evergreen? ¿Independencia?

---

## 🎯 Metas 31-dic (realistas, definidas en estrategia)

| Métrica | Meta |
|---|---|
| Seguidores LinkedIn | 3.000–5.000 (desde ~209) |
| Sesiones de mentoría pagas | 10–20 acumuladas |
| Cohortes del programa | 1–2 (8–15 alumnos c/u) |
| Clientes de formación/equipos | 2–3 |
| El activo real | El sistema corriendo con 4 h/sem + tu nombre = IAOps en español |

## Reglas que no se negocian
1. **Nada se publica sin tu firma.** 2. **Comentarios y DMs siempre tú.** 3. **Solo operación real** — nada inventado. 4. **Cero menciones del empleador**; Essionix vive aparte. 5. Si una semana no se puede: se reduce a 2 posts, **nunca a cero** — el ritmo es el activo.
