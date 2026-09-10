# Sesión 2 · Lab: la caja de herramientas + Linux real en EC2 — guía del docente

**Enfoque (opción B):** el Linux real donde se practican los comandos es una **instancia EC2 (Ubuntu)**
lanzada por cada estudiante, conectada por **EC2 Instance Connect** (navegador, sin llaves .pem ni
cliente SSH). Prerequisito: cuenta AWS activa (se pidió en la sesión 1).

**Fallback obligatorio para sin-cuenta/sin-tarjeta:** killercoda.com → Playgrounds → Ubuntu
(Linux real, navegador, gratis, sin registro). TODOS los labs corren igual ahí.

## Los instaladores/cuentas (links para el chat)
1. GitHub: https://github.com/signup  ·  repo `bitacora-[empresa]` público con README
2. AWS free tier PERSONAL: https://aws.amazon.com/free (prerequisito de la sesión 1)
3. VS Code (local, para el semestre): https://code.visualstudio.com/download
4. Terraform (local): Windows `winget install HashiCorp.Terraform` · macOS `brew install hashicorp/tap/terraform`

## LANZAR LA INSTANCIA EC2 (el corazón de hoy)
Consola AWS → región **N. Virginia (us-east-1)** → servicio **EC2** → **Launch instance**:
- Name: `mi-primer-servidor`
- AMI: **Ubuntu** (marca "Free tier eligible")
- Type: **t2.micro** o **t3.micro** (Free tier)
- Key pair: **Proceed without a key pair** ← clave para evitar el lío de .pem
- Network: ✓ **Allow SSH traffic from Anywhere (0.0.0.0/0)**
- **Launch instance** → Instances → esperar **Running** (~1 min)

## CONECTARSE (sin SSH client, sin llaves)
Instancia → **Connect** → pestaña **EC2 Instance Connect** → **Connect** → terminal en el navegador
con `ubuntu@ip-...:~$`. Eso es Ubuntu 100% real.

> Nota de por qué "Proceed without a key pair" funciona con Instance Connect: EC2 Instance Connect
> inyecta una llave temporal por 60s al conectar desde la consola. No necesitas gestionar .pem.
> (En módulo 2, cuando enseñemos SSH "de verdad", sí generamos y usamos key pairs.)

## LABS (todos DENTRO de la instancia)
- Lab 1 ubicarse: `whoami` `pwd` `ls -la` `uname -a` `cd / && ls` `cd ~` `clear`
- Lab 2 construir: `mkdir` `echo >` `cat` `cp` `mv` `rm` (⚠️ rm sin papelera)
- Lab 3 git: `git config --global user.name/…email` · `git clone https://github.com/USER/bitacora-*.git`
  (clonar público NO pide clave)

## EL PUSH DESDE EL SERVIDOR → necesita TOKEN de GitHub
En un servidor no hay Credential Manager. Para `git push` sobre HTTPS, GitHub pide usuario + **token**
(no la contraseña — GitHub ya no acepta contraseña por git). Crear el token (1 min, pegar pasos al chat):
1. github.com → foto (arriba der.) → **Settings** → abajo **Developer settings**
2. **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**
3. Note: `esumer` · Expiration: 90 days · Scope: ✓ **repo** · **Generate token**
4. **COPIAR el token** (empieza por `ghp_...`) — no se vuelve a mostrar. Guardarlo temporal.
En el push: `git push` → Username: tu-usuario · Password: **pegar el token** (no se ve al pegar, es normal).
> Minuto de seguridad en vivo: ese token ES una llave — jamás pegarlo en un archivo del repo ni compartirlo.

## EL RITO (en la instancia, dentro de bitacora-*)
```bash
mkdir planos materiales && echo "Somos [empresa]" > materiales/lema.txt
git add . && git commit -m "Primeras piezas de la casa" && git push   # pide user + token
```
→ abrir github.com/[user]/bitacora-* → las carpetas aparecen. El servidor Linux publicó en internet.

## RETO DEL TESORO (pegar en el chat)
```bash
mkdir -p ~/tesoro/puerto/{bodega,muelle} ~/tesoro/isla/{selva,volcan/cueva} ~/tesoro/barco
echo "Pista: el tesoro no está en el agua. Busca TIERRA firme." > ~/tesoro/barco/bitacora.txt
echo "Pista: donde hay fuego hubo riqueza. Sube al lugar más caliente." > ~/tesoro/isla/selva/mapa-roto.txt
echo "Pista: los piratas esconden en lo profundo. Busca un hueco oscuro." > ~/tesoro/isla/volcan/marca-x.txt
echo "FELICIDADES 🏴‍☠️ — código secreto: SERVIDOR-VIVO-$RANDOM" > ~/tesoro/isla/volcan/cueva/.cofre.txt
echo "Aquí no hay nada... ¿o no revisaste lo OCULTO? (pista: ls -a)" > ~/tesoro/isla/volcan/cueva/leeme.txt
cd ~/tesoro && echo "El mapa está listo. Empieza con: ls"
```
Solución: `cd ~/tesoro` → `ls` → `cat barco/bitacora.txt` → `isla/selva/mapa-roto.txt` →
`isla/volcan/marca-x.txt` → `cueva/` → `ls -a` → `cat .cofre.txt`
Cierre: guardar el código en `~/bitacora-*/tesoro.md` y push.

## ⚠️ APAGAR LA INSTANCIA — PASO NO NEGOCIABLE (hacerlo JUNTOS al final)
Instancia → **Instance state** → **Terminate** (hoy, como fue de práctica) o **Stop** (para reusar).
Verificar estado **Stopped/Terminated**. Con 40 estudiantes, instancias olvidadas = facturas sorpresa.
Al inicio de la próxima clase: revisar en consola que nadie dejó nada corriendo.

## Riesgos conocidos y mitigación
- **Sin tarjeta / cuenta AWS** → Killercoda (mismos labs, sin AWS). No se atrasan.
- **Instance Connect falla** ("unable to connect") → suele ser el security group sin puerto 22:
  editar security group de la instancia → Inbound → Add rule → SSH → Anywhere. O usar Killercoda.
- **La instancia no lanza** (límite/verificación de cuenta nueva) → Killercoda; el EC2 queda de misión.
- **Push falla** → 99% es token mal copiado o sin scope `repo`. Regenerar.
- **Olvidan apagar** → recordatorio en el grupo esa misma noche + revisión al inicio de sesión 3.

## Producto (rúbrica)
cheatsheet-terminal.md subido por push desde el servidor: ✔ 12+ comandos ✔ descripción propia ✔ ejemplo real.
Bonus: tesoro.md + instancia apagada (pantallazo del estado Stopped/Terminated).
