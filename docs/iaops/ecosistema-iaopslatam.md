# Ecosistema IAOps LATAM — arquitectura de negocio + UX v2

**Doc:** 2026-08-28 · resuelve: "el registro debe ser comunidad, mi experiencia como sombra,
monetización coherente, UX liviana". Sustituye la lógica de dominios anterior.

## 1. La regla de oro (resuelve TODA la complejidad de monetización)

> **GRATIS lo que escala. PAGO lo que toca tu tiempo.**

- **Escala sin ti** → gratis: comunidad, runbooks, cursos grabados básicos, clases abiertas.
  (Es lo que construye la afirmación "la comunidad de referencia".)
- **Toca tu tiempo** → pago: mentoría 1:1, cohortes en vivo, revisión de labs, formación de equipos.
- (Futuro) **Acredita** → pago: certificados/diplomas del programa.

Cada decisión futura ("¿este curso es gratis o pago?") se responde con esa regla en 2 segundos.

## 2. La escalera de valor

```
N0  GRATIS   Comunidad IAOps LATAM  ←— EL REGISTRO ES ESTO: hacerse MIEMBRO
             + cursos gratuitos grabados + runbooks + noticias AI SRE
N1  $        Cursos premium self-paced / retos            USD 27–97      [escala]
N2  $$       Programa IAOps (cohorte en vivo)             USD 197–397    [tu tiempo, grupal]
N3  $$$      Mentoría 1:1 con Alejandro                   USD 50–140/ses [tu tiempo, individual]
N4  $$$$     Equipos y empresas (→ Essionix)              USD miles      [B2B]
```

**Regla de flujo:** todo el mundo entra por N0. Los niveles pagos se descubren DENTRO del
ecosistema (páginas de cursos, comunidad, emails) — nunca como puerta de entrada.
Validación externa: el modelo free→paid→premium es el estándar 2026 de negocios
community-led (ladder de 3 niveles; membresías como base primaria de ingreso).

## 3. Arquitectura de marcas y dominios (el flip)

| Dominio | Rol nuevo | Contenido |
|---|---|---|
| **iaopslatam.com** | **LA CASA** (deja de ser redirect → sitio principal) | Comunidad, registro de miembros, cursos (gratis/pago), programa |
| **alejandrobarrera.net** | **EL MENTOR** (se simplifica) | Perfil personal, la prueba, mentoría 1:1, charlas — enlazado como "el fundador" |
| **essionix.com** | **B2B** (sin cambios) | Productos y servicios enterprise |

**"La sombra de la experiencia":** en iaopslatam.com Alejandro aparece como *fundador* —
una sección sobria ("Quién está detrás": foto + "10+ años · 14 certificaciones · opera su
propia nube con agentes" + link a su página personal). La comunidad es la protagonista;
su credibilidad es el respaldo, no el show.

**Integridad del claim:** "la comunidad MÁS GRANDE de LATAM" no se imprime hasta que los
números lo respalden (regla anti-humo). Mientras tanto, claim de categoría:
> **"La comunidad de la operación moderna en la nube — en español."**
(Dueño de la categoría sin mentir sobre el tamaño.)

## 4. El registro = membresía

- El wizard existente (nombre+email → firma por código → perfil) se **reposiciona**: ya no es
  "déjame tus datos" sino **"Hazte miembro de IAOps LATAM"**. Mismo backend
  (Lambda + DynamoDB = el padrón de miembros), nuevo copy y nueva casa: `iaopslatam.com/unirme`.
- Post-verificación: bienvenida como MIEMBRO + (cuando exista) invitación al Telegram/Skool.
- CORS de la Lambda: añadir `https://iaopslatam.com`.

## 5. UX v2 — "Liviano" (diagnóstico y sistema)

**Por qué se siente pesada la actual:** 3 capas `fixed` animadas repintando siempre
(aura animada + grano + cursor-glow), animación por letra en el hero, botones magnéticos,
reveals escalonados en todo, y páginas con MUCHO texto por pantalla.

**Lecciones de Lab10 (adoptar, no copiar):** claridad en 3 segundos (quién/qué/CTA), una
columna, secciones cortas, UN CTA primario por pantalla, microcopy bajo los campos, pasos
visibles, botones grandes y amables, cero ornamento que no informe.

**Sistema v2 (mismos tokens, ejecución ligera):**

| | v1 (actual) | v2 (liviano) |
|---|---|---|
| Fondo | Aura animada + grano + glow | **Gradiente estático sutil** (1 capa, sin animación) |
| Hero | Kinetic por letra + shimmer | Título estático grande, fade simple de página |
| Botones | Magnéticos | Normales, grandes, hover simple |
| Reveals | Escalonados por elemento | **Uno solo por página o ninguno** |
| Texto | Párrafos largos | Título ≤6 palabras · sub ≤20 · bullets |
| CTA | Varios por página | **Uno primario** (+1 secundario máx.) |
| Presupuesto | — | 0 capas fixed animadas · CSS <25KB · LCP <1.5s |

Se conserva: dark + gradiente violeta→cian (1–2 acentos por pantalla), Space Grotesk/Inter/Mono,
aire generoso, filas editoriales (sin cards), bilingüe.

## 6. Mapa del nuevo iaopslatam.com (5 páginas, cortas)

1. **/** — Hero: "La comunidad de la operación moderna en la nube." + 1 línea + **[Únete gratis]**
   · 3 bullets de qué recibes · la escalera (gratis → cursos → mentoría) en 3 filas ·
   **"Quién está detrás"** (la sombra: 2 líneas + link) · CTA final.
2. **/unirme** — el wizard (copy de membresía). LA página que se dicta en clase.
3. **/cursos** — lista editorial: badge GRATIS / precio; estados "disponible / próximamente".
   (Arranque honesto: 1–2 gratis "próximamente" + el Programa como cohorte.)
4. **/mentoria** — "Mentoría con el fundador": precios + Cal (o puente a alejandrobarrera.net).
5. **/programa** — la cohorte (del doc programa-iaops.md) con lista de espera.

**alejandrobarrera.net se simplifica** (v2 ligera también): hero personal corto + la prueba +
mentoría + charlas; toda mención de comunidad apunta a iaopslatam.com.

## 7. Fases de implementación

- **F1 (con luz verde):** construir iaopslatam.com v1 (5 páginas, sistema v2, wizard de
  membresía) — infra propia por Terraform (bucket+distro reemplazan el redirect; el 301 pasa
  a ser al revés donde aplique). CORS Lambda ampliado.
- **F2:** aligerar alejandrobarrera.net al sistema v2 y simplificar su contenido (mentor).
- **F3:** cursos reales: gratuitos (YouTube/embeds) → premium (checkout Hotmart/Skool según
  decisión de plataforma del programa).

## Fuentes (investigación 2026)
- [Kourses — 9 modelos de monetización de comunidades](https://kourses.com/how-to-monetize-a-community/)
- [Circle — Creator economy statistics 2026](https://circle.so/blog/creator-economy-statistics) (membresías como base primaria)
- [Communipass — Free vs Paid community setup](https://communipass.com/blog/skool-free-vs-paid-community-2026/) (ladder gratis→pago→premium)
- Benchmarks previos: `benchmarking-us.md` (Lab10, NetworkChuck, Skool).
