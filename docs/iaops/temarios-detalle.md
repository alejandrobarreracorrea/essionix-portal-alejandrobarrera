# Temarios IAOps — detalle completo (para revisión)

**Doc:** 2026-08-29 · desglose clase-por-clase y día-por-día de todo el currículo.
Complementa `temario-iaops.md` (estrategia). Estado: PROPUESTA para aprobación.

---

# A. CLASES GRATUITAS — temario de cada una (12 iniciales)

### FUNDAMENTOS

**A1. Qué es IAOps (y por qué en EE.UU. lo llaman AI SRE)** · Básico · 25 min
1. La historia en 3 minutos: del datacenter a los agentes (2013→2026)
2. AIOps clásico (la IA observa) vs IAOps agéntico (la IA ejecuta)
3. El mercado ya lo compró: AWS DevOps Agent, Azure SRE Agent, Datadog Bits
4. El contrato: la IA ejecuta, tú diriges — qué significa en la práctica
5. **Misión:** escribe qué 3 tareas de tu operación delegarías primero (y compártelo en comunidad)

**A2. La frontera de delegación: qué firma un humano** · Básico · 25 min
1. Reversible vs irreversible: el criterio de oro
2. Los 5 que se delegan (deploys, runbooks, auditorías, 1ª respuesta, documentación)
3. Los 3 que jamás (aprobación irreversible, arquitectura, responsabilidad)
4. Caso real: la decomisión de mi infra legacy (dónde firmé y por qué)
5. **Misión:** dibuja TU frontera de delegación (plantilla incluida)

**A3. Tu primer agente ejecutando una tarea real** · Básico · 30 min
1. Anatomía de un agente de operación: instrucciones + contexto + herramientas + límites
2. Demo en vivo: el agente inventaría mi cuenta AWS y reporta
3. Cómo pedirle evidencia (que muestre lo que hizo, no que lo cuente)
4. Errores típicos del primer día
5. **Misión:** tu agente lista y describe los recursos de tu cuenta (solo lectura)

### AGENTES

**A4. Claude Code para operar tu nube: setup completo** · Básico · 35 min
1. Instalación y autenticación · 2. AWS CLI + perfiles con permisos de solo-lectura
3. La primera conversación de operación: reglas de la casa (pedir plan antes de ejecutar)
4. CLAUDE.md para operaciones: tu runbook de contexto
5. **Misión:** entorno agéntico funcionando + primera auditoría de seguridad básica

**A5. Dale manos con límites: permisos mínimos (IAM para agentes)** · Intermedio · 30 min
1. Por qué el agente NO usa tu usuario admin
2. Diseño de un rol scoped: acciones, recursos, condiciones
3. Patrón de escalamiento: solo-lectura → ejecutar-reversible → proponer-irreversible
4. Caso real: la política ab-leads-* de mi pipeline
5. **Misión:** crea el rol de tu agente con permisos mínimos

**A6. AWS DevOps Agent y Azure SRE Agent: qué son y cómo dirigirlos** · Intermedio · 35 min
1. Qué venden los hyperscalers (GA 2026) y qué NO hacen solos
2. Demo: investigación de un incidente con el agente vendor
3. Gobernanza: aprobaciones, límites y auditoría en cada plataforma
4. Cuándo usar el del vendor vs tu propio agente
5. **Misión:** activa el agente de tu nube en modo recomendación y evalúa su primer diagnóstico

### CÓDIGO & PIPELINES

**A7. De clicks a Terraform con un agente** · Básico · 35 min
1. Por qué los agentes hablan código (y los clicks son deuda)
2. El agente escribe el HCL de un recurso que ya tienes; tú revisas el plan
3. terraform plan como contrato de revisión
4. Import de recursos click-ops existentes
5. **Misión:** tu primer recurso migrado a código por tu agente

**A8. Pipeline OIDC: deploys sin llaves y sin consola** · Intermedio · 35 min
1. El problema de las llaves eternas; qué es OIDC en 5 min
2. GitHub Actions asume un rol: setup completo
3. push → plan → apply: el flujo con aprobación
4. Caso real: el pipeline de mis dos sitios
5. **Misión:** tu repo despliega a tu cuenta sin un solo secreto guardado

### OPERACIÓN

**A9. El runbook delegable: verificar → backup → cambiar → validar** · Intermedio · 30 min
1. El patrón universal de los cambios seguros
2. Del runbook humano al runbook de agente (qué cambia al escribirlo)
3. Puntos de firma: dónde se detiene a pedir aprobación
4. Demo: cambio real ejecutado de punta a punta
5. **Misión:** convierte un procedimiento tuyo al patrón y delégalo

**A10. Cambio de DNS en producción con firma (caso real completo)** · Intermedio · 30 min
1. Anatomía de mi cutover real: dominio vivo, cero downtime
2. Verificación previa y por qué el agente no asume nada
3. La espera de propagación (donde los humanos fallan)
4. Rollback: el plan B que se diseña antes
5. **Misión:** simula un cutover en tu lab (hosted zone de prueba)

### FINOPS

**A11. Audita tu factura AWS con un agente (FinOps en 30 min)** · Básico · 30 min
1. Por qué el desperdicio existe (encontrarlo aburre)
2. El prompt de auditoría: qué pedirle exactamente
3. Demo real: huérfanos, tamaños, horarios, storage classes
4. El reporte por impacto: decidir qué ejecutar
5. **Misión:** audita tu cuenta (o la de tu empresa con permiso) y cuantifica el hallazgo

### INCIDENTES & GUARDRAILS

