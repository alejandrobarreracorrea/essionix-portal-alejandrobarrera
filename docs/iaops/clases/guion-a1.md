# Guion — Clase A1: "Qué es IAOps (y por qué en EE.UU. lo llaman AI SRE)"

**Catálogo:** FUNDAMENTOS · Básico · ~25 min · clase 1 de 12 (id `a1`, gratis)
**Promesa:** al terminar tienes el mapa mental del campo, el término dominado y tu primera misión publicada.
**Fecha guion:** 2026-08-28 · cifras verificadas ese día (fuentes al pie — mostrar en pantalla cada cifra).

---

## Ficha de producción

| Cosa | Valor |
|---|---|
| Título YouTube | Qué es IAOps: el rol mejor pagado del que nadie habla en español (AI SRE) |
| Miniatura | Tu foto + texto grande "¿IA + OPS?" / franja "EE.UU. lo llama AI SRE" |
| Setup | OBS: cámara + pantalla (slides ligeras / terminal). Ritual de marca: **el momento de la firma** aparece una vez (bloque 5) |
| Slide de cierre | `docs/iaops/media/templates/slide-cierre-clase.html` (QR → iaopslatam.com/unirme) |
| Descripción del video | Usar el bloque "Fuentes" completo al final de este guion (los links dan autoridad y SEO) |
| Hashtags | #IAOps #AISRE #AIOps #CloudComputing #CarreraTI |

**Regla de todo el video:** cada cifra sale con su fuente en pantalla (lower-third: "PwC AI Jobs Barometer 2026"). Nada inventado — es la marca.

---

## BLOQUE 0 · Hook (0:00 – 1:30) — VERBATIM

> En 2013 mi trabajo era revisar backups de Oracle en un datacenter frío de una gobernación, a las 2 de la mañana.
>
> Hoy la operación de mi nube la ejecutan agentes de IA. Yo apruebo. Cero clicks en la consola.
>
> Ese cambio tiene nombre. En EE.UU. lo llaman **AI SRE** y ya es producto de AWS, de Microsoft y de Datadog. En español casi nadie lo está enseñando. Yo lo llamo **IAOps**.
>
> Y aquí está el dato que te va a interesar aunque no te interese la técnica: según PwC, un profesional con habilidades de IA gana en promedio un **62% más** que uno del mismo rol sin ellas. No 6. Sesenta y dos por ciento. [PANTALLA: "62% wage premium — PwC Global AI Jobs Barometer 2026"]
>
> En los próximos 25 minutos te doy el mapa completo: qué es IAOps, en qué se diferencia del AIOps que quizás ya conoces, por qué los gigantes ya lo compraron, cuánto paga — con fuentes, no con humo — y cuál es el contrato de trabajo entre tú y la IA. Y al final te dejo una misión de 10 minutos que puedes hacer hoy.
>
> Soy Alejandro Barrera: 10+ años operando infraestructura crítica, 14 certificaciones, y todo lo que te voy a mostrar corre en MI nube, en producción. No es teoría. Es mi lunes.

---

## BLOQUE 1 · La historia en 3 minutos: del datacenter a los agentes (1:30 – 5:00)

**[PANTALLA: línea de tiempo simple 2013 → 2026]**

Puntos hablados (semi-verbatim, tono conversacional):

- **2013 — el fierro.** "Cuando empecé, operar era físico: discos, cintas, ventanas de mantenimiento de madrugada. El valor era saber ejecutar procedimientos que estaban en tu cabeza o en un Word."
- **2015–2019 — la nube.** "El datacenter se volvió API. Ya no cambiabas discos: escribías `aws ec2 run-instances`. Primera gran transición: muchos DBA y sysadmin se quedaron en el borde. Yo me certifiqué 10 veces en AWS en 3 años porque vi que el tren iba en serio."
- **2020–2022 — el código.** "Infraestructura como código, pipelines, GitOps. La operación se volvió texto. Guarda esa idea: **si la operación es texto, una IA que lee y escribe texto puede operarla.** Ese es el puente que casi nadie vio venir."
- **2023–2024 — la IA que habla.** "ChatGPT, copilots. La IA te AYUDABA: te explicaba un error, te escribía un script. Pero ejecutar seguía siendo tuyo."
- **2025–2026 — la IA que ejecuta.** "Aparecen los agentes: IA con acceso a herramientas — terminal, APIs de nube, tu repo. Ya no te dice cómo hacerlo. Lo hace. Y en 2026 esto dejó de ser experimento: AWS y Microsoft lo venden como producto. De eso hablamos en el bloque 3."

