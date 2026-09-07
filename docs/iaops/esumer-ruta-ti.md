# Esumer Ruta TI — análisis y plan de dictado estilo IAOps

**Doc:** 2026-09-06 · análisis de `Ruta TI (1).xlsx` (4 rutas, 92 h / 15 semanas c/u, Sep 1 – Dic 13)
· foco: **Inf TI — Cloud Computing, Redes y Ciberseguridad Esencial** (la ruta de Alejandro).

---

## 1. Radiografía del programa (Inf TI)

| Módulo | Semanas | Tema | Herramientas oficiales |
|---|---|---|---|
| M1 Explorar | 1–3 | Redes y SO: terminal Linux, TCP/IP, IPv4/subnetting | Ubuntu, Packet Tracer, VirtualBox |
| M2 Construir | 4–6 | Virtualización y Cloud: VMs, SSH, instancia en nube | VirtualBox, **OCI Always Free o AWS Free Tier** |
| — Bootcamp 1 | 7 (Oct 12–18) | Presencial 3h | — |
| M3 Experimentar | 8–9 | Seguridad: CIA, hardening Linux, UFW, Wireshark/Nmap | UFW, Wireshark, Nmap |
| M4 Innovar | 10–12 | Automatización: Bash, **IaC + GitHub**, NGINX, balanceo/HA | Bash, GitHub, NGINX |
| — Bootcamp 2 | 13 (Nov 23–29) | Presencial 3h | — |
| M5 Transformar | 14–15 | Diseño de infra empresarial, gobernanza, costos, pitch | Draw.io, Slides |

**Lo bueno (no pelear contra esto, apoyarse):**
- La secuencia ya es "fundamentos → aplicación": terminal antes que cloud, red local antes que
  VPC, hardening antes que automatizar. Es el orden correcto — coincide con la tesis IAOps.
- Cada sesión trae "Actividad/Producto" — el programa YA pide entregables. Nuestro trabajo es
  hilarlos en UN proyecto acumulativo, no inventar tareas nuevas.
- Free tier de OCI/AWS = infraestructura REAL sin costo. "Se aprende operando" es viable.
- El caso integrador existe desde la sesión 1 ("mapa de infraestructura de una organización").

**Los huecos (donde el dictado IAOps agrega valor):**
1. **El proyecto puede quedar en diapositivas.** M5 pide diagramas y pitch; el riesgo es que el
   "diseño de infraestructura empresarial" final sea un dibujo. Antídoto: que al Demo Day cada
   equipo llegue con la infra CORRIENDO (URL viva + evidencia), no solo dibujada.
2. **La IA no aparece en la ruta Inf TI** (está en la ruta hermana de IA). Entra por nuestra
   cuenta como HERRAMIENTA de operación — ver §3. Es además el diferencial del docente.
3. **Packet Tracer y VirtualBox son simulación.** Útiles para fundamentos, pero el salto de valor
   está en que TODO lo de M3–M4 ocurra sobre la instancia cloud real de cada estudiante.
4. **GitHub llega tarde** (sem 11). Lo adelantamos informalmente: la bitácora del proyecto vive
   en GitHub desde la semana 1 (es un README, no requiere saber Git aún — se formaliza en sem 11).
5. **Sin identidad de rol.** El programa enseña herramientas; nosotros enseñamos un ROL:
   "operador que dirige infraestructura" — el mensaje de carrera que nadie más les da.

---

## 2. El hilo conductor: UNA empresa, UN proyecto acumulativo

**"Mi Primera Infraestructura Dirigida"** — cada equipo (2-3 estudiantes) "funda" una empresa
ficticia (ellos eligen: tienda, IPS, colegio, logística…) y a lo largo de 15 semanas construye
su infraestructura de verdad. Cada módulo agrega una capa al MISMO proyecto:

