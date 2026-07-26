# Semana 1 — Fundación del posicionamiento IAOps

---

## POST 1 (Lunes) — Manifiesto fundacional
**Pilar:** posicionamiento · **CTA:** seguir

Llevo 10+ años operando infraestructura crítica.

Hoy ya no opero solo: la IA ejecuta y yo dirijo.

A eso me dedico, y tiene nombre: IAOps.

Empecé en 2013 administrando bases de datos para una gobernación. Oracle, SQL Server, datacenters fríos, ventanas de mantenimiento a las 2 a.m.

Después fui SRE en una bolsa de valores. Luego arquitecto cloud. 14 certificaciones en el camino (10 de AWS, 2 Professional).

Y en los últimos meses hice el cambio más grande de mi carrera:

Dejé de ejecutar la operación. La delegué a agentes de IA — y me quedé con lo que ninguna IA puede hacer: decidir.

Esta semana, por ejemplo:
→ Un agente migró el DNS de mi dominio a una distribución nueva de CloudFront.
→ Decomisionó la infraestructura legacy (con backup previo, porque el criterio lo pongo yo).
→ Auditó mis costos cloud y me propuso los ajustes.

Yo solo aprobé. Cero clicks en la consola.

Esto no es el futuro. Es mi lunes.

En este perfil voy a documentar — sin guardarme nada — cómo se opera una nube con IA: demos reales, runbooks, errores incluidos.

Si llevas años en on-premise y sientes que el tren te dejó: es para ti.
Si estás empezando y crees que la IA no te dejó espacio: también es para ti.

La IA no reemplaza al ingeniero de operación.
Reemplaza al ingeniero que opera a mano.

Sígueme y acompáñame el resto del año. 🚀

#IAOps #AISRE #AIOps #CloudComputing #AWS

---

## POST 2 (Miércoles) — Historia de origen (veteranos)
**Pilar:** carrera veterana · **CTA:** comentar

En 2013 mi trabajo era revisar backups de Oracle en una gobernación de Colombia.

Hoy dirijo agentes de IA que operan infraestructura en 3 nubes.

No soy especial. Solo me negué a quedarme quieto. Tres veces.

𝗣𝗿𝗶𝗺𝗲𝗿𝗮: era DBA on-premise. Oracle 11g, SQL Server, RHEL. Un mundo de discos, cintas y madrugadas. Pude quedarme ahí — pagaban bien y era "estable". Aprendí nube cuando en Colombia casi nadie hablaba de eso.

𝗦𝗲𝗴𝘂𝗻𝗱𝗮: era SRE en una bolsa de valores. Sistemas críticos, cero tolerancia a fallos. Pude quedarme en la zona cómoda del monitoreo. Me certifiqué 10 veces en AWS en 3 años.

𝗧𝗲𝗿𝗰𝗲𝗿𝗮 (la más difícil): este año. Con 10+ años de experiencia y el ego de saber hacerlo todo a mano… acepté que un agente de IA ejecuta la operación mejor, más rápido y sin cansarse. Y que mi valor ya no está en ejecutar: está en decidir, revisar y responder por el resultado.

Cada transición me dio miedo. Cada una multiplicó mi carrera.

Si llevas 10, 15, 20 años en on-premise o en la nube "de clicks", escúchame bien:

Tu experiencia no es un lastre. Es el activo que la IA no tiene.
La IA ejecuta. Tu criterio decide. Ese es el trato.

¿Cuál fue la transición que más te costó en tu carrera? Te leo 👇

#IAOps #AISRE #CloudComputing #CarreraTI #DevOps

---

## POST 3 (Jueves) — Demo en texto (prueba)
**Pilar:** operación en vivo · **CTA:** guardar

Le pedí a un agente de IA que decomisionara mi infraestructura legacy.

Esto fue exactamente lo que pasó (y lo que NO dejé que pasara):

Contexto: mi sitio personal corría desde 2020 en un bucket S3 público + CloudFront viejo. Lo reemplacé por infra nueva: S3 privado, OAC, Terraform, pipeline con OIDC.

Quedaba lo peligroso: apagar lo viejo sin tumbar el dominio.

La secuencia del agente:

1️⃣ Verificó que el DNS ya apuntaba a la distribución nueva (Route53, registros A/AAAA).
2️⃣ Hizo backup completo del bucket legacy ANTES de tocar nada. 220 archivos.
3️⃣ Liberó el alias del dominio en la distribución vieja y esperó la propagación.
4️⃣ Deshabilitó la distribución, esperó el estado Deployed, y la eliminó.
5️⃣ Vació y borró el bucket público.
6️⃣ Verificó el dominio en vivo: HTTP 200, sitio nuevo, cero downtime.

Mi trabajo: aprobar cada paso irreversible. Nada más. Y nada menos.

⚠️ Lo que NO delegué:
— La decisión de CUÁNDO decomisionar (esperé validar estabilidad).
— La política de backup antes de borrar (eso es criterio, no ejecución).
— La responsabilidad. Si algo se rompe, el nombre que responde es el mío.

Tiempo total: ~30 minutos supervisando.
El mismo runbook a mano: una tarde completa, con la consola abierta y el corazón en la mano.

Esto es IAOps: la IA ejecuta el runbook, tú pones el criterio.

Guarda este post si administras infraestructura — este patrón (verificar → backup → cambio → validar) es delegable HOY. 🔖

#IAOps #AISRE #AWS #CloudComputing #DevOps

---

## POST 4 (Viernes) — Juniors
**Pilar:** guía junior · **CTA:** compartir

"Ya no vale la pena entrar a infraestructura. La IA va a hacer todo."

Me lo escribió un estudiante hace poco. Mi respuesta lo sorprendió:

Estás viendo la mitad equivocada de la ecuación.

Cuando yo empecé, "entrar a operaciones" era:
— Años haciendo tickets repetitivos
— Turnos de madrugada revisando logs
— Memorizar comandos que hoy nadie usa
— Esperar 5 años para que te dejaran tocar producción

Eso es lo que la IA está matando. Y qué bueno que lo mate.

Lo que la IA NO hace (y alguien tiene que hacer):
→ Decidir QUÉ se construye y por qué
→ Revisar lo que el agente propone antes de que toque producción
→ Responder cuando algo falla a las 3 a.m. (la IA no da la cara)
→ Diseñar la arquitectura que el agente va a ejecutar
→ Ponerle límites: qué puede hacer solo y qué requiere aprobación

Ese rol — el que dirige agentes — es el trabajo nuevo. Y casi nadie lo está aprendiendo.

Un junior con IA hoy opera lo que hace 5 años exigía un equipo entero. Yo lo veo en mi propia infraestructura todas las semanas.

La IA no te quitó el trabajo.
Te quitó las excusas.

Comparte esto con alguien que esté dudando de entrar a cloud. 📤

#IAOps #AISRE #CloudComputing #CarreraTI #InteligenciaArtificial
