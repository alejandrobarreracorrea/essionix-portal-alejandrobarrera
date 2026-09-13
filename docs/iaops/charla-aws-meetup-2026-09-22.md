# Charla AWS · Meetup — guion (30 min) · 2026-09-22

**Ponente:** Alejandro Barrera (Cloud Architect · IAOps) — primera conferencia.
**Formato:** virtual, 30 min, público mixto (no todos técnicos). Intro a AWS.
**Meta única (CTA):** que el público salga **motivado a crear su cuenta AWS free tier y hacer su primer despliegue esa misma semana**. (Mención suave de IAOps/próxima charla, sin venta dura.)
**Estilo:** ~10 min teoría (como historia) + ~14 min demo en vivo (alto impacto, con red de seguridad) + ~4 min cierre.

---

## Decisiones tomadas
- **Demo en vivo protagonista:** desplegar un **sitio/app serverless** y que aparezca una **URL pública** → **QR en pantalla** → el público lo abre en su celular. Confiable + interactivo = "wow".
  - Hosting: **AWS Amplify** (da URL viva en minutos). Evitar S3+CloudFront en vivo (la distribución tarda ~15 min).
- **Ángulo IA (Kiro):** **pre-cocinado**, como narrativa "así trabaja hoy un Cloud Architect: le dicto la intención y la IA genera el spec + el código". Kiro NO se despliega en vivo (lento, gasta créditos, output textual). Si se quiere codegen en vivo real, usar Cursor/Claude Code — pero para el debut, mostrar el spec ya generado (captura/video corto).
- **Red de seguridad SIEMPRE:** video grabado del deploy + capturas por paso + URL ya viva + hotspot del celular.

---

## Estructura con tiempos

### 0:00–2:00 · Cold open (sorprender antes de presentarte)
> "En los primeros tres meses de 2026 pasó más inteligencia artificial por los servidores de Amazon que en toda su historia previa. Y en los próximos minutos, entre todos, vamos a poner algo VIVO en esos mismos servidores. Saquen el celular… al final lo van a usar."

Luego, 20 segundos de presentación con propósito:
> "Soy Alejandro Barrera, Cloud Architect. Mi marca es IAOps: hago que la IA y la nube trabajen juntas. Hoy no vengo a darte una clase — vengo a mostrarte lo que ya es posible."

### 2:00–12:00 · Teoría como historia (5 conceptos + analogías)
No es tutorial, es relato. Una micro-historia real por concepto cuando puedas.
1. **Nube = pago por consumo.** Analogía: *la luz de tu casa* — no compras la planta eléctrica, pagas los kilovatios. Nadie compra un servidor de $10.000 "por si acaso".
2. **Regiones y zonas.** Analogía: *sucursales del banco* — tu app vive cerca del usuario; si una sede cae, otra sigue. (~35 regiones globales.)
3. **Responsabilidad compartida.** Analogía: *el edificio y tu apartamento* — AWS asegura el edificio; tú, lo que hay dentro (datos, contraseñas, permisos). El error más caro de novatos vive en tu mitad.
4. **Serverless.** Analogía: *taxi vs. carro propio* — el código corre solo cuando llega una petición; pagas por milisegundo (Lambda). "Sin servidores" no es magia: hay servidores, pero no son tu problema.
5. **IA en la nube (Bedrock).** Gancho 2026: *antes montar IA era para gigantes; hoy invocas Claude o Nova con una llamada de API y pagas por token.*

**Estadísticas para intercalar (venden "aprende AWS ahora"):**
- AWS lidera el mercado cloud: **~28%** (Azure ~21%, Google ~14-15%).
- AWS: **$37.6B en Q1 2026 (+28%)** y **$42.2B en Q2 (+37%)** — crecimiento acelerando.
- El mercado cloud creció **+35% en Q1 2026**, el mayor en 8 años, empujado por IA.
- **Empleos AWS ~55.000, salario promedio ~$135.000/año.** El AWS Cloud Practitioner es de fundamentos — **no necesitas ser programador para empezar.**

### 12:00–13:00 · Transición con tensión
> "Toda esa teoría no vale nada si no la ves funcionar. Saquen el celular de verdad."

### 13:00–26:00 · Demo en vivo (corto, ensayado, con QR)
Flujo:
1. (1-2 min) Mostrar el **spec generado por IA** (Kiro pre-cocinado, o Cursor/Claude Code en vivo si te sientes seguro): "le dije lo que quería y la IA generó requisitos + código".
2. (5-8 min) **Desplegar en Amplify** → aparece la **URL pública** en pantalla.
3. **Proyectar el QR** de esa URL → el público la abre en sus celulares. (Opcional "wow": la página muestra en vivo algo que ellos generan — un contador de visitas, sus mensajes, etc.)
4. (Opcional, +3-4 min, sube el factor IA) **Chatbot con Amazon Bedrock** en el **playground de la consola** (modelo **Nova Micro** o Claude Haiku): el público dicta preguntas y responde. ⚠️ Requiere **model access habilitado** por región de antemano.

### 26:00–30:00 · Cierre + CTA
> "Lo que acaban de ver corriendo en AWS lo pueden hacer ustedes esta semana. Es gratis para empezar."
- CTA único y medible: **"Escanea este QR: te llevas la guía de esta charla + los pasos para crear tu cuenta free tier y hacer tu primer deploy."**
- Mención suave: "Si quieren seguir aprendiendo, estoy en IAOps / la próxima charla es…". Sin venta dura.

---

## Plan B (red de seguridad — imprescindible)
- **Video grabado** del deploy completo en el laptop (no depende de wifi).
- **Capturas por paso** dentro de las slides.
- **URL del demo YA viva** antes de empezar + **QR apuntando a ella** (no crear recursos que dependan de propagación en vivo).
- **Slides offline** + copia en otro laptop.
- **Hotspot del celular** como red de respaldo.
- **Ensayar el demo cronometrado ≥3 veces** (el tiempo en escenario se estira).

---

## Checklist de pre-vuelo (⚠️ VERIFICAR antes de subir)
- [ ] Cuenta AWS logueada, **región correcta**, créditos disponibles.
- [ ] **Amplify**: sitio ya desplegado y URL viva; QR generado y probado.
- [ ] Si va Bedrock: **model access habilitado** (Nova/Claude) en la región elegida — es el error clásico.
- [ ] Kiro/Cursor: spec ya generado (captura/video) por si el codegen en vivo se cae.
- [ ] Fecha **GA de Kiro** (las fuentes discrepan; di solo "GA en 2026, producto joven").
- [ ] Video de respaldo + capturas + hotspot listos.

---

## Notas sobre Kiro (para lo que digas)
- Es el **IDE agéntico de AWS**, **spec-driven** (genera `requirements.md` → `design.md` → `tasks.md` antes de codear). Features: steering files, agent hooks, MCP (útil: AWS Documentation MCP). No exige cuenta AWS completa (Builder ID / social login). Free 50 créditos/mes; Pro $20.
- **Por qué no en vivo:** el flujo spec-driven añade latencia, el output es textual (poco visual), y un build gasta 15-25 créditos (reintentos te dejan sin cupo). Úsalo como narrativa pre-cocinada.

## Fuentes (investigación 2026)
kiro.dev · kiro.dev/pricing · reseña Ricardo Gil (no apto demo en vivo) · comparativa dev.to Copilot/Cursor/Claude/Kiro · Amplify vs S3+CloudFront (tiempos) · Bedrock pricing (CloudZero) · AWS market share (SQ Magazine) · salarios/certs AWS (NovelVista) · tips speakers primerizos (freeCodeCamp, Sophie Koonin, Last Week in AWS).