| Fase | Módulo | El proyecto crece así | Evidencia en la bitácora |
|---|---|---|---|
| 1 | M1 | Mapa de infra + red diseñada en Packet Tracer + dominio de terminal | Diagrama + capturas + comandos |
| 2 | M2 | VM local → **instancia Linux real en OCI/AWS free tier** con SSH | IP pública + acceso demostrado |
| 3 | M3 | La instancia **endurecida**: usuarios, permisos, UFW, auditoría Nmap | Matriz de riesgos + evidencia antes/después |
| 4 | M4 | **Servicio web servido por NGINX** + scripts de administración versionados en GitHub + balanceo demo | URL viva + repo |
| 5 | M5 | Arquitectura documentada + costos + pitch **con demo en vivo** | Pitch + infra corriendo |

Regla de oro del curso (anunciarla en la clase 1): *"Aquí no se entregan pantallazos de
teoría: se entrega infraestructura funcionando y la bitácora de cómo la operaste."*
La bitácora pública en GitHub = su primer portafolio profesional (argumento de empleabilidad).

---

## 3. Dónde y cómo entra la IA (progresión de la frontera de delegación)

La misma tesis IAOps, adaptada a estudiantes que están formando el criterio:

- **M1–M2 (sem 1–6): SIN IA para ejecutar.** Los fundamentos se hacen a mano — el criterio se
  forma ejecutando. La IA solo como *tutor*: "explícame este error", "¿qué hace este comando?"
  (uso legítimo y honesto — mejor enseñarles a preguntar bien que prohibir).
- **M3 (sem 8–9): IA como auditor junior.** Le pasan la salida de Nmap o su configuración y le
  piden hipótesis de riesgos — pero la matriz de riesgos la firman ellos. Primera lección de
  frontera: la IA propone, tú respondes.
- **M4 (sem 10–12): IA como copiloto de automatización.** El escenario perfecto ya está en el
  programa (Bash + IaC + GitHub): la IA genera el script, el estudiante lo LEE, lo corrige, lo
  prueba en la VM de laboratorio y solo entonces lo ejecuta en su instancia. Regla del curso:
  **"código que no puedes explicar, no se ejecuta"** (= lo reversible se delega, lo
  irreversible exige tu firma — sin decir "IAOps" como marca, es simplemente buena ingeniería).
- **M5 (sem 14–15): IA en el pitch.** Documentación y presentación asistidas; la arquitectura
  y las decisiones son de ellos.

**Bootcamps presenciales (sem 7 y 13) — la carta fuerte:** son las fechas donde el estilo
demo-en-vivo brilla. Sem 7 (Oct 12–18): "opera una nube dirigiendo" — demo del docente
operando infraestructura real con un agente + práctica guiada de los estudiantes sobre SUS
instancias (coincide con la Variante C del programa IAOps: `temarios-detalle.md`). Sem 13:
simulacro de incidente ("algo se rompió en tu instancia — diagnostica y recupera").

**Nota institucional:** cero promoción de marcas propias en clase (regla Esumer). Redes
personales solo en la slide de cierre, como quedó acordado.

---

## 4. CLASE 1 — plan de sesión (3 horas, MasterClass de nivelación)

**Tema oficial:** "Encuentro inicial y panorama" — componentes de una infraestructura; cliente/
servidor; local vs. virtualizado vs. cloud; disponibilidad, rendimiento y seguridad; caso integrador.
**Producto oficial:** diagnóstico inicial + mapa de infraestructura de una organización ficticia.

### Estructura minuto a minuto

**0:00–0:15 · El gancho: "esto no es una clase de teoría"**
- NO empezar con el programa ni con tu CV. Empezar con una demo de 10 min: abre una terminal
  y muestra infraestructura real en producción (tu sitio): `curl -I` al dominio → cabeceras;
  `dig` → DNS respondiendo; consola cloud → la instancia/distribución real; "esto atiende
  visitantes AHORA MISMO y lo vamos a entender pieza por pieza durante 15 semanas".
- Cierre del gancho: "al final del curso, cada equipo tendrá SU versión de esto, corriendo en
  una nube real, gratis, construida por ustedes. Hoy empezamos por el mapa."

**0:15–0:30 · Presentación cruzada + diagnóstico (producto oficial, parte 1)**
- Formulario corto (Google Forms, 8 preguntas): experiencia con terminal, redes, cloud, qué
  esperan del curso. Sirve de diagnóstico Y de datos para calibrar las siguientes sesiones.
