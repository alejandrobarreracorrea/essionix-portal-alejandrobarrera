# AWS User Groups — lineamientos gráficos oficiales

Extraídos del kit oficial (Slides template, logos, graphics, badges) que entregó AWS
Comunidades. Base para el deck de **AWS User Group Pereira** (conferencia 2026-09-28, 7 pm).

## Paleta (theme oficial)
| Rol | Hex |
|---|---|
| Fondo oscuro (base) | `#151D25` |
| Blanco | `#FFFFFF` |
| **Púrpura** (primario de marca) | `#AC5BFF` |
| Naranja AWS | `#FF9900` |
| Magenta | `#FF57E9` |
| Verde | `#00E582` |
| Azul | `#41B3FF` |

El púrpura es el color firma (el logo "User Groups" es púrpura). Los demás son acentos
vibrantes; se usan con moderación sobre el fondo oscuro.

## Tipografía
- Oficial: **Aptos Display** (títulos) + **Aptos** (cuerpo).
- Equivalente web (Aptos no está en Google Fonts): **Inter** (o Figtree/Plus Jakarta Sans).

## Logo
- `assets/logo/logo-dark.svg` — "AWS" en blanco + "User Groups" púrpura → usar sobre fondo OSCURO.
- `assets/logo/logo-light.svg` — "AWS" en dark + "User Groups" púrpura → usar sobre fondo CLARO.
- Chapter logo: plantilla en `marca/chapter-logo-template/` para crear el logo del capítulo (Pereira).

## Gráficos firma
- **Cityscapes** (`assets/cityscapes/`): skyline de línea púrpura (edificios, árboles, sol,
  antena wifi, puntos). Ideal como banda decorativa (pie de slide / portada).
- **Background** (`assets/background.png`): fondo oficial.
- **Icon-badges** (`assets/icons/`): ~48 íconos de línea (light) para secciones/bullets.
- **Badges** (en `marca/badges/`): speaker, leader, member, supporter, volunteer.

## Uso en el deck
- Fondo `#151D25`, texto blanco, acentos púrpura + (naranja/verde/azul/magenta puntuales).
- Logo UG (light sobre el fondo oscuro) en portada y cierre.
- Banda de cityscape como elemento gráfico recurrente.
- Íconos de línea del kit para las secciones.

## Nota de repositorio
El material fuente pesado (decks OpenClaw ~545 MB, Builder Series, plantillas .pptx) y el
toolkit crudo (`marca/`, `fuentes/`) están **gitignored** — no se publican en el repo
público. Solo se versiona `assets/` (lo que usa el deck) + el deck rediseñado.
Los decks OpenClaw quedaron en `~/Downloads` para no duplicar ~545 MB.
