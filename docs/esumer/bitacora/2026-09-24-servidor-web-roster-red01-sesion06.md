# Bitácora — Módulo servidor web, roster RED-02 y deck RED-01 sesión 6 (2026-09-24)

Estado del curso Esumer "Cloud, Redes y Ciberseguridad" (Estud-IA) tras la sesión del 23–24 de septiembre.

## 1. Módulo canónico "redes AWS + primer servidor web" (20 slides)
Construido y **reutilizable entre grupos**. Vive en `RED-02/sesion-05/slides.html` (canónico) y se copió a `RED-01/sesion-06/`. Flujo:

1. Puente — "todo lo que aprendiste ya existe en AWS, con otro nombre"
2. **VPC** (tu red privada)
3. **Subred pública / privada**
4. **Internet Gateway** (la puerta al mundo)
5. **NAT Gateway** (la privada sale, nadie entra)
6. **Elastic IP** (dirección pública fija)
7. **Security Groups** (el firewall)
8. **¿Qué es un servidor web?** (navegador ↔ NGINX por HTTP)
9. **Montemos el servidor** (EC2 + IGW + Elastic IP + SG + NGINX)
10. **Tu primera página: index.html** (ejemplo HTML, `/usr/share/nginx/html/`)
11. **LAB 1: publica tu página** (MobaXterm → nginx → editar index.html → navegador)
12. **Tu servidor, capa por capa** — SVG animado tipo **casa**: cimientos EC2 → SO Amazon Linux → NGINX → index.html, cercada por el SG, dentro del lote VPC, con nube de Internet + paquetes (pide/responde) y **pulso en index.html**
13. **El balanceador** (reparte y no se cae)
14. **Arquitectura completa** (todo junto, con nota de producción)
15. **COSTOS: capa gratuita** (validación real de precios AWS)
16–17. **Blindaje** (afina el Security Group + 4 hábitos)
18. **Misión + cierre** (QR de asistencia)

Diagramas SVG animados por concepto + tarjetas "Qué es / En tu casa / Ejemplo".

## 2. Conexión: MobaXterm + llave .ppk (sincronizado en TODOS los decks)
- El Linux real se hace SOLO en EC2. Conexión = **SSH con MobaXterm + llave `.ppk`** sobre Amazon Linux (`ec2-user`). **NO** `ssh -i .pem` en terminal, NO Instance Connect, NO Ubuntu.
- Flujo: Session → SSH → Remote host (IP) + username `ec2-user` → Advanced → Use private key → `.ppk`.
- Se crea el key pair **directo en `.ppk`** al lanzar el EC2 (si quedó `.pem`, se convierte con MobaKeyGen/PuTTYgen).
- Actualizados: `sesion-02` (legacy), `RED-01/s04+s05+s06`, `RED-02/s03+s04+s05`.

## 3. LAB gotchas (vistos en vivo)
- El `index.html` de NGINX es de **root** → editar con **`sudo nano /usr/share/nginx/html/index.html`**. Sin `sudo` → *"File is unwritable"*.
- Atajo de una línea: `echo '<h1>¡Hola! 🚀</h1>' | sudo tee /usr/share/nginx/html/index.html`.
- Reiniciar servicio: `sudo systemctl restart nginx` — pero para ver un **cambio de página basta recargar el navegador** (Ctrl+Shift+R), no reiniciar.

## 4. Costos — validación de capa gratuita (verificado en aws.amazon.com)
- **Gratis siempre:** VPC, subredes, IGW, route tables, Security Groups.
- **Free tier 12 meses:** EC2 `t2/t3.micro` 750 h/mes · IP pública EN USO 750 h/mes · ALB/NLB 750 h/mes.
- **⚠️ NAT Gateway: SIN free tier** — ~$0.045/h (~$32/mes) + $0.045/GB. IP pública ociosa = $0.005/h.
- **Regla del lab:** montar solo **EC2 + IGW + SG** (gratis); NAT y balanceador = solo concepto de producción. Stop/borrar al terminar + activar Billing→Free Tier y alerta de presupuesto.

## 5. Roster RED-02 actualizado (2026-09-24) — aplica DE AQUÍ EN ADELANTE
Lista oficial: **25 listados, Pablo Grajales #17 Retirado → 24 activos**. Correcciones vs. roster viejo:
- **Beatriz Rivera (#24)** y **Alexander Villada (#2)** SÍ son estudiantes (antes se contaban como oyente / alias externo).
- Entran **Emmanuel Pérez (#10)** y **Jeison Hernández (#25)**.
- **"Jairo Andrés Gutiérrez" ya NO figura** en el roster; el roster tiene a **Edwin de Jesús Gutiérrez Tejada (#9)**. ⚠️ **Pendiente verificar** si Jairo = Edwin #9 o si Jairo se dio de baja (en clase 5 asistió "Jairo", no Edwin).
- **Isabel Oquendo** apareció en el Meet pero NO está en el roster → verificar (¿oyente? ¿otro grupo?).
- **Decisión (usuario):** los registros de RED-02 **clase 2–4 se quedan como están**; el roster nuevo solo aplica desde **clase 5**.
- Roster completo con # en `asistencia/RED-02/clase-05.md`.

## 6. Asistencia registrada
- **RED-01 · clase 5** (2026-09-22): **33 / 10** — `asistencia/RED-01/clase-05.md`.
- **RED-02 · clase 5** (2026-09-23): **19 / 5** (24 activos; Pablo retirado no cuenta) — `asistencia/RED-02/clase-05.md`.
- Índice actualizado en `asistencia/README.md`. Fuente: ticket (Google Form) + lista del Meet, cruzados contra el roster; el Meet cuenta como presencia.

## 7. Pendientes
- ⚠️ Confirmar identidad **Jairo Andrés Gutiérrez vs. Edwin Gutiérrez #9** (RED-02) y si **Isabel Oquendo** debe entrar al roster.
- Aclarar quién es **"HABILIDADES DIGITALES"** / **"Servicios y entretenimiento AU"** (alias en los Meet, no cuentan).
- RED-01 va una sesión detrás de RED-02; el módulo servidor web ya está listo para ambos.
