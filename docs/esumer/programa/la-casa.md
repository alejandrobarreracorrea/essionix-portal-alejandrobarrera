# La Casa — el marco didáctico del curso

**Idea:** la infraestructura es una casa. Se construye en orden (nadie pone el techo primero),
cada pieza tiene un porqué, y al final alguien VIVE en ella (los usuarios). Cada sesión del
curso ubica al estudiante en el plano: **"¿qué parte de la casa estamos construyendo hoy?"**

**El nombre del curso vive en la casa** (decirlo explícito, siempre con la palabra técnica):
- **Cloud Computing** = 💧 los servicios públicos (agua y luz por consumo)
- **Redes / Networking** = 🗺 la dirección y las calles (IP, DNS, TCP/IP, VPC)
- **Ciberseguridad** = 🚪 las puertas y cerraduras (llaves, firewalls, IAM)
Linux y Git no están en el título, pero son cimientos y planos: sin ellos no hay casa que asegurar ni conectar.

## El mapa completo

| Pieza de la casa | En infraestructura | Módulo | La pregunta que responde |
|---|---|---|---|
| 🏗 **Los cimientos** | Linux y la terminal | M1 (sem 2) | ¿Sobre qué se construye TODO? |
| 📐 **Los planos** | Git + GitHub | M1 (sem 2) | ¿Dónde queda registrado cómo se construyó? Si se cae, ¿cómo se reconstruye igual? |
| 🗺 **La dirección y las calles** | Redes: IP, DNS, TCP/IP, VPC | M1 (sem 3-4) | ¿Cómo llegan las visitas a la casa? |
| 🧱 **La estructura** (paredes, pisos) | Servidores (EC2) | M2 | ¿Dónde vive lo que la empresa hace? |
| 💧 **Los servicios públicos** (agua, luz) | La nube: pagar por consumo | M2 | ¿Por qué alquilar en vez de construir la represa propia? |
| 🚪 **Puertas y cerraduras** | Seguridad: llaves SSH, IAM, firewalls | M3 | ¿Quién entra, por dónde, con qué llave? |
| 🤖 **La constructora automática** | Terraform + CI/CD | M2/M4 | ¿Cómo se reconstruye la casa desde los planos en minutos? |
| 🏘 **La segunda casa** (si una se inunda) | Balanceo y alta disponibilidad | M4 | ¿Qué pasa el día de la tormenta? |
| 🏡 **La casa habitada** | La web pública de su empresa | M3-M5 | ¿Para quién era todo esto? |

## Reglas de uso en clase

1. **Toda sesión abre con el plano**: la slide de la casa con la pieza de hoy resaltada
   ("hoy: los cimientos"). Ubica sin explicar — 30 segundos.
2. **Todo concepto nuevo se presenta primero como pieza de casa** y después con su nombre
   técnico ("las cerraduras de la casa — en la industria se llaman firewalls").
3. **Los errores también**: "abrieron el puerto 22 al mundo" = "dejaron la puerta de la casa
   abierta con un letrero". El absurdo doméstico hace memorable el riesgo técnico.
4. **El caso de estudio ES la casa**: la empresa ficticia del equipo es la familia que va a
   vivir en ella. El Demo Day es la entrega de la casa.

## Frases ancla (repetir hasta que las digan ellos)

- "Nadie pone el techo antes que los cimientos" → por eso Linux antes que nube
- "Una casa sin planos no se puede reconstruir" → por eso TODO va a Git
- "La dirección de la casa es la IP; el nombre de la familia en el buzón es el DNS"
- "En la nube no compras la casa: pagas el arriendo por segundos"
- "Una llave debajo del tapete no es seguridad" → contraseñas compartidas
