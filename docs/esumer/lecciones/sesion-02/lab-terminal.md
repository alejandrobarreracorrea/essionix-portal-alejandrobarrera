# Sesión 2 · Lab: monta tu taller (Git + VS Code + Linux local) — guía del docente

**Enfoque:** herramientas en la máquina PERSONAL de cada estudiante. Nada provisto por la
universidad, nada en la nube de terceros. Entornos:
- **Windows** → Git Bash (viene con Git) para hoy · **WSL/Ubuntu** como Linux completo (se deja instalando)
- **macOS** → Terminal nativa (ya es Unix)
- **Plan B navegador** → killercoda.com (Playgrounds → Ubuntu): terminal PURA a pantalla completa, gratis con login GitHub, ~1h por sesión (suficiente para el lab)
- **Solo celular** → Killercoda en el navegador del celular o Termux (Android); completar en sala de cómputo 5º piso bloque 3

## Los 3 instaladores (links para el chat)
- Git (Windows, incluye Git Bash): https://git-scm.com/download/win — TODO por defecto
- VS Code: https://code.visualstudio.com/download
- WSL (Windows 10/11, PowerShell COMO ADMINISTRADOR): `wsl --install` → reiniciar → abrir "Ubuntu" → crear usuario/clave
- macOS: `git --version` en Terminal dispara la instalación de Command Line Tools

## Autenticación de git SIN dolor
`git clone https://github.com/USUARIO/bitacora-X.git` → Git Credential Manager abre el
navegador → "Authorize" → listo para siempre. (En macOS puede pedir token: plan B = gh CLI
o el mismo flujo desde VS Code; tenerlo probado antes de clase.)

## El script del tesoro (pegar en el chat en el RETO — funciona en Git Bash, Terminal, WSL y Killercoda)

```bash
mkdir -p ~/tesoro/puerto/{bodega,muelle} ~/tesoro/isla/{selva,volcan/cueva} ~/tesoro/barco
echo "Pista: el tesoro no está en el agua. Busca TIERRA firme." > ~/tesoro/barco/bitacora.txt
echo "Pista: donde hay fuego hubo riqueza. Sube al lugar más caliente." > ~/tesoro/isla/selva/mapa-roto.txt
echo "Pista: los piratas esconden en lo profundo. Busca un hueco oscuro." > ~/tesoro/isla/volcan/marca-x.txt
echo "FELICIDADES 🏴‍☠️ — código secreto: TALLER-MONTADO-$RANDOM" > ~/tesoro/isla/volcan/cueva/.cofre.txt
echo "Aquí no hay nada... ¿o no revisaste lo OCULTO? (pista: ls -a)" > ~/tesoro/isla/volcan/cueva/leeme.txt
cd ~/tesoro && echo "El mapa está listo. Empieza con: ls"
```

Maldades pedagógicas: cofre **oculto** (obliga `ls -a`) · `$RANDOM` = código único por persona.

**Cierre maestro:** el tesoro está en ~ (FUERA del repo) — al intentar `git add` ahí sale
"not a git repository": la lección de que Git solo ve dentro de la carpeta con `.git`.
```bash
cd ~/bitacora-*        # (o donde clonaron)
echo "Tesoro sesión 2: TALLER-MONTADO-XXXX" > tesoro.md
git add . && git commit -m "Tesoro encontrado" && git push
```

## Solución del tesoro
`cd ~/tesoro` → `ls` → `cat barco/bitacora.txt` → `isla/selva/mapa-roto.txt` →
`isla/volcan/marca-x.txt` → `cueva/` → `ls -a` → `cat .cofre.txt`

## Checkpoints por chat
1. Link del repo ✅ · 2. `git --version` (el número) · 3. VS Code ✅ · 4. resultado de `pwd`
5. clone hecho (`ls` mostrando README) · 6. link de github.com con sus carpetas (el rito)
7. código del tesoro · 8. link de la cheat-sheet
Quien falla 2 seguidos → mensaje directo con nombre propio.

## Riesgos conocidos y mitigación
- **WSL requiere admin + reinicio** → por eso va al FINAL (parada 4) y se termina de misión; nadie se bloquea en clase
- **Antivirus/permisos corporativos** en laptops de trabajo → Killercoda hoy, instalación en casa
- **Windows 7/8 (sin WSL)** → Git Bash cubre todo el curso de terminal básica; VirtualBox+Ubuntu como alternativa (guía aparte si aparece el caso)
- **git clone pide credenciales raras** → verificar que instaló Git CON Git Credential Manager (default)

## Producto (rúbrica rápida)
`cheatsheet-terminal.md` subido POR TERMINAL: ✔ 12+ comandos ✔ descripción propia ✔ un ejemplo real
Bonus: `tesoro.md` + pantallazo del prompt de Ubuntu (WSL) en la bitácora