**Frase-tesis del bloque (a cámara, lento):**
> "En 13 años la operación pasó de las manos, a las APIs, al código… y ahora a los agentes. Cada transición dejó gente en el borde. Esta clase existe para que en esta no te quedes tú."

---

## BLOQUE 2 · AIOps clásico vs IAOps: la IA que observa vs la IA que ejecuta (5:00 – 9:30)

**[PANTALLA: tabla de dos columnas]**

| | AIOps clásico (2016→) | IAOps / AI SRE (2025→) |
|---|---|---|
| La IA… | **observa** | **ejecuta** |
| Qué hace | correlaciona alertas, detecta anomalías, predice | corre el runbook: diagnostica, cambia, valida |
| Tú… | recibes un dashboard más inteligente | diriges y **firmas** |
| Ejemplo | "el disco va a llenarse en 4 horas" | "encontré 40 GB de logs viejos; ¿aprueba que los archive y rote? [y/n]" |

Hablado:

> "Si llevas años en esto, seguro escuchaste AIOps: Gartner acuñó el término hace casi una década. AIOps clásico es la IA **mirando** tu operación: menos ruido de alertas, mejor correlación. Útil — pero al final del día, el que ejecuta el cambio a las 3 a.m. sigues siendo tú.
>
> IAOps es el salto: la IA deja de ser un dashboard y se vuelve un **operador** que trabaja bajo tu dirección. Le das contexto, herramientas y límites — y ejecuta la tarea completa: verifica, cambia, valida, te muestra evidencia.
>
> Ejemplo real de mi infraestructura, para que no sea abstracto: [contar en 60 segundos la decomisión legacy — versión corta del post 3: verificó DNS → backup 220 archivos → liberó alias → esperó propagación → eliminó → validó HTTP 200. 'Mi trabajo fue aprobar los pasos irreversibles. ~30 minutos supervisando lo que a mano era una tarde con el corazón en la mano.']
>
> Y el nombre: en EE.UU. esto se llama **AI SRE** — AI Site Reliability Engineering. Si vas a buscar trabajo o contenido en inglés, ese es el término. IAOps es como lo llamamos en esta comunidad, en español: **I**nteligencia **A**rtificial + **Op**eracione**s**. Mismo campo, nuestra bandera."

---

## BLOQUE 3 · El mercado ya lo compró (9:30 – 13:00)

**[PANTALLA: 3 logos + titulares de los anuncios oficiales — usar capturas de los blogs, con URL visible]**

> "Esto no es una apuesta mía. En 2026 los tres jugadores más grandes de la industria lanzaron SU agente de operación, disponible general — no beta, producto:
>
> — **AWS DevOps Agent**: el agente de operación de Amazon, GA desde marzo de 2026. [PANTALLA: blog oficial AWS]
> — **Azure SRE Agent**: Microsoft reporta **35.000 incidentes mitigados de forma autónoma** ya en su lanzamiento. Léelo otra vez: treinta y cinco mil incidentes donde ningún humano ejecutó la mitigación. [PANTALLA: blog oficial Microsoft]
> — **Datadog Bits AI SRE**: el agente que investiga la alerta antes de que el on-call abra el laptop. [PANTALLA: página oficial Datadog]
>
> Piensa en lo que eso significa: las empresas YA están comprando agentes que operan. ¿Y quién dentro de la empresa sabe dirigirlos? ¿Ponerles límites? ¿Decidir qué pueden hacer solos y qué requiere aprobación? Casi nadie. **Ese es el rol nuevo — y esa es exactamente la habilidad que vamos a construir en este catálogo.**
>
> Nota de honestidad, porque aquí no hay humo: estos agentes no son magia. Ejecutan bajo gobernanza, cometen errores, y sin un humano con criterio dirigiendo, son un riesgo. Por eso el rol no desaparece — se **transforma**. Y eso me lleva al dinero."

---

