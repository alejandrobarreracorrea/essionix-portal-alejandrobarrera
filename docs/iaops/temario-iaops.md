# Temario IAOps — el currículo que rompe el mercado

**Doc:** 2026-08-29 · investigación de demanda + competencia + diseño curricular completo.
Modelo de entrega inspirado en Lab10 (clases gratis → retos → programa con certificado).

## 1. La inteligencia (por qué esto rompe)

### Demanda (validada 2026)
- Ofertas de empleo que mencionan "agentic systems": **de 151 (2024) a +16.500 (2025)** — el
  salto de demanda de skills más agudo que registra el AI Index de Stanford.
- Rol emergente con nombre propio: **"AIOps Specialist"** — "las empresas que desplegaron
  agentes en 2025 descubren que necesitan a alguien cuyo trabajo sea mantenerlos corriendo".
- Salarios US del rol: **USD 155K–275K**; el skill IA paga prima del 28–56%.
- **51% de las empresas** reporta falta de talento IA; los roles senior tardan **3–5x más** en
  llenarse que un rol genérico. El cuello de botella es formación, no demanda.

### Competencia (el mapa del hueco)
| Quién | Qué enseña | Lente | Idioma |
|---|---|---|---|
| **Lab10** | Construir CON IA (agentes, apps, MCP, RAG) — builders | Producto | ES |
| **KodeKloud** | AIOps path (Prometheus/Grafana, remediación) + crash course AI-DevOps | **Observabilidad** (AIOps clásico: la IA observa/alerta) | EN |
| **Coursera/AWS** | "DevOps and AI on AWS: AIOps" — fatiga de alarmas, monitoreo | Observabilidad, académico | EN |
| **Nadie** | **Agentes que EJECUTAN la operación bajo firma humana, con metodología** | **Agentic ops** | **ES** |

**La apertura es doble:**
1. **Lente**: todos enseñan "IA que observa" o "herramientas de IA"; nadie enseña **"IA que
   opera bajo tu dirección"** — el modelo que AWS/Azure ya venden en producto (DevOps Agent /
   SRE Agent GA 2026) y para el que NO existe formación.