**A12. Primera respuesta a incidentes con agentes** · Intermedio · 35 min
1. Los primeros 5 minutos: qué delega y qué no
2. El agente recolecta evidencia mientras tú piensas
3. Hipótesis rankeadas: cómo pedirlas y cómo auditarlas
4. El post-mortem que se escribe solo
5. **Misión:** simulacro — rompe algo en tu lab y dirige el diagnóstico

---

# B. RETOS — temario día a día

## RETO 1 · "5 días para tu primera nube dirigida" (Básico · el masivo)
| Día | Clase (15-20 min) | Misión del día |
|---|---|---|
| 1 | Tu cuenta y tu agente (AWS free tier + Claude + reglas de la casa) | Entorno listo + agente saluda con inventario |
| 2 | Primera delegación (tarea reversible con evidencia) | El agente crea y etiqueta un recurso; tú verificas |
| 3 | Código, no clicks (Terraform mínimo viable) | Tu primer `terraform apply` revisado |
| 4 | Push → deploy (pipeline básico con OIDC) | Tu repo publica un sitio estático solo |
| 5 | Tu lab público + la frontera de delegación | Bitácora publicada + certificado del reto |
**Cierre:** invitación al Programa + badge de miembro.

## RETO 2 · "Caza el desperdicio: FinOps en 5 días" (Básico · el gancho de dinero)
| Día | Clase | Misión |
|---|---|---|
| 1 | Leer tu factura sin llorar (Cost Explorer + el agente) | Mapa de tus top 10 costos |
| 2 | Huérfanos: lo que pagas y no usas | Lista de recursos huérfanos hallados |
| 3 | Tamaños y horarios (rightsizing + apagados) | 2 candidatos a rightsizing/schedule |
| 4 | Storage: clases, snapshots y lifecycle | Política de lifecycle propuesta |
| 5 | El reporte ejecutivo (lo que le muestras a tu jefe) | Reporte de ahorro cuantificado |
**Cierre:** "¿tu empresa necesita esto a escala?" → puerta B2B/mentoría.

## RETO 3 · "7 días, un runbook delegado" (Intermedio · el técnico)
| Día | Tema | Misión |
|---|---|---|
| 1 | Elige tu operación (deploy, DNS, backup-restore) | Runbook humano documentado |
| 2 | El patrón V-B-C-V aplicado | Runbook reescrito para agente |
| 3 | Permisos mínimos del agente | Rol scoped creado |
| 4 | Puntos de firma | Aprobaciones definidas e implementadas |
| 5 | Ejecución supervisada #1 | Primera corrida con tu firma |
| 6 | Manejo de fallo (el agente encuentra un problema) | Rollback probado |
| 7 | Ejecución limpia + evidencia | Runbook delegado en producción personal |

---

# C. PROGRAMA IAOps (cohorte) — tres variantes posibles

## Variante A — 6 semanas (la diseñada) · USD 197 fundadora
2 sesiones/semana (live 90 min + práctica asincrónica), entregable semanal, Demo Day.
| Sem | Módulo | Live cubre | Entregable |
|---|---|---|---|
| 0 | Onboarding | Setup + mapa de toil personal | Lab base |
| 1 | El contrato IAOps | Frontera + primer agente + permisos | Política de delegación + agente activo |
| 2 | Código, no clicks | Terraform + import de click-ops | 3 recursos migrados |
| 3 | El pipeline | OIDC + PR como compuerta | Lab desplegándose solo |
| 4 | Runbooks delegables | Patrón V-B-C-V + operación peligrosa | Runbook #1 firmado |
| 5 | FinOps con agentes | Auditoría + guardrails de presupuesto | Reporte de ahorro |
| 6 | Incidentes + Demo Day | Simulacro + presentaciones | **Certificado IAOps** |

## Variante B — 8 semanas estilo Lab10 (para cohorte 2, precio pleno USD 397)
Igual que A + **Semana 5b: Multi-agente y noticias vendor** (dirigir AWS/Azure agents) +
**Semana 7: proyecto libre** (el alumno delega una operación de SU trabajo real) → Demo Day
en semana 8. Más aire para veteranos que van más lento; justifica el precio pleno.

## Variante C — Bootcamp intensivo 1 semana (piloto Esumer, oct 12-18)
Lun a Vie, 3h/día (encaja en la franja del calendario académico):
| Día | Tema (condensado del programa) |
|---|---|
| L | IAOps + frontera + primer agente |
| M | Terraform con agente |
| X | Pipeline OIDC |
| J | Runbook delegado con firma |
| V | FinOps + mini Demo Day |
Sin certificado IAOps completo (badge "Bootcamp") → upsell natural a la cohorte.

---

# D. Rutas de estudio sugeridas (cómo se combinan las piezas)

**Ruta Veterano:** A1 → A2 → A4 → RETO 3 → Programa (llega con criterio, le falta código/agente)
**Ruta Builder/Estudiante:** RETO 1 → A5 → A7 → A8 → Programa (llega con energía, le falta operación)
**Ruta Gerente/curioso:** A1 → RETO 2 → Mentoría/B2B (no va a operar; va a decidir)

---

## Decisiones pendientes (para Alejandro)
- [ ] ¿Aprobar catálogo de 12 y su orden de grabación?
- [ ] ¿Reto 1 como lanzamiento de octubre? ¿Bootcamp Esumer = Variante C?
- [ ] ¿Cohorte fundadora con Variante A (6 sem) y cohorte 2 con B (8 sem)?
- [ ] Nombre del certificado: "Certificado IAOps" vs "IAOps Practitioner" (eco de AWS)