- Pregunta en voz alta: "¿qué creen que pasa entre que escriben google.com y aparece la página?"
  — anotar respuestas en el tablero; se retoman al final de la clase.

**0:30–1:15 · Fundamentos I: anatomía de una infraestructura (teoría con objetos reales)**
- Los 5 componentes: hardware → sistema operativo → red → servicios → nube. Cada uno con un
  ejemplo tangible de la demo inicial ("¿dónde vive el hardware de mi sitio? no lo sé — y ESA
  es la gracia de la nube").
- Cliente/servidor con teatro de aula: un estudiante "navegador", otro "DNS", otro "servidor" —
  pasan una petición en papel. Simple y se les queda.
- Local vs. virtualizado vs. cloud: la historia en 3 fotos (datacenter propio → VMware → AWS).

**1:15–1:30 · Pausa**

**1:30–2:00 · Fundamentos II: los 3 apellidos de toda infra**
- Disponibilidad, rendimiento, seguridad — con casos reales y cercanos: caída de un banco
  colombiano, lentitud en resultados de un examen, filtración de datos. Por cada caso: ¿qué
  componente falló? ¿qué apellido se rompió?
- Aquí se planta la semilla del curso: "operar es mantener esos 3 apellidos vivos — y cada
  módulo del curso les da una herramienta para uno de ellos".

**2:00–2:45 · Taller: el mapa de infraestructura (producto oficial, parte 2)**
- Se forman los equipos del proyecto (2-3 personas) y "fundan" su empresa ficticia (nombre,
  qué hace, qué sistemas necesita: página, correo, ventas, datos…).
- Cada equipo dibuja el mapa de infraestructura que su empresa necesitaría HOY (papel o
  draw.io): usuarios → red → servidores → servicios. Sin tecnicismos: cajas y flechas.
- El docente pasa por los grupos plantando preguntas de los 3 apellidos ("¿y si se cae?",
  "¿y si entra alguien que no debe?").
- Cierre del taller: 2-3 equipos presentan su mapa en 90 segundos.

**2:45–3:00 · Cierre: el contrato del curso + misión**
- Volver a las respuestas del tablero de las 0:15 ("¿qué pasa al escribir google.com?") y
  mejorarlas en vivo con lo aprendido — les muestra cuánto avanzaron en una sola sesión.
- El contrato del curso (3 reglas): (1) aquí se entrega infraestructura funcionando, no solo
  diapositivas; (2) todo queda en la bitácora del equipo (GitHub, se crea la próxima semana);
  (3) la IA puede explicarte cualquier cosa, pero lo que ejecutes tienes que poder explicarlo tú.
- **Misión (para la próxima clase):** cada estudiante instala VirtualBox + descarga la ISO de
  Ubuntu (checklist con links), y cada equipo sube su mapa a un doc compartido. 15 min de tarea.
- Slide final con QR de redes personales (lo permitido) — y a casa.

### Materiales a preparar antes de la clase
- [ ] Demo ensayada (curl/dig + consola cloud) con plan B sin internet: video de 3 min grabado
- [ ] Forms de diagnóstico (8 preguntas)
- [ ] 3 slides de casos (caída/lentitud/filtración) — sin logos de marcas propias
- [ ] Checklist de instalación VirtualBox+Ubuntu (PDF de 1 página)
- [ ] Slide de cierre con QR

---

## 5. Notas para las otras 3 rutas (si toca opinar en comité docente)

- **Desarrollo Web**: sólida y muy completa; mismo riesgo de proyecto-diapositiva resuelto
  porque despliegan en Vercel/Render (sem 12). Sinergia: sus proyectos podrían correr sobre
  infra de la ruta Inf TI en la Semana de la Innovación.
- **Datos**: bien secuenciada (estadística → Python → SQL → Power BI → regresión). El dataset
  del caso integrador debería fijarse en semana 1 para que todo el curso trabaje sobre él.
- **IA**: es la ruta "hermana" natural de IAOps (prompting → no-code → ML básico → workflows
  con IA → agentes). Si algún semestre te asignan esta ruta, el temario propio
  (`temarios-detalle.md`) la cubre casi 1:1 con enfoque de operación.
