# Multimedia — fotos, imágenes y video de la marca IAOps

**Doc:** 2026-07-26 · capa visual de `cadena-produccion.md`
**Regla de oro:** lo REAL es el producto. La IA produce plantillas, diagramas y ensamblaje;
tu cara, tu voz y tus screenshots son siempre auténticos. Prohibido: avatares IA, voz clonada,
stock genérico, imágenes "futuristas con robots".

## 1. Identidad visual (una sola, en todo)

Reutiliza los tokens del sitio — coherencia total web ↔ posts ↔ video ↔ thumbnails:

| Token | Valor |
|---|---|
| Fondo | `#08080b` (dark) · superficie `#121217` |
| Acento | gradiente `#8b7bff → #38e0d8` (violeta→cian) · rosa `#ff7ad9` puntual |
| Texto | `#f5f5f7` / muted `#9c9caa` |
| Tipos | Space Grotesk (títulos) · Inter (cuerpo) · JetBrains Mono (código/etiquetas) |
| Sello | el momento de la **firma** (aprobación del agente) destacado en gradiente |

Plantillas HTML listas en `media/templates/` (se abren en el navegador → screenshot/PDF).

## 2. Fotos (lo primero — no tienes ni foto de perfil)

**Una sesión real de 1–2 h rinde 6 meses de assets.** (Bogotá: ~COP 300–600K, o un amigo
con buen celular + luz de ventana.) **Shot list para la sesión:**

1. Retrato fondo neutro oscuro, mirada a cámara, medio sonriente → **perfil LinkedIn** (y recorte para YouTube).
2. Mismo retrato con 3 expresiones exageradas (sorpresa, duda, "aprobado" con pulgar) → **thumbnails**.
3. Trabajando frente al terminal (over-the-shoulder, pantalla con código real) → banners/posts.
4. Gesticulando como explicando (manos visibles, medio cuerpo) → carruseles/portadas.
5. Vertical de cuerpo entero fondo limpio → recortes para Reels/Shorts.
6. Detalles: manos en teclado, taza de café, setup → b-roll de video.

Pedir: RAW o máxima calidad, fondo oscuro/neutro, luz lateral suave. Mientras tanto: la foto
B/N de Cal.com sirve de puente para el perfil.

## 3. Imágenes de posts LinkedIn (por tipo)

| Tipo | Cuándo | Herramienta | Costo |
|---|---|---|---|
| **Solo texto** | Default (rinde bien en LinkedIn) | — | $0 |
| **Screenshot real de terminal** | Posts de demo/prueba — es tu evidencia | macOS ⌘⇧4 + marco en [shots.so](https://shots.so) (gratis) | $0 |
| **Carrusel PDF** (top formato de alcance) | 1/semana desde F2: runbooks, "5 delego / 3 jamás", rutas | Plantilla `carrusel.html` → el agente llena el contenido → imprimir a PDF | $0 |
| **Diagrama de arquitectura** | Posts técnicos | Excalidraw (estilo sketch) o Mermaid generado por Claude | $0 |
| **Quote card** | Frases de marca (1 c/2 semanas máx.) | Plantilla `quote.html` | $0 |

Flujo: el agente del Flujo 1 indica en cada borrador QUÉ imagen lleva y genera el contenido
del carrusel; tú solo screenshoteas/exportas de la plantilla.

## 4. Video (por fase)

**F2 — screen demos (sep):** OBS (escena: pantalla + webcam en burbuja esquina inferior).
Terminal con fuente grande (18–20pt), tema oscuro del sitio. CapCut: subtítulos auto es-CO
(estilo: Space Grotesk blanco, resaltado gradiente), cortes de silencio.
**F3 — cara (oct):** kit barato: celular moderno en trípode (~COP 60K) + luz frontal
(ventana o aro ~COP 100K) + micrófono lavalier (~USD 20) — el AUDIO importa más que la cámara.
Audio: limpiar con Adobe Podcast Enhance (gratis). Encuadre: medio cuerpo, fondo con
profundidad (no pared plana).
**Clips verticales:** OpusClip/CapCut desde las demos; hook en los primeros 2 s (el momento
de la firma es tu mejor gancho recurrente).
**Música/SFX:** YouTube Audio Library (gratis, sin copyright). Bajo, nunca sobre tu voz.

## 5. Thumbnails YouTube (F3+)

Fórmula NetworkChuck adaptada: tu cara con expresión (fotos #2 de la sesión) + 3–5 palabras
enormes en Space Grotesk + un elemento de la operación (terminal/logo AWS/Claude) + gradiente
de marca. Plantilla en Canva (gratis) clonando los tokens. Regla: legible en 120px de ancho.

## 6. Biblioteca de assets

```
docs/iaops/media/
  templates/        banner-linkedin.html · carrusel.html · quote.html
  fotos/            sesión (cuando exista) — originales + recortes
  exports/          PNGs/PDFs generados listos para publicar
```

## 7. Qué automatiza la IA aquí

- Generar contenido de carruseles y quotes (Flujo 1) sobre las plantillas.
- Diagramas Mermaid/HTML de arquitecturas.
- Sugerir el frame del hook para clips (a partir del guion).
- Ensamblar el banner/plantillas nuevas on-demand (pedir a Claude).
- **Nunca**: tu rostro sintético, tu voz clonada, "fotos" tuyas generadas.
