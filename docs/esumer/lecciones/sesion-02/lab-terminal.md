# Sesión 2 · Lab de terminal — guía del docente

## El script del tesoro (pegar en el chat cuando llegue el RETO)

```bash
mkdir -p ~/tesoro/puerto/{bodega,muelle} ~/tesoro/isla/{selva,volcan/cueva} ~/tesoro/barco
echo "Pista: el tesoro no está en el agua. Busca TIERRA firme." > ~/tesoro/barco/bitacora.txt
echo "Pista: donde hay fuego hubo riqueza. Sube al lugar más caliente." > ~/tesoro/isla/selva/mapa-roto.txt
echo "Pista: los piratas esconden en lo profundo. Busca un hueco oscuro." > ~/tesoro/isla/volcan/marca-x.txt
echo "FELICIDADES 🏴‍☠️ — código secreto: TERMINAL-DOMADA-$RANDOM" > ~/tesoro/isla/volcan/cueva/.cofre.txt
echo "Aquí no hay nada... ¿o revisaste lo OCULTO? (pista: ls -a)" > ~/tesoro/isla/volcan/cueva/leeme.txt
cd ~/tesoro && echo "El mapa está listo. Empieza con: ls"
```

Detalles con intención: el tesoro es un archivo **oculto** (`.cofre.txt`) → obliga `ls -a`
(lo enseñaste en Lab 1); el `$RANDOM` hace único cada código → no se lo pueden soplar.

## Solución (para ti)
`cd ~/tesoro` → `ls` → leer `barco/bitacora.txt` → `isla/` → `selva/mapa-roto.txt` →
`volcan/marca-x.txt` → `cueva/` → `ls -a` → `cat .cofre.txt`

## Checkpoints virtuales (el pulso de la clase)
- Tras cada lab: "peguen en el chat el resultado de X" (pwd / su lema.txt / su history | grep)
- Quien no responde 2 checkpoints seguidos → mensaje directo: "¿vas bien? ¿en qué paso estás?"
- Los 4 con AWS listo temprano: nombrarlos "monitores" del chat (responden dudas de los demás)

## Plan B / C
- Sin cuenta AWS aún → **webvm.io** (Linux en navegador, sin registro; todo el lab funciona)
- CloudShell caído/lento → webvm.io también
- Estudiante solo-celular conectado → puede seguir con webvm en el navegador del celular (teclado en pantalla — no ideal, pero participa) y completar en sala de cómputo

## Producto (rúbrica rápida)
cheatsheet-terminal.md en la bitácora: ✔ 12+ comandos ✔ descripción propia (no copiada) ✔ un ejemplo real de su sesión