## BLOQUE 4 · ¿Y cuánto paga esto? — con fuentes (13:00 – 17:30)

**[PANTALLA: cada cifra con lower-third de fuente. Este bloque es el más compartible — cuidar el ritmo]**

> "Hablemos de plata, que es la pregunta real. Todo con fuente en pantalla y en la descripción — verifícalo tú mismo.
>
> **Uno. La demanda explotó.** El AI Index de Stanford — con datos de Lightcast, que analiza miles de millones de vacantes en EE.UU. — reporta que las menciones de habilidades de **IA agéntica crecieron más de 280% en un solo año**: ya son unas 90.000 vacantes. Y las habilidades que más crecen alrededor no son chatbots: son **AWS, escalabilidad, operación** — la IA se está moviendo de los demos a la infraestructura. Es decir: a lo nuestro. [Stanford HAI AI Index 2026]
>
> **Dos. La prima salarial es real.** PwC analizó más de mil millones de vacantes en 27 países: los trabajadores con habilidades de IA ganan en promedio **62% más** que sus pares del mismo rol. Y los empleos que exigen IA crecen **8 veces más rápido** que el mercado laboral general. [PwC Global AI Jobs Barometer 2026]
>
> **Tres. Los números del rol en EE.UU.** Un Site Reliability Engineer — el rol donde vive esto — tiene una mediana de compensación total de unos **USD 205.000 al año** según levels.fyi; la base típica va de 130 a 210 mil. Y las vacantes que ya piden AIOps/operación con IA aparecen publicadas con rangos que llegan a los **USD 300.000+** en los extremos. [levels.fyi · ZipRecruiter]
>
> **Cuatro. Y en nuestra región** — porque tú y yo no vivimos en San Francisco: un DevOps/SRE en Colombia está en el orden de los **COP 6 a 13 millones al mes** según seniority [ERI / Michael Page, guía salarial]. Pero el mismo perfil trabajando **remoto para empresas de EE.UU.** se cotiza entre **USD 7.500 y 11.000 al mes**. Esa brecha — hasta 4 o 5 veces — se cruza con dos cosas: inglés y las habilidades que el mercado está pagando con prima. Y acabamos de ver cuál es la habilidad con la prima más alta.
>
> **La conclusión honesta:** no te estoy prometiendo que aprender IAOps te multiplica el sueldo el martes. Te estoy mostrando, con datos públicos, que la intersección 'operación cloud + dirigir IA' es donde la demanda crece más rápido y donde se paga la prima más alta — y que en español casi nadie la está ocupando. Llegar temprano importa."

---

## BLOQUE 5 · El contrato: la IA ejecuta, tú diriges (17:30 – 21:30)

**[PANTALLA: las 2 reglas, tipografía grande. Aquí va el RITUAL DE LA FIRMA en cámara]**

> "Última pieza del mapa: si la IA ejecuta… ¿qué haces tú? Este es el contrato IAOps, y son dos reglas:
>
> **Regla 1: Lo reversible se delega. Lo irreversible exige tu firma.**
> Crear un recurso de prueba, leer logs, generar un reporte — reversible: el agente lo hace solo. Borrar datos, cambiar DNS de producción, tocar dinero — irreversible: el agente se DETIENE y pide tu aprobación.
>
> [DEMO de 90 segundos en terminal — el ritual: pídele al agente algo con un paso irreversible preparado; cuando pida aprobación, pausa, mira a cámara:] "Este momento. Este [y/n] en la pantalla. Este es el trabajo nuevo. La IA hizo todo lo demás — pero esta tecla es mía, porque el que responde por el resultado soy yo."
>
> **Regla 2: El criterio no se automatiza.**
> Decidir QUÉ se hace, revisar lo que el agente propone, responder cuando algo falla — eso es tuyo. Y aquí está la mejor noticia para los veteranos que me ven: tus años de experiencia no son un lastre. Son exactamente el criterio que la IA no tiene. **La IA ejecuta. Tú diriges.**
>
> En la próxima clase — 'La frontera de delegación' — convertimos esto en un documento tuyo: qué delegas, qué firmas, qué jamás. Es la clase más importante del catálogo."

---

## BLOQUE 6 · Misión + cierre (21:30 – 24:30)

**[PANTALLA: la misión escrita]**

