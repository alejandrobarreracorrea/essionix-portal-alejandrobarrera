# Demo 01 — "Claude decomisionó mi infraestructura legacy. Yo solo aprobé."

**Formato:** screen recording 4–5 min (cara opcional en burbuja) · **Publicar:** semana 2 o 3, reemplaza o refuerza el POST 3/7
**Herramientas:** QuickTime/OBS para pantalla · buena luz si va burbuja · micrófono cerca

## Idea central
Mostrar EN PANTALLA lo que el POST 3 cuenta en texto: un agente de IA ejecuta un
runbook peligroso (decomisionar infra que sirve un dominio en vivo) y el humano
solo aprueba los pasos irreversibles. Nada simulado: se re-narra con evidencia
real (historial de la sesión, consola de AWS como VERIFICACIÓN, terminal).

⚠️ Reglas: no mostrar credenciales/ARNs de cuenta completos, ni nombres de nada
relacionado con el empleador. Solo infraestructura personal (alejandrobarrera.net).

## Estructura y guion

### 0:00–0:12 — HOOK (lo primero que se ve: la terminal con el agente)
> "Esta infraestructura llevaba 6 años en producción. La voy a borrar…
> pero no la voy a borrar yo. La va a borrar una IA. Y te voy a mostrar
> por qué eso es MÁS seguro que hacerlo a mano."

### 0:12–0:45 — CONTEXTO (mostrar: sitio viejo vs nuevo, diagrama simple)
> "Mi sitio personal corría desde 2020 en un bucket S3 público con un CloudFront
> viejo. Lo reemplacé por infra moderna: S3 privado, Terraform, pipeline con OIDC.
> El dominio ya apunta a lo nuevo. Falta lo peligroso: apagar lo viejo sin
> tumbar nada. Un error aquí y mi dominio queda muerto."

### 0:45–3:30 — LA OPERACIÓN (pantalla: la conversación con Claude + terminal)
Narrar sobre la secuencia real, pausando en cada punto de aprobación:

1. **Verificación previa** — "Lo primero que hace el agente: verificar que Route53
   ya apunta a la distribución nueva. No asume nada. Verifica." *(mostrar el dig/aws cli)*
2. **Backup antes de tocar** — "Regla mía, no negociable: backup completo del bucket
   ANTES de borrar. 220 archivos. La IA ejecuta la política; la política la pongo yo."
3. **Liberar el alias** — "Quita el dominio de la distribución vieja y ESPERA la
   propagación. Un humano impaciente se salta esta espera. El agente no."
4. **Momento clave — LA APROBACIÓN** *(zoom al prompt de confirmación)* —
   > "Aquí está todo el modelo IAOps en una imagen: el agente pide mi firma para
   > el paso irreversible. La IA ejecuta lo reversible. Lo irreversible exige mi firma."
5. **Eliminación + verificación final** — "Distribución deshabilitada, eliminada,
   bucket vaciado y borrado. Y el paso final que nadie hace a mano: verificar el
   dominio en vivo. HTTP 200. Cero downtime." *(mostrar curl + el sitio cargando)*

### 3:30–4:15 — LA LECCIÓN
> "¿Por qué esto es más seguro que hacerlo a mano? Porque el agente no se salta
> pasos, no se cansa, no confía en su memoria — y documentó todo mientras lo hacía.
> Yo aporté lo que la IA no tiene: el criterio de cuándo hacerlo, la política de
> backup, y la firma en lo irreversible. Esto es IAOps: la IA ejecuta, tú diriges."

### 4:15–4:35 — CIERRE + CTA
> "Voy a seguir documentando mi operación con IA en público: demos, runbooks y
> errores incluidos. Sígueme si quieres ver cómo se opera una nube en 2026.
> Y el runbook completo de esta operación — paso a paso — lo dejo en los comentarios."

## Post que acompaña el video (copy corto)
> Una IA borró mi infraestructura de producción. Fue lo más seguro que hice este mes.
>
> 4 minutos de operación real — sin edición mágica, sin demo de juguete:
> backup → liberar alias → esperar propagación → mi firma → eliminar → verificar.
>
> La IA ejecuta lo reversible. Lo irreversible exige mi firma.
> Eso es IAOps.
>
> Runbook completo en el primer comentario. 👇
>
> #IAOps #AIOps #AWS #CloudComputing

## Primer comentario (el runbook — genera guardados)
Checklist de 6 pasos del decomisionado seguro con agente (verificar DNS → backup →
liberar alias → esperar Deployed → deshabilitar/eliminar → validar en vivo), con los
comandos genéricos de AWS CLI. (Redactar al publicar; base: POST 3.)
