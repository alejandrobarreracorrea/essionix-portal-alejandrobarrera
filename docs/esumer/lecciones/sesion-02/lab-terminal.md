# Sesión 2 · Lab: cimientos (Linux + Git en Codespaces) — guía del docente

**Entorno:** GitHub Codespaces (cuenta personal de CADA estudiante, gratis, sin tarjeta).
El Codespace se abre DESDE su repo bitácora → git ya viene autenticado → `push` funciona sin configurar credenciales.
**Toda herramienta del curso es personal y gratuita — nada depende de la universidad.**

## Flujo de cuentas (parada 1)
1. github.com → Sign up (correo personal, usuario profesional)
2. Repo `bitacora-[empresa]` · público · con README
3. Code → Codespaces → Create codespace on main (~1 min)
4. Terminal abajo (☰ → Terminal → New Terminal si no aparece)

## El script del tesoro (pegar en el chat en el RETO)

```bash
mkdir -p ~/tesoro/puerto/{bodega,muelle} ~/tesoro/isla/{selva,volcan/cueva} ~/tesoro/barco
echo "Pista: el tesoro no está en el agua. Busca TIERRA firme." > ~/tesoro/barco/bitacora.txt
echo "Pista: donde hay fuego hubo riqueza. Sube al lugar más caliente." > ~/tesoro/isla/selva/mapa-roto.txt
echo "Pista: los piratas esconden en lo profundo. Busca un hueco oscuro." > ~/tesoro/isla/volcan/marca-x.txt
echo "FELICIDADES 🏴‍☠️ — código secreto: CIMIENTOS-LISTOS-$RANDOM" > ~/tesoro/isla/volcan/cueva/.cofre.txt
echo "Aquí no hay nada... ¿o no revisaste lo OCULTO? (pista: ls -a)" > ~/tesoro/isla/volcan/cueva/leeme.txt
cd ~/tesoro && echo "El mapa está listo. Empieza con: ls"
```

Maldades pedagógicas: el cofre es archivo **oculto** (obliga `ls -a`) y `$RANDOM` hace único
cada código (no hay copy-paste entre compañeros).

**Cierre maestro del reto:** el código encontrado se guarda y SE SUBE:
```bash
cd /workspaces/bitacora-*    # volver al repo (el tesoro estaba en ~, fuera del repo)
echo "Tesoro sesión 2: CIMIENTOS-LISTOS-XXXX" > tesoro.md
git add . && git commit -m "Tesoro encontrado" && git push
```
(Nota: ~ está FUERA del repo — momento perfecto para explicar que Git solo ve lo que está
dentro de la carpeta con `.git`. El error "not a git repository" es una lección, no un fallo.)

## Solución del tesoro (para ti)
`cd ~/tesoro` → `ls` → `cat barco/bitacora.txt` → `isla/selva/mapa-roto.txt` →
`isla/volcan/marca-x.txt` → `cueva/` → `ls -a` → `cat .cofre.txt`

## Checkpoints por chat
- Parada 1: link del repo ✅ · Parada 2: ✅ al ver el `$` · Lab 1: nombre de la carpeta oculta (`.git`)
- Lab 2: contenido de su lema.txt · Rito: link de github.com mostrando planos/ y materiales/
- Reto: el código del cofre · Producto: link de la cheat-sheet en github.com
- Quien falla 2 checkpoints seguidos → mensaje directo con nombre propio

## Plan B / C
- Codespaces lento o bloqueado → **Google Cloud Shell** (shell.cloud.google.com, cuenta Gmail,
  gratis, git incluido; requiere `git clone` con token — solo como respaldo del docente)
- Estudiante solo-celular → Codespaces FUNCIONA en el navegador del celular (github.com/codespaces);
  incómodo pero real. Completar en sala de cómputo 5º piso bloque 3
- WebVM (webvm.io): juguete opcional para practicar comandos SIN red — no puede hacer push (decirlo tal cual)

## Producto (rúbrica rápida)
`cheatsheet-terminal.md` subido POR TERMINAL (push, no editor web): ✔ 12+ comandos ✔ descripción
propia ✔ un ejemplo real de su sesión · Bonus: `tesoro.md` con su código