> "Tu misión de hoy — 10 minutos, sin excusas:
>
> **Escribe las 3 tareas de TU operación que delegarías primero a un agente.** Las 3 más repetitivas, las que haces en piloto automático. Para cada una, una línea: qué es, y si es reversible o irreversible.
>
> No necesitas saber IA para hacerlo. Necesitas conocer tu operación — y eso ya lo tienes. Compártela en la comunidad, y si estás en LinkedIn, publícala con #IAOps: yo las leo.
>
> Cuando termines, márcala como completada en tu cuenta — así vas viendo tu progreso en el catálogo."

**Cierre (verbatim, a cámara):**

> "Recapitulando el mapa: la operación se volvió texto, el texto lo ejecutan agentes, los gigantes ya lo venden como producto, el mercado lo paga con prima del 62% — y el rol que queda es el que dirige. Ese rol se aprende, y este catálogo es la ruta completa, gratis, en español.
>
> Únete a la comunidad en **iaopslatam.com** — tu correo es tu firma, dos campos, diez segundos — y nos vemos en la clase 2.
>
> La IA ejecuta. Tú diriges. Las nubes cambian. El criterio queda."

**[SLIDE FINAL con QR → iaopslatam.com/unirme — dejarla 8 segundos]**

---

## Fuentes (pegar en la descripción del video y mostrar en pantalla por bloque)

**Demanda y sueldos:**
- Stanford HAI — [The 2026 AI Index Report](https://hai.stanford.edu/ai-index/2026-ai-index-report) · análisis del capítulo económico por [Lightcast](https://lightcast.io/resources/blog/stanford-ai-2026) (skills "Agentic AI" +280% interanual, ~90.000 vacantes US; IA ya en 2,5% de todas las vacantes)
- PwC — [Global AI Jobs Barometer 2026](https://www.pwc.com/gx/en/news-room/press-releases/2026/pwc-2026-ai-jobs-barometer.html) · [PDF hallazgos globales](https://www.pwc.com/gx/en/issues/artificial-intelligence/job-barometer/2026/2026-global-ai-jobs-barometer-global-findings.pdf) (prima salarial 62%, vacantes IA crecen 8x vs mercado; +1.000M de vacantes, 27 países)
- levels.fyi — [Site Reliability Engineer Salary](https://www.levels.fyi/t/software-engineer/title/site-reliability-engineer) (mediana total comp US ~USD 205K)
- ZipRecruiter — [AIOps Engineer Salary](https://www.ziprecruiter.com/Jobs/Aiops-Engineer-Salary) (rango publicado USD 83K–360K)
- ERI — [DevOps Engineer Salary Colombia](https://www.erieri.com/salary/job/devops-engineer/colombia) (~COP 106M/año promedio) · Michael Page — [Guía Salarial Colombia 2026](https://www.michaelpage.com.co/guia-salarial)

**El mercado ya lo compró (anuncios oficiales):**
- AWS — [Announcing GA of AWS DevOps Agent](https://aws.amazon.com/blogs/mt/announcing-general-availability-of-aws-devops-agent/)
- Microsoft — [Azure SRE Agent GA](https://techcommunity.microsoft.com/blog/appsonazureblog/announcing-general-availability-for-the-azure-sre-agent/4500682) (35.000 incidentes mitigados de forma autónoma)
- Datadog — [Bits AI SRE](https://www.datadoghq.com/product/ai/bits-investigation/)
- Mezmo — [The 2026 AI SRE Market Map](https://www.mezmo.com/learn/the-2026-ai-sre-market-map-agents-harnesses-and-the-data-layer) (panorama del mercado)

**Notas de precisión (no improvisar más allá de esto):**
- "62% más" = prima PROMEDIO por habilidades de IA en todos los roles (PwC), no específica de SRE. Decirlo como está en el guion.
- "USD 205K" = mediana de compensación TOTAL (base+stock+bono) en levels.fyi US, no salario base. La base típica: 130–210K.
- Colombia: rangos varían mucho por fuente/seniority; usar "en el orden de COP 6–13M/mes" y mostrar las dos fuentes.
- "35.000 incidentes" es la cifra del anuncio de Microsoft — atribuirla siempre ("Microsoft reporta…").