2. **Idioma + identidad**: en español no hay NADA, y el mensaje de carrera ("tu experiencia
   vale más que nunca") no lo tiene nadie.

**El posicionamiento en una frase:** *Lab10 forma builders. IAOps LATAM forma a quienes los
mantienen vivos en producción — y a los que dirigen la infraestructura de todo lo demás.*
(TAM mayor: todo el mundo TI opera algo; no todo el mundo construye productos.)

## 2. Tesis curricular (las 3 reglas de todo contenido)

1. **Se aprende operando**: toda clase/reto/módulo termina con algo REAL corriendo en la
   infraestructura del alumno (capa gratuita basta). Cero teoría suelta.
2. **La firma es el corazón**: cada pieza enseña la frontera de delegación (reversible se
   delega, irreversible se firma). Es el diferenciador metodológico y de marca.
3. **Entregable público**: repos, bitácoras y labs visibles — el portafolio del alumno es el
   marketing del siguiente alumno.

## 3. Taxonomía (los filtros del catálogo)

`FUNDAMENTOS · AGENTES · CÓDIGO & PIPELINES · OPERACIÓN · FINOPS · INCIDENTES & GUARDRAILS`
(+ etiqueta transversal CARRERA). Niveles: **Básico · Intermedio · Avanzado**.

## 4. El stack de producto (modelo Lab10 → escalera IAOps)

| Pieza | Formato | Rol en la escalera |
|---|---|---|
| **Clases gratuitas** (catálogo: 12 al lanzar → 40+) | 20–35 min grabadas, cada una con misión | N0 — descubrimiento/SEO |
| **RETOS** (el arma de crecimiento: Lab10 tiene retos con 17K y 29K inscritos) | 5–7 días · gratis · clase corta diaria + misión + email + comunidad | N0 — viralidad y hábito |
| **Programa IAOps** (cohorte) | 6 semanas · entregable semanal · 2 rutas (Veterano/Builder) · **Certificado IAOps** · Demo Day | N2 — USD 197→397 |
| **Mentoría 1:1** | Cal.com | N3 |
| (2027) **Programa Avanzado / Enterprise** | multi-agente, gobernanza, equipos | N2.5/N4 |
| (2027) **Certificación IAOps por examen** | credencial independiente del programa | Nuevo ingreso |

Admisiones del programa (patrón Lab10): llamada de 15 min + WhatsApp — el toque humano que
convierte.

## 5. EL TEMARIO

### 5.1 Catálogo de clases gratuitas — v1 (las 12 primeras, en orden de grabación)

| # | Clase | Cat. | Nivel | El alumno termina con… |
|---|---|---|---|---|
| 1 | **Qué es IAOps** (y por qué en EE.UU. lo llaman AI SRE) | FUND | B | El mapa mental + el término |
| 2 | **La frontera de delegación**: qué firma un humano | FUND | B | Su primera política de delegación escrita |
| 3 | **Tu primer agente ejecutando** una tarea real de operación | AGENTES | B | Un agente que ejecutó y reportó |
| 4 | **Claude Code para operar tu nube** (setup completo) | AGENTES | B | Entorno agéntico funcionando |
| 5 | **De clicks a Terraform con un agente** | CÓDIGO | B | Su primer recurso migrado a código |
| 6 | **Pipeline OIDC: deploys sin llaves** (y sin consola) | CÓDIGO | I | Push→deploy corriendo |
| 7 | **Audita tu factura AWS con un agente** (FinOps en 30 min) | FINOPS | B | Reporte real de su propia cuenta |
| 8 | **El runbook delegable**: verificar→backup→cambiar→validar | OPERACIÓN | I | Un runbook ejecutado por agente |
| 9 | **Cambio de DNS en producción con firma** (caso real) | OPERACIÓN | I | Un cutover supervisado |
| 10 | **Permisos mínimos: IAM para agentes** | GUARDRAILS | I | Rol scoped para su agente |
| 11 | **Primera respuesta a incidentes con agentes** | INCIDENTES | I | Playbook de diagnóstico delegado |
| 12 | **AWS DevOps Agent y Azure SRE Agent: qué son y cómo dirigirlos** | AGENTES | I | Criterio vendor (first-mover ES) |

Regla de producción: **cada demo de la fábrica de contenido ES una clase** (guion→OBS→CapCut
→catálogo). Meta: +2 clases/mes desde octubre.

### 5.2 RETOS (los 3 lanzamientos — el formato que Lab10 prueba con decenas de miles)

**RETO 1 — "5 días para tu primera nube dirigida"** (Básico · el masivo · lanzar primero)
> Día 1: cuenta AWS capa gratuita + Claude listo · Día 2: primer agente ejecuta (algo
> reversible) · Día 3: tu primer recurso en Terraform · Día 4: push→deploy sin consola ·
> Día 5: tu lab público + bitácora. **Terminas con infraestructura real dirigida por ti.**

**RETO 2 — "Caza el desperdicio: FinOps en 5 días"** (Básico · el gancho de dinero)
> Un agente audita tu factura día a día: huérfanos, tamaños, horarios, storage. **Terminas
> con un reporte de ahorro real de TU cuenta** (o la de tu empresa). El reto que un jefe
> aprueba — puerta de entrada B2B.

**RETO 3 — "7 días, un runbook delegado"** (Intermedio · el técnico)
> De cero a un runbook de operación ejecutado por agente con aprobaciones: deploy, cambio
> DNS o backup-restore. **Terminas con tu primera operación firmada.**

Formato: inscripción → email diario (SES ya montado) + clase de 15–20 min + misión + hilo en
comunidad. Cierre: invitación al Programa.

### 5.3 Programa IAOps (cohorte — ya diseñado, ahora alineado al patrón Lab10)

6 semanas (contrato → código → pipeline → runbooks → FinOps → incidentes + **Demo Day**),
**2 rutas** (Veterano: desde su experiencia · Builder: desde cero), entregable semanal,
**Certificado IAOps** al completar el capstone, cohorte fundadora USD 197 → 297–397.
Admisión: llamada 15 min + WhatsApp. Detalle en `programa-iaops.md`.

### 5.4 Roadmap 2027 (cuando el catálogo madure)
- **Programa Avanzado**: multi-agente, gobernanza, evals de agentes de ops, plataforma interna.
- **IAOps para Empresas**: la ruta Equipos como producto B2B (→ Essionix).
- **Certificación IAOps por examen** + insignias por reto (gamificación).

## 6. Cómo ROMPE el mercado (las 7 palancas)

1. **Categoría nueva, no competencia**: builders (Lab10) vs **operators** (tú). Sin choque
   directo — de hecho, colaborable (sus builders necesitan aprender a operar lo que construyen).
2. **First-mover en español** en la habilidad con el salto de demanda más agudo del mercado
   (16.500 ofertas, 51% de gap de talento) — y ventana de 6–18 meses ya medida.
3. **El certificado IAOps**: primera credencial en español de operación agéntica, respaldada
   por un instructor 14x certificado — y con vouchers AWS como puente (el meetup ya lo ensaya).
4. **Retos como growth loop**: formato probado en LATAM (29K inscritos en un reto gratuito de
   Lab10) + tu fábrica de agentes puede producirlos en serie (emails SES ya montados).
5. **La prueba viva**: eres el único instructor cuyo material ES su propia operación en
   producción. "No es teoría, es mi lunes" no lo puede copiar un marketplace de cursos.
6. **Cantera propia**: docencia en Esumer (estudiantes cada semana), charlas, meetup — canales
   de distribución que un competidor online no tiene en Colombia.
7. **Timing de producto**: AWS DevOps Agent y Azure SRE Agent salieron GA en 2026 — las
   empresas YA compraron agentes que sus equipos no saben dirigir. Tú vendes exactamente eso.

## 7. Secuencia de ejecución (90 días, compatible con 6h/sem de docencia)

| Mes | Acción |
|---|---|
| **Sep** | Grabar clases 1–3 (las fundacionales — el guion sale de los posts ya escritos) · publicarlas en /cursos/ · anunciar RETO 1 para octubre |
| **Oct** | **Lanzar RETO 1** (la fábrica manda los emails; bootcamp Esumer puede ser el piloto) · grabar clases 4–7 |
| **Nov** | RETO 2 (FinOps) · abrir preventa del Programa con certificado · grabar 8–10 |
| **Dic** | Cohorte fundadora del Programa (si hay ≥8) o enero · clase 12 (vendor agents) como pieza de autoridad |

Métrica norte: **miembros registrados** (el padrón DynamoDB) — cada pieza del temario existe
para crecerla o monetizarla.

## Fuentes
- [Stanford AI Index vía AI Career Lab — agentic jobs 151→16.500](https://theaicareerlab.com/blog/agentic-ai-jobs-guide-2026) · [GSDC — roles y salarios](https://www.gsdcouncil.org/blogs/agentic-ai-jobs-careers-skills-salary) · [Futureproofing — gap de talento](https://www.futureproofing.dev/resources/ai-talent-gap/ai-engineer-demand-2026)
- [KodeKloud AIOps](https://kodekloud.com/learn/aiops-courses) · [Coursera/AWS AIOps](https://www.coursera.org/learn/aiops-aws) — competencia EN, lente observabilidad
- Benchmarks propios: `benchmarking-us.md` (AI SRE market map) · capturas Lab10 (retos 17K/29K inscritos, programa USD 650, admisión 15 min)
