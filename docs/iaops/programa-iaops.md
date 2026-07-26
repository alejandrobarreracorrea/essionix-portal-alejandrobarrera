# Programa IAOps — "Opera tu nube con agentes de IA"

**Doc:** diseño del programa de formación · 2026-07-26 · coherente con `estrategia.md` y las rutas del sitio.

## La promesa (Hormozi: resultado + plazo + mecanismo)

> **En 6 semanas, tu propia infraestructura corre operada por agentes de IA** — deploys,
> cambios y costos delegados bajo tu firma — vengas de on-premise, de la nube "de clicks"
> o estés empezando.

No es un curso de teoría de IA. Es un programa de **operación**: cada semana delegas una
pieza real de tu operación a un agente, con límites y aprobaciones. Sales operando, no
"sabiendo".

## Para quién (las mismas rutas del sitio)

- **R/01 Veteranos** (on-premise, click-ops, DBA, sysadmin): el puente encima de su criterio.
- **R/02 Builders** (juniors/transición): entrar a cloud directo en la era de agentes.
- (R/03 Equipos NO entra aquí: eso es formación corporativa aparte, ticket mayor.)

Una sola cohorte mixta: los veteranos aportan criterio, los builders aportan velocidad.
La comunidad es el multiplicador.

## Formato

- **Cohorte de 6 semanas** + semana 0 de onboarding.
- **1 sesión en vivo/semana (90 min)**: 20 min de modelo mental + 50 min de demo en vivo
  (operación real) + 20 min de Q&A. Grabada.
- **1 misión práctica/semana** en el laboratorio propio del alumno, revisada en comunidad.
- **Demo Day** final: cada alumno muestra su operación corriendo con agentes.
- Comunidad (Skool): dudas, revisión de misiones, gamificación por misiones completadas.

### Capstone (lo que el alumno se lleva)
1. **Laboratorio vivo propio**: dominio/infra real (capa gratuita), definida en Terraform,
   desplegada por pipeline, operada por agentes.
2. **3+ runbooks delegados** funcionando (deploy, cambio DNS/certificado, auditoría FinOps).
3. **Su frontera de delegación** documentada: qué ejecuta la IA sola, qué exige su firma.
4. **Bitácora pública** (portafolio que vale más que el diploma).

## Currículo (6 semanas)

| Sem | Módulo | Modelo mental | Misión (en TU lab) |
|---|---|---|---|
| 0 | **Onboarding** | Qué es IAOps; reglas del juego | Cuentas (AWS free tier, GitHub, Claude), lab base, mapa de toil personal |
| 1 | **El contrato IAOps** | La IA ejecuta, tú diriges; frontera reversible/irreversible; permisos mínimos | Tu primer agente ejecuta una tarea reversible de punta a punta y te reporta |
| 2 | **Código, no clicks** | Los agentes hablan código; IaC como idioma de la operación | Migra un recurso click-ops a Terraform — el agente escribe, tú revisas el plan |
| 3 | **El pipeline** | Push→deploy; OIDC sin llaves; el PR como compuerta de aprobación | Tu lab se publica solo; el agente propone cambios vía PR, tú apruebas |
| 4 | **Runbooks delegables** | Patrón verificar→backup→cambiar→validar; la firma humana | Operación "peligrosa" real (cambio DNS/cutover) delegada con aprobaciones |
| 5 | **FinOps con agentes** | El desperdicio existe porque buscarlo aburre; guardrails de presupuesto | El agente audita tus costos y produce un reporte por impacto; ejecutas lo aprobado |
| 6 | **Incidentes + Demo Day** | Primera respuesta con agentes; evidencia y bitácora automática | Simulacro de incidente + presentación de tu operación (Demo Day) |

Coherencia total con la marca: el currículo ES el manifiesto del sitio ejecutado
(3 principios), y las misiones son las mismas operaciones que Alejandro documenta en
LinkedIn (posts/demos = marketing del programa sin fricción).

## Requisitos honestos (decirlos ANTES de vender)

- Computador + ~5 h/semana.
- Cuenta AWS capa gratuita (gasto esperado: USD 0–10 en las 6 semanas).
- Suscripción Claude (~USD 20/mes) — la herramienta de agentes del programa.
- NO se requiere saber programar (ruta Builder) ni experiencia cloud previa (ruta Veterano la trae).

## Precio

- **Cohorte fundadora (oct 2026):** USD **197** · 10–15 cupos · incluye 1 sesión de
  mentoría 1:1 (valor 80) como bonus fundador → ancla de testimonios.
- **Precio objetivo (cohorte 2, nov–dic):** USD **297–397** según demanda.
- Referencias: lab10 "desde USD 650" (8 sem); mentoría propia USD 80/sesión;
  6 lives + comunidad + revisión ≈ valor percibido >> 197.
- Cobro: Skool (USD, tarjeta) + alternativa Hotmart/PayPal para quien no pueda con tarjeta USD.

## Plataforma (decisión)

1. **Validación (ago–sep):** lista de espera (web + LinkedIn) — sin plataforma paga.
2. **Prevención de riesgo:** webinar gratis en sep (demo en vivo) → preventa cohorte fundadora.
   Con 5+ cupos vendidos se activa Skool (la mensualidad queda pagada).
3. **Entrega (oct):** **Skool Pro** — community gratuita "IAOps LATAM" (lead magnet
   permanente, reemplaza al PDF) + grupo pago de la cohorte con classroom por módulos.
4. Si el checkout USD frena a muchos: **Hotmart** como pasarela alterna (PSE/cuotas) con
   acceso manual al Skool.

## Calendario de lanzamiento (ligado al plan de contenido)

| Mes | Acción |
|---|---|
| Ago | Aplicar kit LinkedIn + publicar semanas 1–3 de posts · abrir **lista de espera** (CTA suave en web y perfil) |
| Sep | Demos en video (F2) · **webinar gratuito** "Opera tu nube con IA: demo en vivo" · preventa fundadora |
| Oct | **Cohorte 1** (6 semanas, cruza a nov) · los lives generan contenido |
| Nov | Demo Day cohorte 1 · testimonios · preventa cohorte 2 (precio pleno) |
| Dic | Cohorte 2 o descanso + planeación 2027 según energía/tracción |

⚠️ **Presupuesto de tiempo:** durante la cohorte, la carga sube a ~6–8 h/semana
(90 min live + preparación + revisión). El plan de contenido se alimenta de los lives
para compensar (clips, lecciones, preguntas de alumnos → posts).

## Métricas de validación

- Lista de espera ≥ 40 personas antes del webinar.
- Webinar ≥ 25 asistentes en vivo.
- Cohorte fundadora ≥ 8 cupos vendidos (break-even holgado de Skool + señal real).
- Si no se llega: NO se cancela — se hace una "cohorte alfa" gratuita/simbólica con 5
  personas a cambio de testimonios, y se relanza en nov con prueba social.

## Pendientes de decisión

- Nombre público final: "Programa IAOps" (working title) vs alternativa con más gancho.
- Día/hora del live semanal (sugerido: martes o jueves 7:30 p.m. COL).
- Herramienta de webinar (YouTube Live gratis vs Zoom).
