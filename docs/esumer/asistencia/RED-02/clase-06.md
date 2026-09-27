# RED-02 · Clase 6 — Registro de asistencia

**Grupo:** RED-02 · Cloud Computing, Redes y Ciberseguridad (Mié/Vie)
**Fecha:** 2026-09-25 · Sesión 6 (virtual) — "Tu red empresarial en AWS: rangos, tamaños y subredes"
**Contenido visto:** direccionamiento IPv4 (calle y casa, máscara, por qué cada número vale 8), redes privadas RFC 1918 y quién asigna las públicas, por qué AWS va de /16 a /28, subnetting (partir una calle), calculadora CIDR, cálculo de la subred del propio EC2 (`ip -brief a`, `ip route`), broadcast, diseño VLSM de la red de la pyme y LAB de VPC + subredes + Internet Gateway + ruta pública + EC2.
**Fuente:** ticket de salida (Google Form) **+ lista de participantes de Google Meet**, cruzados contra el roster oficial (24 activos; Pablo Grajales #17 retirado). El Meet cuenta como presencia.
**Hoja de respuestas:** https://docs.google.com/spreadsheets/d/1Xo6v2oRgU2JJy9zkP7Gn0UmbExM7xuSLYDA4b4LA81s/edit
**Presentes: 17 · Ausentes: 7**

## Ausentes (los que se desmarcan en la plataforma)
| # | Nombre |
|---|---|
| 2 | Alexander Villada Ospina |
| 9 | Edwin de Jesús Gutiérrez Tejada |
| 10 | Emmanuel Pérez Castrillón |
| 11 | Ana Catalina Acevedo García |
| 12 | Ronal Alexis Upegui Galvis |
| 14 | Juan David Taborda Taborda |
| 16 | Laura Cristina Mejía Carmona |

## Presentes (17)
Por # de roster: #1 · #3 · #4 · #5 · #6 · #7 · #8 · #13 · #15 · #18 · #19 · #20 · #21 · #22 · #23 · #24 · #25

## Notas
- **Doble fuente:** los 17 del Meet diligenciaron el ticket (marca temporal 25/09/2026 20:58–21:03, dentro de la franja de cierre). Coincidencia total entre Meet y ticket. Sin falsificación.
- Cruce por nombre / apodo: "Beatry Rivera" = Beatriz Elena Rivera #24 · "Jason Hernandez" = Jeison Hernández #25 · "Hildebrando / ILDEBRANDO Montoya" = #6 · "Josue Diaz" = Freidel Josué Díaz #20 · "camilo romero loaiza" = Edwin Camilo Romero #21 · "juanjo alvarez vasquez" = #5 · "Juanjo Londoño" = #13 · "Oscar W. Macias M." = Oscar Walter Macías #7.
- **Entradas del Meet que no cuentan:** *Alejandro Barrera Correa* y *Alejandro Barrera Correa's Presentation* — docente · *Dany's Fathom Notetaker* — bot de notas de Dany Arias (#18, ya contado) · entradas duplicadas de Dany Arias.
- Yoimer Barrera (#19) compartió pantalla en vivo para el LAB de cálculo de subred.
