# RED-02 · Clase 7 — Registro de asistencia

**Grupo:** RED-02 · Cloud Computing, Redes y Ciberseguridad (Mié/Vie)
**Fecha:** 2026-09-30 · Sesión 7 (virtual) — "¿Qué es realmente tu EC2? Virtualización, AMI y snapshots"
**Contenido visto:** dónde están los data centers (región → AZ → data center → rack → servidor), qué es un hipervisor y AWS Nitro, reuso de recursos, hipervisor tipo 1 vs. tipo 2, VM vs. contenedor (Docker), x86 vs. ARM, snapshot vs. AMI; LAB de comandos (lscpu, free, df, ip, metadatos), LAB snapshot (dañar y restaurar la web) y LAB AMI (clonar el servidor).
**Fuente:** ticket de salida (Google Form, 20 respuestas) **+ lista de asistentes del transcript de Google Meet** (Drive Esumer), cruzados contra el **listado oficial actualizado al 2026-09-29** (24). El Meet cuenta como presencia.
**Hoja de respuestas:** https://docs.google.com/spreadsheets/d/1Xo6v2oRgU2JJy9zkP7Gn0UmbExM7xuSLYDA4b4LA81s/edit
**Presentes: 19 · Ausentes: 5**

> ⚠️ Desde esta clase se usa la **numeración del listado actualizado** (salen Pablo Grajales y Jairo Gutiérrez; Dany Arias → #17 … Juan Camilo Córdoba → #22; Beatriz Rivera #23; Jeison Hernández #24). Las clases 2–6 usan la numeración anterior.

## Ausentes (los que se desmarcan en la plataforma)
| # | Nombre |
|---|---|
| 2 | Alexander Villada Ospina |
| 8 | Oscar Fernando Placeres Ospino |
| 12 | Ronal Alexis Upegui Galvis |
| 16 | Laura Cristina Mejía Carmona |
| 21 | Brayan Stiven Aristizábal Puerta |

## Presentes (19)
Por # de roster: #1 · #3 · #4 · #5 · #6 · #7 · #9 · #10 · #11 · #13 · #14 · #15 · #17 · #18 · #19 · #20 · #22 · #23 · #24

## Notas
- **Doble fuente:** 20 tickets (21:13–21:20) + Meet. Coincidencia total entre ticket y Meet para los 19 estudiantes del listado.
- Cruce por nombre/alias: "Edwin Tejada" / "edwi de Jesús" = Edwin de Jesús Gutiérrez Tejada #9 · "Emmanuel P" = #10 · "Hildebrando / ILDEBRANDO Montoya" = #6 · "Josue Diaz" = Freidel Josué Díaz #19 · "camilo romero loaiza" = #20 · "Jason Hernandez" = Jeison Hernández #24 · "Beatriz Elena Rivera C" = #23.
- ⚠️ **Jairo Andrés Gutiérrez Rodríguez** ("Andres Gutierrez" en el Meet) asistió, participó en el chat y diligenció el ticket, pero **ya no figura en el listado de RED-02** → reportado a coordinación como "asiste y no está en el grupo"; confirmar su matrícula.
- **No cuentan:** Alejandro Barrera Correa y su "Presentation" (docente) · "Dany's Fathom Notetaker" (bot de notas de Dany #17) · victor santamaria (externo recurrente, no matriculado).
