# Semana 2 — Valor táctico (runbooks, anti-toil)

---

## POST 5 (Lunes) — Lista de delegación
**Pilar:** autoridad enterprise · **CTA:** guardar

Los 5 trabajos de operación que ya delego a la IA — y los 3 que jamás delegaré.

Después de meses operando mi nube con agentes, esta es mi frontera real:

✅ 𝗗𝗲𝗹𝗲𝗴𝗮𝗱𝗼:

1. Ejecución de deploys — pipeline + agente que verifica el resultado y me reporta.
2. Runbooks de cambio (DNS, certificados, cutovers) — la secuencia verificar→backup→cambiar→validar es delegable de principio a fin.
3. Auditoría de costos — el agente barre las 3 nubes y me trae dónde se fuga el dinero.
4. Primera respuesta a incidentes — diagnóstico inicial, recolección de evidencia, hipótesis.
5. Documentación — el runbook se escribe solo mientras se ejecuta. Se acabó el "después lo documento".

❌ 𝗡𝘂𝗻𝗰𝗮:

1. La aprobación de acciones irreversibles. Borrar, decomisionar, cortar tráfico: SIEMPRE pasa por mí.
2. La decisión de arquitectura. La IA propone opciones brillantes; elegir cuál sobrevive 5 años es criterio humano.
3. La responsabilidad. Cuando algo falla, el agente no va a la reunión post-mortem. Voy yo.

La regla que me funciona:

𝗟𝗮 𝗜𝗔 𝗲𝗷𝗲𝗰𝘂𝘁𝗮 𝘁𝗼𝗱𝗼 𝗹𝗼 𝗿𝗲𝘃𝗲𝗿𝘀𝗶𝗯𝗹𝗲. 𝗟𝗼 𝗶𝗿𝗿𝗲𝘃𝗲𝗿𝘀𝗶𝗯𝗹𝗲 𝗲𝘅𝗶𝗴𝗲 𝗺𝗶 𝗳𝗶𝗿𝗺𝗮.

Guárdalo: es la línea que deberías dibujar antes de soltar un agente en tu infraestructura. 🔖

#IAOps #AISRE #AIOps #CloudComputing #DevOps

---

## POST 6 (Miércoles) — El puente para veteranos
**Pilar:** carrera veterana · **CTA:** comentar

A ti, que llevas 15 años en on-premise y sientes que el tren te dejó:

El tren no te dejó. Estás parado en la estación equivocada.

Todos los días veo ingenieros brillantes — DBAs, sysadmins, gente de datacenter — convencidos de que "esto de la IA" los volvió obsoletos.

La ironía: son los MEJOR posicionados para dirigir la operación con IA. Mejor que muchos juniors cloud-native.

¿Por qué? Porque dirigir un agente de IA exige exactamente lo que tú ya tienes:

→ Saber QUÉ puede salir mal (te ha salido mal todo, durante años)
→ Oler un cambio peligroso antes de ejecutarlo
→ Entender el negocio detrás del sistema
→ Saber cuándo NO tocar producción

Eso no se aprende en un curso de 6 meses. Se aprende en 15 años de madrugadas.

Lo que te falta es más pequeño de lo que crees:
1. Fundamentos de UNA nube (no las tres — una)
2. Git y un pipeline básico (una semana de práctica)
3. Aprender a darle instrucciones y límites a un agente de IA (semanas, no años)

Tu experiencia + esas 3 piezas = el perfil que las empresas van a pelear en 2027.

No eres el pasado de la infraestructura. Eres el criterio que la IA no tiene.

¿Vienes de on-premise? Cuéntame en los comentarios qué te está frenando — respondo todos. 👇

#IAOps #AISRE #CarreraTI #CloudComputing #OnPremise

---

## POST 7 (Jueves) — Anti click-ops técnico
**Pilar:** operación en vivo · **CTA:** guardar

Mi infraestructura se publica sola. Yo no toco la consola.

Así funciona el sistema (y por qué la consola es el enemigo):

El stack de mis sitios y servicios personales:

→ Terraform define TODO: buckets privados, CDN, certificados, DNS. Si no está en código, no existe.
→ GitHub Actions con OIDC: el pipeline asume un rol temporal en la nube. Cero llaves guardadas, cero secretos eternos.
→ Push a main = infra aplicada + contenido publicado + caché invalidada. Un solo evento, todo el flujo.
→ Un agente de IA escribe los cambios de Terraform, los valida, y me muestra el plan. Yo apruebo. El pipeline ejecuta.

¿El resultado? Cada cambio queda:
✔ Versionado (sé qué cambió, cuándo y por qué)
✔ Revisado (nada llega a producción sin un plan aprobado)
✔ Reproducible (puedo reconstruir todo desde cero)

Ahora compara con la nube "de clicks":
✘ ¿Quién cambió ese security group? Nadie sabe.
✘ ¿Puedes reconstruir el ambiente? Reza.
✘ ¿Auditoría? La memoria de alguien que ya renunció.

El click en la consola es deuda técnica instantánea: funciona hoy y nadie sabe por qué mañana.

Si todavía operas con clicks, no necesitas IA primero. Necesitas código primero — la IA llega sola después, porque los agentes hablan código, no clicks.

Guarda este stack como referencia. 🔖

#IAOps #AISRE #Terraform #DevOps #AWS

---

## POST 8 (Viernes) — Opinión contraria
**Pilar:** autoridad · **CTA:** debate en comentarios

Opinión impopular después de 10+ años operando infraestructura:

El 80% de los clicks que haces en la consola de tu nube son toil que una IA ejecuta mejor que tú.

Y lo digo habiendo sido el rey de la consola.

Revisar logs uno por uno. Crear recursos a mano. Copiar ARNs entre pestañas. Repetir el mismo checklist de despliegue por enésima vez. Buscar en 5 servicios por qué subió la factura.

Todo eso lo hace hoy un agente en minutos, sin aburrirse, sin saltarse pasos, documentando mientras ejecuta.

"¿Entonces el 80% de mi trabajo sobra?"

No. El 80% de tu trabajo estaba SECUESTRADO por tareas que no eran tu trabajo.

Tu trabajo real siempre fue el otro 20%:
→ Diseñar sistemas que aguanten el pico de tráfico
→ Decidir qué riesgo se acepta y cuál no
→ Entender por qué el negocio necesita esa arquitectura
→ Formar al equipo que viene detrás

La IA no vino por tu puesto. Vino por tu toil.

Los que entiendan la diferencia van a tener los mejores 10 años de su carrera.
Los que defiendan sus clicks… van a defender un puesto que ya no existe.

¿De acuerdo o me equivoco? Argumenta en los comentarios — leo todos. 👇

#IAOps #AISRE #AIOps #CloudComputing #DevOps
